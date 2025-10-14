package org.kmurygin.healthycarbs.mealplan.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.auth.AuthenticationService;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.MealType;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.core.GeneticAlgorithm;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.core.Genome;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.fitness.CalorieFitness;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.fitness.Fitness;
import org.kmurygin.healthycarbs.mealplan.model.DietaryProfile;
import org.kmurygin.healthycarbs.mealplan.model.MealPlan;
import org.kmurygin.healthycarbs.mealplan.model.MealPlanDay;
import org.kmurygin.healthycarbs.mealplan.repository.MealPlanRepository;
import org.kmurygin.healthycarbs.user.User;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

@RequiredArgsConstructor
@Service
public class MealPlanService {
    private final GeneticAlgorithm geneticAlgorithm;
    private final RecipeService recipeService;
    private final DietaryProfileService dietaryProfileService;
    private final MealPlanRepository mealPlanRepository;
    private final AuthenticationService authenticationService;
    private final Executor taskExecutor;

    public MealPlan save(MealPlan mealPlan) {
        return mealPlanRepository.save(mealPlan);
    }

    @Transactional
    public MealPlan generateMealPlan() {
        User user = authenticationService.getCurrentUser();
        DietaryProfile dietaryProfile = dietaryProfileService.getByUserId(user.getId());
        Fitness fitness = new CalorieFitness(dietaryProfile);
        DietType dietType = dietaryProfile.getDietType();

        List<CompletableFuture<MealPlanDay>> futures = Arrays.stream(DayOfWeek.values())
                .map(dayOfWeek -> CompletableFuture.supplyAsync(() -> {
                    Genome bestGenomeForDay = geneticAlgorithm.run(() -> randomCandidate(dietType), fitness, dietType);
                    return toMealPlanDay(bestGenomeForDay, dayOfWeek);
                }, taskExecutor))
                .toList();

        List<MealPlanDay> transientMealPlanDays = futures.stream()
                .map(CompletableFuture::join)
                .toList();

        MealPlan mealPlan = new MealPlan();
        mealPlan.setUser(user);

        mealPlan.setDays(transientMealPlanDays);
        updateWeeklyTotals(mealPlan);

        return mealPlanRepository.save(mealPlan);
    }

    public List<MealPlan> getMealPlansHistory() {
        User user = authenticationService.getCurrentUser();
        return mealPlanRepository.findByUser(user);
    }

    private Genome randomCandidate(DietType dietType) {
        Genome genome = new Genome();
        for (MealType mealType : MealType.values()) {
            genome.getGenes().add(recipeService.findRandom(mealType, dietType));
        }
        return genome;
    }

    private MealPlanDay toMealPlanDay(Genome genome, DayOfWeek dayOfWeek) {
        MealPlanDay day = new MealPlanDay();
        day.setDayOfWeek(dayOfWeek);
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