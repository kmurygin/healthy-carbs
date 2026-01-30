package org.kmurygin.healthycarbs.mealplan.service;

import lombok.extern.slf4j.Slf4j;
import org.kmurygin.healthycarbs.auth.service.AuthenticationService;
import org.kmurygin.healthycarbs.email.EmailDetails;
import org.kmurygin.healthycarbs.email.EmailService;
import org.kmurygin.healthycarbs.exception.ForbiddenException;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.MealPlanGeneratedEvent;
import org.kmurygin.healthycarbs.mealplan.MealPlanSource;
import org.kmurygin.healthycarbs.mealplan.MealType;
import org.kmurygin.healthycarbs.mealplan.dto.CreateMealPlanRequest;
import org.kmurygin.healthycarbs.mealplan.dto.ManualMealPlanDayDTO;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.core.GeneticAlgorithm;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.core.Genome;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.fitness.Fitness;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.fitness.FitnessFactory;
import org.kmurygin.healthycarbs.mealplan.model.DietaryProfile;
import org.kmurygin.healthycarbs.mealplan.model.MealPlan;
import org.kmurygin.healthycarbs.mealplan.model.MealPlanDay;
import org.kmurygin.healthycarbs.mealplan.model.Recipe;
import org.kmurygin.healthycarbs.mealplan.repository.MealPlanRepository;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.service.UserService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

@Slf4j
@Service
public class MealPlanService {
    private final GeneticAlgorithm geneticAlgorithm;
    private final RecipeService recipeService;
    private final DietaryProfileService dietaryProfileService;
    private final MealPlanRepository mealPlanRepository;
    private final AuthenticationService authenticationService;
    private final Executor taskExecutor;
    private final FitnessFactory fitnessFactory;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final UserService userService;
    private final EmailService emailService;

    public MealPlanService(
            GeneticAlgorithm geneticAlgorithm,
            RecipeService recipeService,
            DietaryProfileService dietaryProfileService,
            MealPlanRepository mealPlanRepository,
            AuthenticationService authenticationService,
            @Qualifier("applicationTaskExecutor") Executor taskExecutor,
            FitnessFactory fitnessFactory,
            ApplicationEventPublisher applicationEventPublisher,
            UserService userService,
            EmailService emailService
    ) {
        this.geneticAlgorithm = geneticAlgorithm;
        this.recipeService = recipeService;
        this.dietaryProfileService = dietaryProfileService;
        this.mealPlanRepository = mealPlanRepository;
        this.authenticationService = authenticationService;
        this.taskExecutor = taskExecutor;
        this.fitnessFactory = fitnessFactory;
        this.applicationEventPublisher = applicationEventPublisher;
        this.userService = userService;
        this.emailService = emailService;
    }

    public MealPlan save(MealPlan mealPlan) {
        return mealPlanRepository.save(mealPlan);
    }

    @Transactional
    public MealPlan generateMealPlan() {
        User user = authenticationService.getCurrentUser();
        DietaryProfile dietaryProfile = dietaryProfileService.getByUserId(user.getId());

        LocalDate startOfWeek = getStartOfCurrentWeek();
        List<MealPlanDay> days = generateWeeklyDays(dietaryProfile, startOfWeek);
        MealPlan mealPlan = buildMealPlan(user, days);

        return savePlanAndGenerateShoppingList(mealPlan);
    }

    private LocalDate getStartOfCurrentWeek() {
        return LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }

    private List<MealPlanDay> generateWeeklyDays(DietaryProfile profile, LocalDate startOfWeek) {
        Fitness fitness = fitnessFactory.createCalorieFitness(profile);
        DietType dietType = profile.getDietType();

        List<CompletableFuture<MealPlanDay>> futures = Arrays.stream(DayOfWeek.values())
                .map(dayOfWeek -> CompletableFuture.supplyAsync(() -> {
                    Genome bestGenome = geneticAlgorithm.run(
                            () -> randomCandidate(dietType),
                            fitness,
                            dietType
                    );
                    LocalDate date = startOfWeek.plusDays(dayOfWeek.ordinal());
                    return toMealPlanDay(bestGenome, dayOfWeek, date);
                }, taskExecutor))
                .toList();

        return futures.stream()
                .map(CompletableFuture::join)
                .toList();
    }

    private MealPlan buildMealPlan(User user, List<MealPlanDay> days) {
        MealPlan mealPlan = new MealPlan();
        mealPlan.setUser(user);
        mealPlan.setDays(days);
        mealPlan.setSource(MealPlanSource.GENERATED);

        updateWeeklyTotals(mealPlan);

        return mealPlan;
    }

    @Transactional
    public MealPlan savePlanAndGenerateShoppingList(MealPlan mealPlan) {
        MealPlan saved = mealPlanRepository.save(mealPlan);
        applicationEventPublisher.publishEvent(new MealPlanGeneratedEvent(saved));
        return saved;
    }

