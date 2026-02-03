package org.kmurygin.healthycarbs.mealplan.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.kmurygin.healthycarbs.auth.service.AuthenticationService;
import org.kmurygin.healthycarbs.email.EmailService;
import org.kmurygin.healthycarbs.mealplan.DietType;
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
import org.kmurygin.healthycarbs.mealplan.repository.RecipeRepository;
import org.kmurygin.healthycarbs.user.UserTestUtils;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.repository.UserRepository;
import org.kmurygin.healthycarbs.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.List;
import java.util.concurrent.Executor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@Import({
        MealPlanService.class,
        MealPlanServiceIntegrationTest.ExecutorConfig.class
})
class MealPlanServiceIntegrationTest {

    @Autowired
    private MealPlanService mealPlanService;
    @Autowired
    private MealPlanRepository mealPlanRepository;
    @Autowired
    private RecipeRepository recipeRepository;
    @Autowired
    private UserRepository userRepository;

    @MockitoBean
    private AuthenticationService authenticationService;
    @MockitoBean
    private DietaryProfileService dietaryProfileService;
    @MockitoBean
    private FitnessFactory fitnessFactory;
    @MockitoBean
    private GeneticAlgorithm geneticAlgorithm;
    @MockitoBean
    private RecipeService recipeService;
    @MockitoBean
    private ApplicationEventPublisher applicationEventPublisher;
    @MockitoBean
    private EmailService emailService;
    @MockitoBean
    private UserService userService;
    @MockitoBean
    private ShoppingListService shoppingListService;

    private User persistedUser;

    @BeforeEach
    void setUp() {
        User testUser = UserTestUtils.createTestUser();
        testUser.setId(null);
        testUser.setUsername("integration_user_" + System.currentTimeMillis());
        testUser.setEmail("integration_" + System.currentTimeMillis() + "@test.com");

        persistedUser = userRepository.save(testUser);
        when(authenticationService.getCurrentUser()).thenReturn(persistedUser);
    }

    @Test
    void shouldPersistGeneratedMealPlan_WithCalculatedMacros() {
        setupMocksForGeneration();

        MealPlan plan = mealPlanService.generateMealPlan();

        assertThat(plan).isNotNull();
        assertThat(plan.getUser().getId()).isEqualTo(persistedUser.getId());

        MealPlan found = mealPlanRepository.findById(plan.getId()).orElseThrow();
        assertThat(found.getTotalCalories()).isEqualTo(3500.0);
        assertThat(found.getDays().getFirst().getTotalCalories()).isNotNull();
    }

    @Test
    void shouldPersistPlanWithRealRelations() {
        User newUser = UserTestUtils.createTestUser();
        newUser.setId(null);
        newUser.setUsername("new_test_user_" + System.currentTimeMillis());
        newUser.setEmail("new_user_" + System.currentTimeMillis() + "@test.com");
        newUser = userRepository.save(newUser);

        when(authenticationService.getCurrentUser()).thenReturn(newUser);
        setupMocksForGeneration();

        MealPlan saved = mealPlanService.generateMealPlan();

        MealPlan found = mealPlanRepository.findById(saved.getId()).orElseThrow();
        assertThat(found.getUser().getId()).isEqualTo(newUser.getId());
        assertThat(found.getTotalCalories()).isEqualTo(3500.0);
        assertThat(found.getDays()).hasSize(7);
        assertThat(found.getDays().getFirst().getTotalCalories()).isNotNull();
    }

    private void setupMocksForGeneration() {
        User currentUser = authenticationService.getCurrentUser();

        when(dietaryProfileService.getByUserId(currentUser.getId()))
                .thenReturn(DietaryProfile.builder().dietType(DietType.builder().id(3L).name("VEGAN").compatibilityLevel(3).build()).build());

        when(fitnessFactory.createCalorieFitness(any())).thenReturn(mock(Fitness.class));

        Recipe recipe = recipeRepository.save(Recipe.builder()
                .name("Standard Healthy Meal")
                .calories(500.0)
                .carbs(50.0)
                .protein(20.0)
                .fat(15.0)
                .instructions("Mix all ingredients in a bowl.")
                .build());

        Genome genome = new Genome();
        genome.setGenes(List.of(recipe));
        genome.setTotalCalories(500.0);

        when(geneticAlgorithm.run(any(), any(), any())).thenReturn(genome);
    }

