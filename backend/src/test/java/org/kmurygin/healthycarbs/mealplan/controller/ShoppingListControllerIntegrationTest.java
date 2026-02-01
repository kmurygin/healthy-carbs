package org.kmurygin.healthycarbs.mealplan.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.kmurygin.healthycarbs.config.JwtService;
import org.kmurygin.healthycarbs.mealplan.IngredientCategory;
import org.kmurygin.healthycarbs.mealplan.MealPlanSource;
import org.kmurygin.healthycarbs.mealplan.dto.UpdateShoppingListItemDTO;
import org.kmurygin.healthycarbs.mealplan.model.*;
import org.kmurygin.healthycarbs.mealplan.repository.IngredientRepository;
import org.kmurygin.healthycarbs.mealplan.repository.MealPlanRepository;
import org.kmurygin.healthycarbs.mealplan.repository.ShoppingListRepository;
import org.kmurygin.healthycarbs.mealplan.service.ShoppingListPdfService;
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

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("ShoppingListController Integration Tests")
class ShoppingListControllerIntegrationTest {

    private static final String BASE_URL = "/api/v1/shopping-list";
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
    private IngredientRepository ingredientRepository;

    @Autowired
    private ShoppingListRepository shoppingListRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private StorageProvider storageProvider;

    @MockitoBean
    private ShoppingListPdfService shoppingListPdfService;

    private User regularUser;
    private MealPlan testMealPlan;
    private ShoppingList testShoppingList;
    private Ingredient testIngredient;
    private String userToken;

    @BeforeEach
    void setUp() {
        regularUser = userRepository.save(
                UserTestUtils.createUserForPersistence("user_shopping", uniqueSuffix, Role.USER, passwordEncoder));

        testIngredient = ingredientRepository.save(Ingredient.builder()
                .name("Shopping Ingredient " + uniqueSuffix)
                .unit("grams")
                .caloriesPerUnit(1.0)
                .carbsPerUnit(0.1)
                .proteinPerUnit(0.2)
                .fatPerUnit(0.05)
                .category(IngredientCategory.MEAT)
                .author(regularUser)
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
        testMealPlan = mealPlanRepository.save(testMealPlan);

        testShoppingList = ShoppingList.builder()
                .mealPlan(testMealPlan)
                .build();

        ShoppingListItem item = ShoppingListItem.builder()
                .ingredient(testIngredient)
                .totalQuantity(500.0)
                .isBought(false)
                .build();
        testShoppingList.addItem(item);

        testShoppingList = shoppingListRepository.save(testShoppingList);

        userToken = jwtService.generateToken(regularUser);
    }

    @Nested
    @DisplayName("GET /shopping-list/{mealPlanId}")
    class GetShoppingListTests {

        @Test
        @DisplayName("getShoppingList_whenExists_shouldReturnShoppingList")
        void getShoppingList_whenExists_shouldReturnShoppingList() throws Exception {
            mockMvc.perform(get(BASE_URL + "/{mealPlanId}", testMealPlan.getId())
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message", is("Shopping list retrieved successfully.")));
        }

        @Test
        @DisplayName("getShoppingList_whenMealPlanNotFound_shouldReturn404")
        void getShoppingList_whenMealPlanNotFound_shouldReturn404() throws Exception {
            mockMvc.perform(get(BASE_URL + "/{mealPlanId}", 999999L)
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("PUT /shopping-list/{mealPlanId}/item")
    class UpdateItemTests {

        @Test
        @DisplayName("updateItem_whenItemExists_shouldUpdateStatus")
        void updateItem_whenItemExists_shouldUpdateStatus() throws Exception {
            UpdateShoppingListItemDTO dto = new UpdateShoppingListItemDTO();
            dto.setIngredientName("Shopping Ingredient " + uniqueSuffix);
            dto.setBought(true);

            mockMvc.perform(put(BASE_URL + "/{mealPlanId}/item", testMealPlan.getId())
                            .header("Authorization", "Bearer " + userToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message", is("Shopping list item updated successfully.")));
        }

        @Test
        @DisplayName("updateItem_whenShoppingListNotFound_shouldReturn404")
        void updateItem_whenShoppingListNotFound_shouldReturn404() throws Exception {
            UpdateShoppingListItemDTO dto = new UpdateShoppingListItemDTO();
            dto.setIngredientName("Non-existent");
            dto.setBought(true);

            mockMvc.perform(put(BASE_URL + "/{mealPlanId}/item", 999999L)
                            .header("Authorization", "Bearer " + userToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /shopping-list/{mealPlanId}/download")
    class DownloadPdfTests {

        @Test
        @DisplayName("downloadPdf_whenShoppingListExists_shouldReturnPdf")
        void downloadPdf_whenShoppingListExists_shouldReturnPdf() throws Exception {
            byte[] pdfBytes = new byte[]{1, 2, 3, 4, 5};
            when(shoppingListPdfService.generateShoppingListPdf(testMealPlan.getId())).thenReturn(pdfBytes);

            mockMvc.perform(get(BASE_URL + "/{mealPlanId}/download", testMealPlan.getId())
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(org.springframework.http.MediaType.APPLICATION_PDF))
                    .andExpect(header().string("Content-Disposition",
                            containsString("shopping-list-" + testMealPlan.getId() + ".pdf")));
        }
    }
}
