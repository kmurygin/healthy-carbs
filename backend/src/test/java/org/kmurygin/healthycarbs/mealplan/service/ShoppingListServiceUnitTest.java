package org.kmurygin.healthycarbs.mealplan.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kmurygin.healthycarbs.auth.service.AuthenticationService;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.dto.UpdateShoppingListItemDTO;
import org.kmurygin.healthycarbs.mealplan.model.*;
import org.kmurygin.healthycarbs.mealplan.repository.MealPlanRepository;
import org.kmurygin.healthycarbs.mealplan.repository.ShoppingListRepository;
import org.kmurygin.healthycarbs.user.UserTestUtils;
import org.kmurygin.healthycarbs.user.model.User;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ShoppingListService Unit Tests")
class ShoppingListServiceUnitTest {

    @Mock
    private ShoppingListRepository shoppingListRepository;

    @Mock
    private MealPlanRepository mealPlanRepository;

    @Mock
    private AuthenticationService authenticationService;

    private ShoppingListService shoppingListService;

    private User testUser;
    private MealPlan testMealPlan;
    private ShoppingList testShoppingList;
    private Ingredient testIngredient;

    @BeforeEach
    void setUp() {
        shoppingListService = new ShoppingListService(
                shoppingListRepository,
                mealPlanRepository,
                authenticationService
        );

        testUser = UserTestUtils.createTestUser(1L, "testuser");

        testMealPlan = MealPlan.builder()
                .id(1L)
                .user(testUser)
                .build();

        testIngredient = Ingredient.builder()
                .id(1L)
                .name("Chicken Breast")
                .unit("grams")
                .build();

        ShoppingListItem item = ShoppingListItem.builder()
                .id(1L)
                .ingredient(testIngredient)
                .totalQuantity(500.0)
                .isBought(false)
                .build();

        testShoppingList = ShoppingList.builder()
                .id(1L)
                .mealPlan(testMealPlan)
                .items(new ArrayList<>(List.of(item)))
                .build();
        item.setShoppingList(testShoppingList);
    }

    @Nested
    @DisplayName("getShoppingList")
    class GetShoppingListTests {

        @Test
        @DisplayName("getShoppingList_whenMealPlanAndShoppingListExist_shouldReturnShoppingList")
        void getShoppingList_whenMealPlanAndShoppingListExist_shouldReturnShoppingList() {
            when(authenticationService.getCurrentUser()).thenReturn(testUser);
            when(mealPlanRepository.findByIdAndUser(1L, testUser)).thenReturn(Optional.of(testMealPlan));
            when(shoppingListRepository.findByMealPlanIdWithItems(1L)).thenReturn(Optional.of(testShoppingList));

            ShoppingList result = shoppingListService.getShoppingList(1L);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getItems()).hasSize(1);
        }