    public List<MealPlan> getMealPlansHistory() {
        User user = authenticationService.getCurrentUser();
        return mealPlanRepository.findByUser(user);
    }

    public MealPlan findById(Long id) {
        User user = authenticationService.getCurrentUser();
        MealPlan mealPlan = mealPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MealPlan", "id", id));

        if (!Objects.equals(mealPlan.getUser().getId(), user.getId())) {
            throw new ForbiddenException(
                    "MealPlan with id %d is not owned by user %s".formatted(id, user.getUsername())
            );
        }

        return mealPlan;
    }

    @Transactional
    public MealPlan createManualMealPlan(CreateMealPlanRequest request) {
        User creator = authenticationService.getCurrentUser();
        User client = request.clientId() != null
                ? userService.getUserById(request.clientId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.clientId().toString()))
                : creator;

        MealPlan mealPlan = new MealPlan();
        mealPlan.setUser(client);
        mealPlan.setAuthor(creator);
        mealPlan.setSource(MealPlanSource.DIETITIAN);

        LocalDate startDate = request.startDate() != null ? request.startDate() : LocalDate.now();

        List<MealPlanDay> days = request.days().stream()
                .map(dayDto -> createDayFromDto(dayDto, startDate))
                .toList();

        mealPlan.setDays(days);
        updateWeeklyTotals(mealPlan);

        String subject = "Meal plan created";
        String body = String.format(
                "Dietitian %s has prepared a meal plan for you. To check it go to Healthy Carbs app.",
                creator.getFirstName() + " " + creator.getLastName()

        );

        emailService.sendMail(new EmailDetails(
                client.getEmail(),
                body,
                subject
        ));

        return savePlanAndGenerateShoppingList(mealPlan);
    }

    public List<MealPlan> getDietitianMealPlansForClient(Long clientId) {
        User dietitian = authenticationService.getCurrentUser();
        User client = userService.getUserById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", clientId.toString()));

        List<MealPlan> matchedMealPlans = mealPlanRepository.findByUserAndAuthor(client, dietitian);
        log.info("Found {} meal plans for client {}", matchedMealPlans.size(), clientId);
        return matchedMealPlans;
    }

    private MealPlanDay createDayFromDto(ManualMealPlanDayDTO dayDto, LocalDate startDate) {
        MealPlanDay day = new MealPlanDay();
        LocalDate date = startDate.plusDays(dayDto.dayOffset());
        day.setDate(date);
        day.setDayOfWeek(date.getDayOfWeek());

        List<Recipe> recipes = dayDto.recipeIds().stream()
                .map(recipeService::findById)
                .toList();

        recipes.forEach(day::addRecipe);

        double kcal = recipes.stream().mapToDouble(Recipe::getCalories).sum();
        double carbs = recipes.stream().mapToDouble(Recipe::getCarbs).sum();
        double protein = recipes.stream().mapToDouble(Recipe::getProtein).sum();
        double fat = recipes.stream().mapToDouble(Recipe::getFat).sum();

        day.setTotalCalories(kcal);
        day.setTotalCarbs(carbs);
        day.setTotalProtein(protein);
        day.setTotalFat(fat);

        return day;
    }

    private Genome randomCandidate(DietType dietType) {
        Genome genome = new Genome();
        for (MealType mealType : MealType.values()) {
            genome.getGenes().add(recipeService.findRandomForMealPlan(mealType, dietType));
        }
        return genome;
    }

    private MealPlanDay toMealPlanDay(Genome genome, DayOfWeek dayOfWeek, LocalDate date) {
        MealPlanDay day = new MealPlanDay();
        day.setDayOfWeek(dayOfWeek);
        day.setDate(date);
        day.setTotalCalories(genome.getTotalCalories());
        day.setTotalCarbs(genome.getTotalCarbs());
        day.setTotalProtein(genome.getTotalProtein());
        day.setTotalFat(genome.getTotalFat());
        genome.getGenes().forEach(day::addRecipe);
        return day;
    }

    private void updateWeeklyTotals(MealPlan mealPlan) {
        double totalCalories = 0;
        double totalCarbs = 0;
        double totalProtein = 0;
        double totalFat = 0;

        for (MealPlanDay day : mealPlan.getDays()) {
            totalCalories += day.getTotalCalories();
            totalCarbs += day.getTotalCarbs();
            totalProtein += day.getTotalProtein();
            totalFat += day.getTotalFat();
        }

        mealPlan.setTotalCalories(totalCalories);
        mealPlan.setTotalCarbs(totalCarbs);
        mealPlan.setTotalProtein(totalProtein);
        mealPlan.setTotalFat(totalFat);
    }
}
