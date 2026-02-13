package org.kmurygin.healthycarbs.mealplan.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.kmurygin.healthycarbs.config.JwtService;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.IngredientCategory;
import org.kmurygin.healthycarbs.mealplan.MealType;
import org.kmurygin.healthycarbs.mealplan.dto.RecipeDTO;
import org.kmurygin.healthycarbs.mealplan.model.Ingredient;
import org.kmurygin.healthycarbs.mealplan.model.Recipe;
import org.kmurygin.healthycarbs.mealplan.model.RecipeIngredient;
import org.kmurygin.healthycarbs.mealplan.repository.DietTypeRepository;
import org.kmurygin.healthycarbs.mealplan.repository.IngredientRepository;
import org.kmurygin.healthycarbs.mealplan.repository.RecipeRepository;
import org.kmurygin.healthycarbs.storage.StorageProvider;
import org.kmurygin.healthycarbs.user.UserTestUtils;
import org.kmurygin.healthycarbs.user.model.Role;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("RecipeController Integration Tests")
class RecipeControllerIntegrationTest {

    private static final String BASE_URL = "/api/v1/recipes";
    private final String uniqueSuffix = String.valueOf(System.currentTimeMillis());
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RecipeRepository recipeRepository;
    @Autowired
    private IngredientRepository ingredientRepository;
    @Autowired
    private DietTypeRepository dietTypeRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtService;
    @MockitoBean
    private StorageProvider storageProvider;
    private User adminUser;
    private User dietitianUser;
    private User regularUser;
    private Recipe testRecipe;
    private Ingredient testIngredient;
    private DietType standardDietType;
    private String adminToken;
    private String dietitianToken;
    private String userToken;

    @BeforeEach
    void setUp() {
        standardDietType = dietTypeRepository.findByName("STANDARD")
                .orElseGet(() -> dietTypeRepository.save(DietType.builder().name("STANDARD").compatibilityLevel(1).build()));

        adminUser = userRepository.save(
                UserTestUtils.createUserForPersistence("admin_recipe", uniqueSuffix, Role.ADMIN, passwordEncoder));

        dietitianUser = userRepository.save(
                UserTestUtils.createUserForPersistence("dietitian_recipe", uniqueSuffix, Role.DIETITIAN, passwordEncoder));

        regularUser = userRepository.save(
                UserTestUtils.createUserForPersistence("user_recipe", uniqueSuffix, Role.USER, passwordEncoder));

        testIngredient = ingredientRepository.save(Ingredient.builder()
                .name("Test Ingredient Recipe " + uniqueSuffix)
                .unit("grams")
                .caloriesPerUnit(1.5)
                .carbsPerUnit(0.2)
                .proteinPerUnit(0.3)
                .fatPerUnit(0.1)
                .category(IngredientCategory.MEAT)
                .author(dietitianUser)
                .build());

        testRecipe = Recipe.builder()
                .name("Test Recipe")
                .description("Test recipe description")
                .instructions("Test instructions for cooking")
                .mealType(MealType.BREAKFAST)
                .dietType(standardDietType)
                .calories(300.0)
                .carbs(40.0)
                .protein(15.0)
                .fat(10.0)
                .author(dietitianUser)
                .build();
        RecipeIngredient ri = RecipeIngredient.builder()
                .ingredient(testIngredient)
                .quantity(100.0)
                .build();
        testRecipe.addIngredient(ri);
        testRecipe = recipeRepository.save(testRecipe);

        adminToken = jwtService.generateToken(adminUser);
        dietitianToken = jwtService.generateToken(dietitianUser);
        userToken = jwtService.generateToken(regularUser);
    }

    private RecipeDTO createValidRecipeDTO() {
        RecipeDTO dto = new RecipeDTO();
        dto.setName("New Recipe " + System.nanoTime());
        dto.setDescription("New recipe description");
        dto.setInstructions("New recipe instructions");
        dto.setMealType(MealType.LUNCH);
        dto.setDietType("VEGAN");
        dto.setCalories(400.0);
        dto.setCarbs(50.0);
        dto.setProtein(20.0);
        dto.setFat(15.0);
        return dto;
    }

    @Nested
    @DisplayName("GET /recipes")
    class FindAllTests {

