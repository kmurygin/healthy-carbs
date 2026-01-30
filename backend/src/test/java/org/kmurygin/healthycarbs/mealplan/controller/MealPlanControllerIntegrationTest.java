package org.kmurygin.healthycarbs.mealplan.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.kmurygin.healthycarbs.config.JwtService;
import org.kmurygin.healthycarbs.mealplan.*;
import org.kmurygin.healthycarbs.mealplan.dto.CreateMealPlanRequest;
import org.kmurygin.healthycarbs.mealplan.dto.ManualMealPlanDayDTO;
import org.kmurygin.healthycarbs.mealplan.model.DietaryProfile;
import org.kmurygin.healthycarbs.mealplan.model.MealPlan;
import org.kmurygin.healthycarbs.mealplan.model.MealPlanDay;
import org.kmurygin.healthycarbs.mealplan.model.Recipe;
import org.kmurygin.healthycarbs.mealplan.repository.DietaryProfileRepository;
import org.kmurygin.healthycarbs.mealplan.repository.MealPlanRepository;
import org.kmurygin.healthycarbs.mealplan.repository.RecipeRepository;
import org.kmurygin.healthycarbs.storage.StorageProvider;
import org.kmurygin.healthycarbs.user.UserTestUtils;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("MealPlanController Integration Tests")
class MealPlanControllerIntegrationTest {

    private static final String BASE_URL = "/api/v1/mealplan";
    private final String uniqueSuffix = String.valueOf(System.currentTimeMillis());
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private MealPlanRepository mealPlanRepository;
    @Autowired
    private RecipeRepository recipeRepository;
    @Autowired
    private DietaryProfileRepository dietaryProfileRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtService;
    @MockitoBean
    private StorageProvider storageProvider;
    private User regularUser;
    private User dietitianUser;
    private User clientUser;
    private MealPlan testMealPlan;
    private Recipe testRecipe;
    private String userToken;
    private String dietitianToken;

    @BeforeEach
    void setUp() {
        regularUser = userRepository.save(
                UserTestUtils.createUserForPersistence("user_mealplan", uniqueSuffix,
                        org.kmurygin.healthycarbs.user.model.Role.USER, passwordEncoder));

        dietitianUser = userRepository.save(
                UserTestUtils.createUserForPersistence("dietitian_mealplan", uniqueSuffix,
                        org.kmurygin.healthycarbs.user.model.Role.DIETITIAN, passwordEncoder));

        clientUser = userRepository.save(
                UserTestUtils.createUserForPersistence("client_mealplan", uniqueSuffix,
                        org.kmurygin.healthycarbs.user.model.Role.USER, passwordEncoder));

        dietaryProfileRepository.save(DietaryProfile.builder()
                .user(regularUser)
                .weight(70.0)
                .height(175.0)
                .age(30)
                .gender(Gender.MALE)
                .dietGoal(DietGoal.MAINTAIN)
                .dietType(DietType.STANDARD)
                .activityLevel(ActivityLevel.MODERATE)
                .calorieTarget(2000.0)
                .carbsTarget(250.0)
                .proteinTarget(150.0)
                .fatTarget(67.0)
                .build());

        testRecipe = recipeRepository.save(Recipe.builder()
                .name("Test Recipe MealPlan")
                .description("Test recipe description")
                .instructions("Test instructions for cooking")
                .mealType(MealType.BREAKFAST)
                .dietType(DietType.STANDARD)
                .calories(300.0)
                .carbs(40.0)
                .protein(15.0)
                .fat(10.0)
                .author(dietitianUser)
                .build());

        MealPlanDay day = MealPlanDay.builder()
                .dayOfWeek(DayOfWeek.MONDAY)
                .date(LocalDate.now())
                .totalCalories(300.0)
                .totalCarbs(40.0)
                .totalProtein(15.0)
                .totalFat(10.0)
                .build();

        testMealPlan = MealPlan.builder()
                .user(regularUser)
                .source(MealPlanSource.GENERATED)
                .totalCalories(300.0)
                .totalCarbs(40.0)
                .totalProtein(15.0)
                .totalFat(10.0)
                .days(new ArrayList<>(List.of(day)))
                .build();
        day.setMealPlan(testMealPlan);
        day.addRecipe(testRecipe);
        testMealPlan = mealPlanRepository.save(testMealPlan);

        userToken = jwtService.generateToken(regularUser);
        dietitianToken = jwtService.generateToken(dietitianUser);
    }