    @Test
    void shouldCreateManualMealPlan_AndPersistCorrectly() {
        User clientUser = UserTestUtils.createTestUser();
        clientUser.setId(null);
        clientUser.setUsername("client_user_" + System.currentTimeMillis());
        clientUser.setEmail("client_" + System.currentTimeMillis() + "@test.com");
        clientUser = userRepository.save(clientUser);

        when(userService.getUserById(clientUser.getId())).thenReturn(java.util.Optional.of(clientUser));

        Recipe recipe1 = recipeRepository.save(Recipe.builder()
                .name("Recipe 1")
                .calories(100.0)
                .carbs(10.0)
                .protein(10.0)
                .fat(2.0)
                .instructions("Test instructions 1")
                .build());

        Recipe recipe2 = recipeRepository.save(Recipe.builder()
                .name("Recipe 2")
                .calories(200.0)
                .carbs(20.0)
                .protein(20.0)
                .fat(4.0)
                .instructions("Test instructions 2")
                .build());

        when(recipeService.findById(recipe1.getId())).thenReturn(recipe1);
        when(recipeService.findById(recipe2.getId())).thenReturn(recipe2);

        ManualMealPlanDayDTO dayDTO = new ManualMealPlanDayDTO(1, List.of(recipe1.getId(), recipe2.getId()));
        CreateMealPlanRequest request = new CreateMealPlanRequest(
                clientUser.getId(),
                java.time.LocalDate.now(),
                List.of(dayDTO));

        MealPlan createdPlan = mealPlanService.createManualMealPlan(request);

        assertThat(createdPlan).isNotNull();
        assertThat(createdPlan.getId()).isNotNull();
        assertThat(createdPlan.getUser().getId()).isEqualTo(clientUser.getId());
        assertThat(createdPlan.getAuthor().getId()).isEqualTo(persistedUser.getId());
        assertThat(createdPlan.getSource()).isEqualTo(MealPlanSource.DIETITIAN);

        assertThat(createdPlan.getTotalCalories()).isEqualTo(300.0);

        MealPlan found = mealPlanRepository.findById(createdPlan.getId()).orElseThrow();
        assertThat(found.getDays()).hasSize(1);
        assertThat(found.getDays().getFirst().getRecipes()).hasSize(2);
    }

    @Test
    void shouldFindHistoryForUser() {
        MealPlan plan1 = new MealPlan();
        plan1.setUser(persistedUser);
        plan1.setSource(MealPlanSource.GENERATED);
        plan1 = mealPlanRepository.save(plan1);

        MealPlan plan2 = new MealPlan();
        plan2.setUser(persistedUser);
        plan2.setSource(MealPlanSource.GENERATED);
        plan2 = mealPlanRepository.save(plan2);

        User otherUser = UserTestUtils.createTestUser();
        otherUser.setId(null);
        otherUser.setUsername("other_" + System.currentTimeMillis());
        otherUser.setEmail("other_" + System.currentTimeMillis() + "@test.com");
        otherUser = userRepository.save(otherUser);

        MealPlan otherPlan = new MealPlan();
        otherPlan.setUser(otherUser);
        otherPlan.setSource(MealPlanSource.GENERATED);
        mealPlanRepository.save(otherPlan);

        List<MealPlan> history = mealPlanService.getMealPlansHistory();

        assertThat(history).hasSize(2);
        assertThat(history).extracting("id").contains(plan1.getId(), plan2.getId());
        assertThat(history).extracting("id").doesNotContain(otherPlan.getId());
    }

    @TestConfiguration
    static class ExecutorConfig {
        @Bean
        public Executor applicationTaskExecutor() {
            return Runnable::run;
        }
    }
}
