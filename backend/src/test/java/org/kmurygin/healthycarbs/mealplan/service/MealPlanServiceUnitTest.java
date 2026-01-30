package org.kmurygin.healthycarbs.mealplan.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kmurygin.healthycarbs.auth.service.AuthenticationService;
import org.kmurygin.healthycarbs.email.EmailDetails;
import org.kmurygin.healthycarbs.email.EmailService;
import org.kmurygin.healthycarbs.exception.ForbiddenException;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.MealPlanGeneratedEvent;
import org.kmurygin.healthycarbs.mealplan.MealPlanSource;
import org.kmurygin.healthycarbs.mealplan.dto.CreateMealPlanRequest;
import org.kmurygin.healthycarbs.mealplan.dto.ManualMealPlanDayDTO;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.core.GeneticAlgorithm;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.core.Genome;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.fitness.Fitness;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.fitness.FitnessFactory;
import org.kmurygin.healthycarbs.mealplan.model.DietaryProfile;
import org.kmurygin.healthycarbs.mealplan.model.MealPlan;
import org.kmurygin.healthycarbs.mealplan.model.Recipe;
import org.kmurygin.healthycarbs.mealplan.repository.MealPlanRepository;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.service.UserService;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MealPlanServiceUnitTest {

    @Mock
    private GeneticAlgorithm geneticAlgorithm;
    @Mock
    private RecipeService recipeService;
    @Mock
    private DietaryProfileService dietaryProfileService;
    @Mock
    private MealPlanRepository mealPlanRepository;
    @Mock
    private AuthenticationService authenticationService;
    @Mock
    private FitnessFactory fitnessFactory;
    @Mock
    private ApplicationEventPublisher eventPublisher;
    @Mock
    private UserService userService;
    @Mock
    private EmailService emailService;
    @Mock
    private Fitness fitness;

    private MealPlanService mealPlanService;

    @BeforeEach
    void setUp() {
        mealPlanService = new MealPlanService(
                geneticAlgorithm,
                recipeService,
                dietaryProfileService,
                mealPlanRepository,
                authenticationService,
                Runnable::run,
                fitnessFactory,
                eventPublisher,
                userService,
                emailService
        );
    }

    @Test
    void save_shouldDelegateToRepository() {
        MealPlan input = new MealPlan();
        MealPlan saved = new MealPlan();
        when(mealPlanRepository.save(input)).thenReturn(saved);

        MealPlan result = mealPlanService.save(input);

        assertThat(result).isSameAs(saved);
        verify(mealPlanRepository).save(input);
    }

    @Test
    void savePlanAndGenerateShoppingList_shouldSaveAndPublishEvent() {
        MealPlan input = new MealPlan();
        MealPlan saved = new MealPlan();
        saved.setId(123L);

        when(mealPlanRepository.save(input)).thenReturn(saved);

        MealPlan result = mealPlanService.savePlanAndGenerateShoppingList(input);

        assertThat(result).isSameAs(saved);

        ArgumentCaptor<MealPlanGeneratedEvent> captor = ArgumentCaptor.forClass(MealPlanGeneratedEvent.class);
        verify(eventPublisher).publishEvent(captor.capture());
        assertThat(captor.getValue()).isNotNull();
    }

    @Test
    void generateMealPlan_shouldBuildWeekAndSumTotals_andPublishEvent() {
        User user = User.builder().id(1L).build();

        Genome dayGenome = new Genome();
        dayGenome.setGenes(List.of(Recipe.builder().calories(500.0).carbs(10.0).protein(20.0).fat(5.0).build()));
        dayGenome.setTotalCalories(500.0);
        dayGenome.setTotalCarbs(10.0);
        dayGenome.setTotalProtein(20.0);
        dayGenome.setTotalFat(5.0);

        when(authenticationService.getCurrentUser()).thenReturn(user);
        when(dietaryProfileService.getByUserId(1L))
                .thenReturn(DietaryProfile.builder().dietType(DietType.VEGAN).build());
        when(fitnessFactory.createCalorieFitness(any())).thenReturn(fitness);

        when(geneticAlgorithm.run(any(), any(), any())).thenReturn(dayGenome);
        when(mealPlanRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        MealPlan result = mealPlanService.generateMealPlan();

        assertThat(result.getUser()).isEqualTo(user);
        assertThat(result.getSource()).isEqualTo(MealPlanSource.GENERATED);
        assertThat(result.getDays()).hasSize(7);

        assertThat(result.getTotalCalories()).isEqualTo(500.0 * 7);
        assertThat(result.getTotalCarbs()).isEqualTo(10.0 * 7);
        assertThat(result.getTotalProtein()).isEqualTo(20.0 * 7);
        assertThat(result.getTotalFat()).isEqualTo(5.0 * 7);

        verify(eventPublisher).publishEvent(any(MealPlanGeneratedEvent.class));
        verify(mealPlanRepository).save(any(MealPlan.class));
    }

    @Test
    void getMealPlansHistory_shouldReturnPlansForCurrentUser() {
        User user = User.builder().id(1L).build();
        when(authenticationService.getCurrentUser()).thenReturn(user);
        when(mealPlanRepository.findByUser(user)).thenReturn(List.of(new MealPlan(), new MealPlan()));

        List<MealPlan> history = mealPlanService.getMealPlansHistory();

        assertThat(history).hasSize(2);
        verify(mealPlanRepository).findByUser(user);
    }

    @Test
    void findById_shouldThrowNotFound_whenMissing() {
        User user = User.builder().id(1L).username("user").build();
        when(authenticationService.getCurrentUser()).thenReturn(user);
        when(mealPlanRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> mealPlanService.findById(1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void findById_shouldThrowForbidden_whenNotOwned() {
        User current = User.builder().id(1L).username("currentUser").build();
        User owner = User.builder().id(2L).username("owner").build();

        MealPlan plan = new MealPlan();
        plan.setId(10L);
        plan.setUser(owner);

        when(authenticationService.getCurrentUser()).thenReturn(current);
        when(mealPlanRepository.findById(10L)).thenReturn(Optional.of(plan));

        assertThatThrownBy(() -> mealPlanService.findById(10L))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void findById_shouldReturnMealPlan_whenOwned() {
        User current = User.builder().id(1L).username("currentUser").build();

        MealPlan plan = new MealPlan();
        plan.setId(10L);
        plan.setUser(current);

        when(authenticationService.getCurrentUser()).thenReturn(current);
        when(mealPlanRepository.findById(10L)).thenReturn(Optional.of(plan));

        MealPlan result = mealPlanService.findById(10L);

        assertThat(result).isSameAs(plan);
    }

    @Test
    void createManualMealPlan_shouldCreateForCreator_whenClientIdNull_andSendEmail_andPublishEvent() {
        User creator = User.builder()
                .id(1L).username("dietitian")
                .firstName("Dietitian").lastName("Test")
                .email("creator@test.com")
                .build();

        when(authenticationService.getCurrentUser()).thenReturn(creator);

        Recipe recipe1 = Recipe.builder().id(10L).calories(100.0).carbs(10.0).protein(5.0).fat(2.0).build();
        Recipe recipe2 = Recipe.builder().id(11L).calories(200.0).carbs(20.0).protein(10.0).fat(4.0).build();
        when(recipeService.findById(10L)).thenReturn(recipe1);
        when(recipeService.findById(11L)).thenReturn(recipe2);

        CreateMealPlanRequest request = new CreateMealPlanRequest(
                null,
                null,
                List.of(new ManualMealPlanDayDTO(0, List.of(10L, 11L)))
        );

        when(mealPlanRepository.save(any(MealPlan.class))).thenAnswer(inv -> inv.getArgument(0));

        MealPlan result = mealPlanService.createManualMealPlan(request);

        assertThat(result.getUser()).isEqualTo(creator);
        assertThat(result.getAuthor()).isEqualTo(creator);
        assertThat(result.getSource()).isEqualTo(MealPlanSource.DIETITIAN);

        assertThat(result.getDays()).hasSize(1);
        assertThat(result.getDays().getFirst().getTotalCalories()).isEqualTo(300.0);
        assertThat(result.getDays().getFirst().getTotalCarbs()).isEqualTo(30.0);
        assertThat(result.getDays().getFirst().getTotalProtein()).isEqualTo(15.0);
        assertThat(result.getDays().getFirst().getTotalFat()).isEqualTo(6.0);

        assertThat(result.getTotalCalories()).isEqualTo(300.0);
        assertThat(result.getTotalCarbs()).isEqualTo(30.0);
        assertThat(result.getTotalProtein()).isEqualTo(15.0);
        assertThat(result.getTotalFat()).isEqualTo(6.0);

        ArgumentCaptor<EmailDetails> emailCaptor = ArgumentCaptor.forClass(EmailDetails.class);
        verify(emailService).sendMail(emailCaptor.capture());
        EmailDetails email = emailCaptor.getValue();

        assertThat(email.getRecipient()).isEqualTo(creator.getEmail());
        assertThat(email.getSubject()).isNotBlank();
        assertThat(email.getMsgBody()).isNotBlank();

        verify(eventPublisher).publishEvent(any(MealPlanGeneratedEvent.class));
    }

    @Test
    void createManualMealPlan_shouldCreateForClient_whenClientIdProvided() {
        User dietitian = User.builder()
                .id(1L).username("dietitian")
                .firstName("Dietitian").lastName("Test")
                .email("dietitian@test.com")
                .build();

        User client = User.builder()
                .id(2L).username("client")
                .email("client@test.com")
                .build();

        when(authenticationService.getCurrentUser()).thenReturn(dietitian);
        when(userService.getUserById(2L)).thenReturn(Optional.of(client));

        Recipe recipe1 = Recipe.builder().id(10L).calories(100.0).carbs(10.0).protein(5.0).fat(2.0).build();
        when(recipeService.findById(10L)).thenReturn(recipe1);

        LocalDate start = LocalDate.of(2026, 1, 19);
        CreateMealPlanRequest request = new CreateMealPlanRequest(
                2L,
                start,
                List.of(new ManualMealPlanDayDTO(2, List.of(10L)))
        );

        when(mealPlanRepository.save(any(MealPlan.class))).thenAnswer(inv -> inv.getArgument(0));

        MealPlan result = mealPlanService.createManualMealPlan(request);

        assertThat(result.getUser()).isEqualTo(client);
        assertThat(result.getAuthor()).isEqualTo(dietitian);
        assertThat(result.getSource()).isEqualTo(MealPlanSource.DIETITIAN);

        assertThat(result.getDays()).hasSize(1);
        assertThat(result.getDays().getFirst().getDate()).isEqualTo(start.plusDays(2));

        verify(emailService).sendMail(any(EmailDetails.class));
        verify(eventPublisher).publishEvent(any(MealPlanGeneratedEvent.class));
    }

    @Test
    void getDietitianMealPlansForClient_shouldReturnMatchedPlans() {
        User dietitian = User.builder().id(1L).username("dietitian").build();
        User client = User.builder().id(2L).username("client").build();

        when(authenticationService.getCurrentUser()).thenReturn(dietitian);
        when(userService.getUserById(2L)).thenReturn(Optional.of(client));

        when(mealPlanRepository.findByUserAndAuthor(client, dietitian))
                .thenReturn(List.of(new MealPlan(), new MealPlan(), new MealPlan()));

        List<MealPlan> result = mealPlanService.getDietitianMealPlansForClient(2L);

        assertThat(result).hasSize(3);
        verify(mealPlanRepository).findByUserAndAuthor(client, dietitian);
    }

    @Test
    void getDietitianMealPlansForClient_shouldThrowNotFound_whenClientMissing() {
        User dietitian = User.builder().id(1L).username("dietitian").build();
        when(authenticationService.getCurrentUser()).thenReturn(dietitian);
        when(userService.getUserById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> mealPlanService.getDietitianMealPlansForClient(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