        @Test
        @DisplayName("getShoppingList_whenMealPlanNotFound_shouldThrowResourceNotFoundException")
        void getShoppingList_whenMealPlanNotFound_shouldThrowResourceNotFoundException() {
            when(authenticationService.getCurrentUser()).thenReturn(testUser);
            when(mealPlanRepository.findByIdAndUser(999L, testUser)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> shoppingListService.getShoppingList(999L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("MealPlan");
        }

        @Test
        @DisplayName("getShoppingList_whenShoppingListNotFound_shouldThrowResourceNotFoundException")
        void getShoppingList_whenShoppingListNotFound_shouldThrowResourceNotFoundException() {
            when(authenticationService.getCurrentUser()).thenReturn(testUser);
            when(mealPlanRepository.findByIdAndUser(1L, testUser)).thenReturn(Optional.of(testMealPlan));
            when(shoppingListRepository.findByMealPlanIdWithItems(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> shoppingListService.getShoppingList(1L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("ShoppingList");
        }
    }

    @Nested
    @DisplayName("updateShoppingListItemStatus")
    class UpdateShoppingListItemStatusTests {

        @Test
        @DisplayName("updateShoppingListItemStatus_whenItemExists_shouldUpdateStatus")
        void updateShoppingListItemStatus_whenItemExists_shouldUpdateStatus() {
            UpdateShoppingListItemDTO dto = new UpdateShoppingListItemDTO();
            dto.setIngredientName("Chicken Breast");
            dto.setBought(true);

            when(authenticationService.getCurrentUser()).thenReturn(testUser);
            when(mealPlanRepository.findByIdAndUser(1L, testUser)).thenReturn(Optional.of(testMealPlan));
            when(shoppingListRepository.findByMealPlanIdWithItems(1L)).thenReturn(Optional.of(testShoppingList));
            when(shoppingListRepository.save(any(ShoppingList.class))).thenReturn(testShoppingList);

            shoppingListService.updateShoppingListItemStatus(1L, dto);

            assertThat(testShoppingList.getItems().get(0).isBought()).isTrue();
            verify(shoppingListRepository).save(testShoppingList);
        }

        @Test
        @DisplayName("updateShoppingListItemStatus_whenShoppingListNotFound_shouldThrowResourceNotFoundException")
        void updateShoppingListItemStatus_whenShoppingListNotFound_shouldThrowResourceNotFoundException() {
            UpdateShoppingListItemDTO dto = new UpdateShoppingListItemDTO();
            dto.setIngredientName("Chicken Breast");
            dto.setBought(true);

            when(authenticationService.getCurrentUser()).thenReturn(testUser);
            when(mealPlanRepository.findByIdAndUser(999L, testUser)).thenReturn(Optional.of(testMealPlan));
            when(shoppingListRepository.findByMealPlanIdWithItems(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> shoppingListService.updateShoppingListItemStatus(999L, dto))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("ShoppingList");
        }

        @Test
        @DisplayName("updateShoppingListItemStatus_whenItemNotFound_shouldThrowResourceNotFoundException")
        void updateShoppingListItemStatus_whenItemNotFound_shouldThrowResourceNotFoundException() {
            UpdateShoppingListItemDTO dto = new UpdateShoppingListItemDTO();
            dto.setIngredientName("Non-existent Ingredient");
            dto.setBought(true);

            when(authenticationService.getCurrentUser()).thenReturn(testUser);
            when(mealPlanRepository.findByIdAndUser(1L, testUser)).thenReturn(Optional.of(testMealPlan));
            when(shoppingListRepository.findByMealPlanIdWithItems(1L)).thenReturn(Optional.of(testShoppingList));

            assertThatThrownBy(() -> shoppingListService.updateShoppingListItemStatus(1L, dto))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("ShoppingListItem");
        }

        @Test
        @DisplayName("updateShoppingListItemStatus_caseInsensitiveIngredientName_shouldUpdateStatus")
        void updateShoppingListItemStatus_caseInsensitiveIngredientName_shouldUpdateStatus() {
            UpdateShoppingListItemDTO dto = new UpdateShoppingListItemDTO();
            dto.setIngredientName("CHICKEN BREAST");
            dto.setBought(true);

            when(authenticationService.getCurrentUser()).thenReturn(testUser);
            when(mealPlanRepository.findByIdAndUser(1L, testUser)).thenReturn(Optional.of(testMealPlan));
            when(shoppingListRepository.findByMealPlanIdWithItems(1L)).thenReturn(Optional.of(testShoppingList));
            when(shoppingListRepository.save(any(ShoppingList.class))).thenReturn(testShoppingList);

            shoppingListService.updateShoppingListItemStatus(1L, dto);

            assertThat(testShoppingList.getItems().get(0).isBought()).isTrue();
        }
    }

    @Nested
    @DisplayName("createAndSaveShoppingList")
    class CreateAndSaveShoppingListTests {

        @Test
        @DisplayName("createAndSaveShoppingList_shouldAggregateIngredientsAndSave")
        void createAndSaveShoppingList_shouldAggregateIngredientsAndSave() {
            // Setup meal plan with recipes and ingredients
            Ingredient rice = Ingredient.builder().id(2L).name("Rice").build();

            RecipeIngredient ri1 = RecipeIngredient.builder()
                    .ingredient(testIngredient)
                    .quantity(200.0)
                    .build();
            RecipeIngredient ri2 = RecipeIngredient.builder()
                    .ingredient(rice)
                    .quantity(100.0)
                    .build();
            RecipeIngredient ri3 = RecipeIngredient.builder()
                    .ingredient(testIngredient)
                    .quantity(300.0)
                    .build();

            Recipe recipe1 = Recipe.builder()
                    .id(1L)
                    .ingredients(List.of(ri1, ri2))
                    .build();
            Recipe recipe2 = Recipe.builder()
                    .id(2L)
                    .ingredients(List.of(ri3))
                    .build();

            MealPlanRecipe mpr1 = MealPlanRecipe.builder().recipe(recipe1).build();
            MealPlanRecipe mpr2 = MealPlanRecipe.builder().recipe(recipe2).build();

            MealPlanDay day = MealPlanDay.builder()
                    .recipes(List.of(mpr1, mpr2))
                    .build();

            MealPlan mealPlan = MealPlan.builder()
                    .id(2L)
                    .user(testUser)
                    .days(List.of(day))
                    .build();

            when(shoppingListRepository.save(any(ShoppingList.class))).thenAnswer(invocation -> {
                ShoppingList saved = invocation.getArgument(0);
                saved.setId(1L);
                return saved;
            });

            shoppingListService.createAndSaveShoppingList(mealPlan);

            verify(shoppingListRepository).save(argThat(shoppingList -> {
                assertThat(shoppingList.getMealPlan()).isEqualTo(mealPlan);
                assertThat(shoppingList.getItems()).hasSize(2);

                // Verify chicken breast is aggregated (200 + 300 = 500)
                ShoppingListItem chickenItem = shoppingList.getItems().stream()
                        .filter(item -> item.getIngredient().getName().equals("Chicken Breast"))
                        .findFirst()
                        .orElse(null);
                assertThat(chickenItem).isNotNull();
                assertThat(chickenItem.getTotalQuantity()).isEqualTo(500.0);

                return true;
            }));
        }

        @Test
        @DisplayName("createAndSaveShoppingList_withEmptyMealPlan_shouldSaveEmptyList")
        void createAndSaveShoppingList_withEmptyMealPlan_shouldSaveEmptyList() {
            MealPlan emptyMealPlan = MealPlan.builder()
                    .id(3L)
                    .user(testUser)
                    .days(List.of())
                    .build();

            when(shoppingListRepository.save(any(ShoppingList.class))).thenAnswer(invocation -> invocation.getArgument(0));

            shoppingListService.createAndSaveShoppingList(emptyMealPlan);

            verify(shoppingListRepository).save(argThat(shoppingList -> {
                assertThat(shoppingList.getItems()).isEmpty();
                return true;
            }));
        }
    }
}