    @Nested
    @DisplayName("GET /mealplan/{id}")
    class FindByIdTests {

        @Test
        @DisplayName("findById_whenMealPlanExists_shouldReturnMealPlan")
        void findById_whenMealPlanExists_shouldReturnMealPlan() throws Exception {
            mockMvc.perform(get(BASE_URL + "/{id}", testMealPlan.getId())
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.id", is(testMealPlan.getId().intValue())));
        }

        @Test
        @DisplayName("findById_whenMealPlanNotFound_shouldReturnNotFound")
        void findById_whenMealPlanNotFound_shouldReturnNotFound() throws Exception {
            mockMvc.perform(get(BASE_URL + "/{id}", 999999L)
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("findById_whenNotOwner_shouldReturnForbidden")
        void findById_whenNotOwner_shouldReturnForbidden() throws Exception {
            String otherUserToken = jwtService.generateToken(clientUser);

            mockMvc.perform(get(BASE_URL + "/{id}", testMealPlan.getId())
                            .header("Authorization", "Bearer " + otherUserToken))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("GET /mealplan/history")
    class GetHistoryTests {

        @Test
        @DisplayName("getHistory_shouldReturnUserMealPlans")
        void getHistory_shouldReturnUserMealPlans() throws Exception {
            mockMvc.perform(get(BASE_URL + "/history")
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", isA(java.util.List.class)))
                    .andExpect(jsonPath("$.data.length()", greaterThanOrEqualTo(1)));
        }

        @Test
        @DisplayName("getHistory_whenNotAuthenticated_shouldReturnForbidden")
        void getHistory_whenNotAuthenticated_shouldReturnForbidden() throws Exception {
            mockMvc.perform(get(BASE_URL + "/history"))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("GET /mealplan/{id}/download")
    class DownloadPdfTests {

        @Test
        @DisplayName("downloadPdf_whenMealPlanExists_shouldReturnPdf")
        void downloadPdf_whenMealPlanExists_shouldReturnPdf() throws Exception {
            mockMvc.perform(get(BASE_URL + "/{id}/download", testMealPlan.getId())
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                    .andExpect(header().string("Content-Disposition",
                            containsString("meal-plan-" + testMealPlan.getId() + ".pdf")));
        }
    }

    @Nested
    @DisplayName("POST /mealplan/manual")
    class CreateManualMealPlanTests {

        @Test
        @DisplayName("createManualMealPlan_whenDietitian_shouldReturnCreated")
        void createManualMealPlan_whenDietitian_shouldReturnCreated() throws Exception {
            ManualMealPlanDayDTO dayDTO = new ManualMealPlanDayDTO(0, List.of(testRecipe.getId()));
            CreateMealPlanRequest request = new CreateMealPlanRequest(
                    clientUser.getId(),
                    LocalDate.now(),
                    List.of(dayDTO));

            mockMvc.perform(post(BASE_URL + "/manual")
                            .header("Authorization", "Bearer " + dietitianToken)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.message", is("Meal plan created successfully")));
        }

        @Test
        @DisplayName("createManualMealPlan_whenInvalidRequest_shouldReturnBadRequest")
        void createManualMealPlan_whenInvalidRequest_shouldReturnBadRequest() throws Exception {
            CreateMealPlanRequest request = new CreateMealPlanRequest(
                    clientUser.getId(),
                    null,
                    List.of());

            mockMvc.perform(post(BASE_URL + "/manual")
                            .header("Authorization", "Bearer " + dietitianToken)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }
}
