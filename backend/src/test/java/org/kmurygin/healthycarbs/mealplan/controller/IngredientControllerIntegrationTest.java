package org.kmurygin.healthycarbs.mealplan.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.kmurygin.healthycarbs.config.JwtService;
import org.kmurygin.healthycarbs.mealplan.IngredientCategory;
import org.kmurygin.healthycarbs.mealplan.dto.IngredientDTO;
import org.kmurygin.healthycarbs.mealplan.model.Ingredient;
import org.kmurygin.healthycarbs.mealplan.repository.IngredientRepository;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("IngredientController Integration Tests")
class IngredientControllerIntegrationTest {

    private static final String BASE_URL = "/api/v1/ingredients";
    private final String uniqueSuffix = String.valueOf(System.currentTimeMillis());

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private StorageProvider storageProvider;

    private User dietitianUser;
    private User regularUser;
    private Ingredient testIngredient;
    private String dietitianToken;
    private String userToken;

    @BeforeEach
    void setUp() {
        dietitianUser = userRepository.save(
                UserTestUtils.createUserForPersistence("dietitian_ing", uniqueSuffix, Role.DIETITIAN, passwordEncoder));

        regularUser = userRepository.save(
                UserTestUtils.createUserForPersistence("user_ing", uniqueSuffix, Role.USER, passwordEncoder));

        testIngredient = ingredientRepository.save(Ingredient.builder()
                .name("Test Ingredient " + uniqueSuffix)
                .unit("grams")
                .caloriesPerUnit(1.5)
                .carbsPerUnit(0.2)
                .proteinPerUnit(0.3)
                .fatPerUnit(0.1)
                .category(IngredientCategory.MEAT)
                .author(dietitianUser)
                .build());

        dietitianToken = jwtService.generateToken(dietitianUser);
        userToken = jwtService.generateToken(regularUser);
    }

    private IngredientDTO createValidIngredientDTO() {
        IngredientDTO dto = new IngredientDTO();
        dto.setName("New Ingredient " + System.nanoTime());
        dto.setUnit("grams");
        dto.setCaloriesPerUnit(2.0);
        dto.setCarbsPerUnit(0.3);
        dto.setProteinPerUnit(0.4);
        dto.setFatPerUnit(0.2);
        dto.setCategory(IngredientCategory.VEGETABLES);
        return dto;
    }

    @Nested
    @DisplayName("GET /ingredients")
    class GetAllTests {

        @Test
        @DisplayName("getAll_shouldReturnAllIngredients")
        void getAll_shouldReturnAllIngredients() throws Exception {
            mockMvc.perform(get(BASE_URL)
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", isA(java.util.List.class)))
                    .andExpect(jsonPath("$.data.length()", greaterThanOrEqualTo(1)));
        }
    }

    @Nested
    @DisplayName("GET /ingredients/page")
    class GetPagedTests {

        @Test
        @DisplayName("getPage_shouldReturnPaginatedResults")
        void getPage_shouldReturnPaginatedResults() throws Exception {
            mockMvc.perform(get(BASE_URL + "/page")
                            .header("Authorization", "Bearer " + userToken)
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content", isA(java.util.List.class)));
        }

        @Test
        @DisplayName("getPage_withNameFilter_shouldFilterResults")
        void getPage_withNameFilter_shouldFilterResults() throws Exception {
            mockMvc.perform(get(BASE_URL + "/page")
                            .header("Authorization", "Bearer " + userToken)
                            .param("name", "Test Ingredient")
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content.length()", greaterThanOrEqualTo(1)));
        }

        @Test
        @DisplayName("getPage_withCategoryFilter_shouldFilterResults")
        void getPage_withCategoryFilter_shouldFilterResults() throws Exception {
            mockMvc.perform(get(BASE_URL + "/page")
                            .header("Authorization", "Bearer " + userToken)
                            .param("category", "MEAT")
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content.length()", greaterThanOrEqualTo(1)));
        }
    }

    @Nested
    @DisplayName("GET /ingredients/{id}")
    class GetByIdTests {

        @Test
        @DisplayName("getById_whenExists_shouldReturnIngredient")
        void getById_whenExists_shouldReturnIngredient() throws Exception {
            mockMvc.perform(get(BASE_URL + "/{id}", testIngredient.getId())
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.id", is(testIngredient.getId().intValue())))
                    .andExpect(jsonPath("$.data.name", is(testIngredient.getName())));
        }

        @Test
        @DisplayName("getById_whenNotFound_shouldReturn404")
        void getById_whenNotFound_shouldReturn404() throws Exception {
            mockMvc.perform(get(BASE_URL + "/{id}", 999999L)
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /ingredients")
    class CreateTests {

        @Test
        @DisplayName("create_whenDietitian_shouldReturnCreated")
        void create_whenDietitian_shouldReturnCreated() throws Exception {
            IngredientDTO dto = createValidIngredientDTO();

            mockMvc.perform(post(BASE_URL)
                            .header("Authorization", "Bearer " + dietitianToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.message", is("Ingredient created successfully")));
        }

        @Test
        @DisplayName("create_whenUser_shouldReturnForbidden")
        void create_whenUser_shouldReturnForbidden() throws Exception {
            IngredientDTO dto = createValidIngredientDTO();

            mockMvc.perform(post(BASE_URL)
                            .header("Authorization", "Bearer " + userToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("PUT /ingredients/{id}")
    class UpdateTests {

        @Test
        @DisplayName("update_whenDietitianOwner_shouldReturnUpdated")
        void update_whenDietitianOwner_shouldReturnUpdated() throws Exception {
            IngredientDTO dto = createValidIngredientDTO();
            dto.setName("Updated Ingredient " + System.nanoTime());

            mockMvc.perform(put(BASE_URL + "/{id}", testIngredient.getId())
                            .header("Authorization", "Bearer " + dietitianToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("update_whenUser_shouldReturnForbidden")
        void update_whenUser_shouldReturnForbidden() throws Exception {
            IngredientDTO dto = createValidIngredientDTO();

            mockMvc.perform(put(BASE_URL + "/{id}", testIngredient.getId())
                            .header("Authorization", "Bearer " + userToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("DELETE /ingredients/{id}")
    class DeleteTests {

        @Test
        @DisplayName("delete_whenDietitianOwner_shouldReturnNoContent")
        void delete_whenDietitianOwner_shouldReturnNoContent() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/{id}", testIngredient.getId())
                            .header("Authorization", "Bearer " + dietitianToken))
                    .andExpect(status().isNoContent());
        }

        @Test
        @DisplayName("delete_whenUser_shouldReturnForbidden")
        void delete_whenUser_shouldReturnForbidden() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/{id}", testIngredient.getId())
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isForbidden());
        }
    }
}