        @Test
        @DisplayName("findAll_shouldReturnPaginatedRecipes")
        void findAll_shouldReturnPaginatedRecipes() throws Exception {
            mockMvc.perform(get(BASE_URL)
                            .header("Authorization", "Bearer " + userToken)
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content", isA(java.util.List.class)));
        }

        @Test
        @DisplayName("findAll_withFilters_shouldApplyFilters")
        void findAll_withFilters_shouldApplyFilters() throws Exception {
            mockMvc.perform(get(BASE_URL)
                            .header("Authorization", "Bearer " + userToken)
                            .param("name", "Test")
                            .param("meal", "BREAKFAST"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content[0].name", is("Test Recipe")));
        }
    }

    @Nested
    @DisplayName("GET /recipes/{id}")
    class GetByIdTests {

        @Test
        @DisplayName("getById_whenRecipeExists_shouldReturnRecipe")
        void getById_whenRecipeExists_shouldReturnRecipe() throws Exception {
            mockMvc.perform(get(BASE_URL + "/{id}", testRecipe.getId())
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.id", is(testRecipe.getId().intValue())))
                    .andExpect(jsonPath("$.data.name", is("Test Recipe")));
        }

        @Test
        @DisplayName("getById_whenRecipeNotFound_shouldReturnNotFound")
        void getById_whenRecipeNotFound_shouldReturnNotFound() throws Exception {
            mockMvc.perform(get(BASE_URL + "/{id}", 999999L)
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /recipes")
    class CreateTests {

        @Test
        @DisplayName("create_whenDietitian_shouldReturnCreated")
        void create_whenDietitian_shouldReturnCreated() throws Exception {
            RecipeDTO recipeDTO = createValidRecipeDTO();

            mockMvc.perform(post(BASE_URL)
                            .header("Authorization", "Bearer " + dietitianToken)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(recipeDTO)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.message", is("Recipe created successfully")));
        }

        @Test
        @DisplayName("create_whenAdmin_shouldReturnCreated")
        void create_whenAdmin_shouldReturnCreated() throws Exception {
            RecipeDTO recipeDTO = createValidRecipeDTO();

            mockMvc.perform(post(BASE_URL)
                            .header("Authorization", "Bearer " + adminToken)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(recipeDTO)))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("create_whenUser_shouldReturnForbidden")
        void create_whenUser_shouldReturnForbidden() throws Exception {
            RecipeDTO recipeDTO = createValidRecipeDTO();

            mockMvc.perform(post(BASE_URL)
                            .header("Authorization", "Bearer " + userToken)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(recipeDTO)))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("PUT /recipes/{id}")
    class UpdateTests {

        @Test
        @DisplayName("update_whenDietitian_shouldReturnUpdatedRecipe")
        void update_whenDietitian_shouldReturnUpdatedRecipe() throws Exception {
            RecipeDTO recipeDTO = createValidRecipeDTO();
            recipeDTO.setName("Updated Recipe Name");

            mockMvc.perform(put(BASE_URL + "/{id}", testRecipe.getId())
                            .header("Authorization", "Bearer " + dietitianToken)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(recipeDTO)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.name", is("Updated Recipe Name")));
        }

        @Test
        @DisplayName("update_whenUser_shouldReturnForbidden")
        void update_whenUser_shouldReturnForbidden() throws Exception {
            RecipeDTO recipeDTO = createValidRecipeDTO();

            mockMvc.perform(put(BASE_URL + "/{id}", testRecipe.getId())
                            .header("Authorization", "Bearer " + userToken)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(recipeDTO)))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("DELETE /recipes/{id}")
    class DeleteTests {

        @Test
        @DisplayName("delete_whenDietitian_shouldReturnNoContent")
        void delete_whenDietitian_shouldReturnNoContent() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/{id}", testRecipe.getId())
                            .header("Authorization", "Bearer " + dietitianToken)
                            .with(csrf()))
                    .andExpect(status().isNoContent());
        }

        @Test
        @DisplayName("delete_whenUser_shouldReturnForbidden")
        void delete_whenUser_shouldReturnForbidden() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/{id}", testRecipe.getId())
                            .header("Authorization", "Bearer " + userToken)
                            .with(csrf()))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("GET /recipes/{id}/ingredients")
    class FindAllIngredientsTests {

        @Test
        @DisplayName("findAllIngredients_shouldReturnIngredients")
        void findAllIngredients_shouldReturnIngredients() throws Exception {
            mockMvc.perform(get(BASE_URL + "/{id}/ingredients", testRecipe.getId())
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", isA(java.util.List.class)))
                    .andExpect(jsonPath("$.data.length()", greaterThanOrEqualTo(1)));
        }

        @Test
        @DisplayName("findAllIngredients_whenRecipeNotFound_shouldReturnNotFound")
        void findAllIngredients_whenRecipeNotFound_shouldReturnNotFound() throws Exception {
            mockMvc.perform(get(BASE_URL + "/{id}/ingredients", 999999L)
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /recipes/{recipeId}/ingredients/{ingredientId}")
    class AddIngredientTests {

        @Test
        @DisplayName("addIngredient_whenDietitian_shouldReturnOk")
        void addIngredient_whenDietitian_shouldReturnOk() throws Exception {
            Ingredient newIngredient = ingredientRepository.save(Ingredient.builder()
                    .name("New Ingredient " + System.nanoTime())
                    .unit("grams")
                    .caloriesPerUnit(2.0)
                    .carbsPerUnit(0.3)
                    .proteinPerUnit(0.4)
                    .fatPerUnit(0.2)
                    .category(IngredientCategory.VEGETABLES)
                    .author(dietitianUser)
                    .build());

            mockMvc.perform(post(BASE_URL + "/{recipeId}/ingredients/{ingredientId}",
                            testRecipe.getId(), newIngredient.getId())
                            .header("Authorization", "Bearer " + dietitianToken)
                            .with(csrf())
                            .param("quantity", "200.0"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("addIngredient_whenUser_shouldReturnForbidden")
        void addIngredient_whenUser_shouldReturnForbidden() throws Exception {
            mockMvc.perform(post(BASE_URL + "/{recipeId}/ingredients/{ingredientId}",
                            testRecipe.getId(), testIngredient.getId())
                            .header("Authorization", "Bearer " + userToken)
                            .with(csrf())
                            .param("quantity", "200.0"))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("DELETE /recipes/{recipeId}/ingredients/{ingredientId}")
    class RemoveIngredientTests {

        @Test
        @DisplayName("removeIngredient_whenDietitian_shouldReturnOk")
        void removeIngredient_whenDietitian_shouldReturnOk() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/{recipeId}/ingredients/{ingredientId}",
                            testRecipe.getId(), testIngredient.getId())
                            .header("Authorization", "Bearer " + dietitianToken)
                            .with(csrf()))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("removeIngredient_whenUser_shouldReturnForbidden")
        void removeIngredient_whenUser_shouldReturnForbidden() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/{recipeId}/ingredients/{ingredientId}",
                            testRecipe.getId(), testIngredient.getId())
                            .header("Authorization", "Bearer " + userToken)
                            .with(csrf()))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("GET /recipes/random")
    class GetRandomTests {

        @Test
        @DisplayName("getRandom_shouldReturnRandomRecipe")
        void getRandom_shouldReturnRandomRecipe() throws Exception {
            mockMvc.perform(get(BASE_URL + "/random")
                            .header("Authorization", "Bearer " + userToken)
                            .param("mealType", "BREAKFAST")
                            .param("dietType", "STANDARD"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.mealType", is("BREAKFAST")));
        }
    }

    @Nested
    @DisplayName("POST /recipes/{id}/favourite")
    class AddFavouriteTests {

        @Test
        @DisplayName("addFavourite_shouldReturnNoContent")
        void addFavourite_shouldReturnNoContent() throws Exception {
            mockMvc.perform(post(BASE_URL + "/{id}/favourite", testRecipe.getId())
                            .header("Authorization", "Bearer " + userToken)
                            .with(csrf()))
                    .andExpect(status().isNoContent());
        }
    }

    @Nested
    @DisplayName("DELETE /recipes/{id}/favourite")
    class RemoveFavouriteTests {

        @Test
        @DisplayName("removeFavourite_shouldReturnNoContent")
        void removeFavourite_shouldReturnNoContent() throws Exception {
            // First add the favourite, then remove it
            mockMvc.perform(post(BASE_URL + "/{id}/favourite", testRecipe.getId())
                            .header("Authorization", "Bearer " + userToken)
                            .with(csrf()))
                    .andExpect(status().isNoContent());

            mockMvc.perform(delete(BASE_URL + "/{id}/favourite", testRecipe.getId())
                            .header("Authorization", "Bearer " + userToken)
                            .with(csrf()))
                    .andExpect(status().isNoContent());
        }
    }

    @Nested
    @DisplayName("GET /recipes with onlyFavourites")
    class FindAllWithFavouritesTests {

        @Test
        @DisplayName("findAll_withOnlyFavourites_shouldReturnFavouriteRecipes")
        void findAll_withOnlyFavourites_shouldReturnFavouriteRecipes() throws Exception {
            mockMvc.perform(get(BASE_URL)
                            .header("Authorization", "Bearer " + userToken)
                            .param("onlyFavourites", "true")
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content", isA(java.util.List.class)));
        }
    }
}
