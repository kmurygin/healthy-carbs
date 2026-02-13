package org.kmurygin.healthycarbs.mealplan.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kmurygin.healthycarbs.exception.BadRequestException;
import org.kmurygin.healthycarbs.exception.ForbiddenException;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.MealType;
import org.kmurygin.healthycarbs.mealplan.mapper.RecipeIngredientMapper;
import org.kmurygin.healthycarbs.mealplan.mapper.RecipeMapper;
import org.kmurygin.healthycarbs.mealplan.model.Ingredient;
import org.kmurygin.healthycarbs.mealplan.model.Recipe;
import org.kmurygin.healthycarbs.mealplan.model.RecipeIngredient;
import org.kmurygin.healthycarbs.mealplan.repository.IngredientRepository;
import org.kmurygin.healthycarbs.mealplan.repository.MealPlanRecipeRepository;
import org.kmurygin.healthycarbs.mealplan.repository.RecipeRepository;
import org.kmurygin.healthycarbs.user.UserTestUtils;
import org.kmurygin.healthycarbs.user.model.Role;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.repository.UserRepository;
import org.kmurygin.healthycarbs.user.service.UserService;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("RecipeService Unit Tests")
class RecipeServiceUnitTest {

    @Mock
    private RecipeRepository recipeRepository;

    @Mock
    private IngredientRepository ingredientRepository;

    @Mock
    private MealPlanRecipeRepository mealPlanRecipeRepository;

    @Mock
    private RecipeIngredientMapper recipeIngredientMapper;

    @Mock
    private RecipeMapper recipeMapper;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserService userService;

    @Mock
    private org.kmurygin.healthycarbs.mealplan.DietTypeUtil dietTypeUtil;

    @Mock
    private org.kmurygin.healthycarbs.mealplan.repository.DietTypeRepository dietTypeRepository;

    private RecipeService recipeService;

    private User testUser;
    private User adminUser;
    private Recipe testRecipe;
    private DietType standardDietType;
    private DietType veganDietType;

    @BeforeEach
    void setUp() {
        recipeService = new RecipeService(
                recipeRepository,
                ingredientRepository,
                mealPlanRecipeRepository,
                recipeIngredientMapper,
                recipeMapper,
                userRepository,
                userService,
                dietTypeUtil,
                dietTypeRepository);

        testUser = UserTestUtils.createTestUser(1L, "testuser", Role.DIETITIAN);

        adminUser = UserTestUtils.createAdmin();
        adminUser.setId(2L);

        standardDietType = DietType.builder()
                .id(1L)
                .name("STANDARD")
                .compatibilityLevel(1)
                .build();

        veganDietType = DietType.builder()
                .id(3L)
                .name("VEGAN")
                .compatibilityLevel(3)
                .build();

        testRecipe = Recipe.builder()
                .id(1L)
                .name("Test Recipe")
                .description("Test description")
                .mealType(MealType.BREAKFAST)
                .dietType(standardDietType)
                .author(testUser)
                .ingredients(new ArrayList<>())
                .build();
    }

    @Nested
    @DisplayName("findAll with filters")
    class FindAllWithFiltersTests {

        @Test
        @DisplayName("findAll_shouldReturnPaginatedRecipes")
        void findAll_shouldReturnPaginatedRecipes() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<Recipe> expectedPage = new PageImpl<>(List.of(testRecipe));

            when(recipeRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(expectedPage);

            Page<Recipe> result = recipeService.findAll(null, null, null, null, null, pageable);

            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0)).isEqualTo(testRecipe);
        }

        @Test
        @DisplayName("findAll_withName_shouldFilterByName")
        void findAll_withName_shouldFilterByName() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<Recipe> expectedPage = new PageImpl<>(List.of(testRecipe));

            when(recipeRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(expectedPage);

            Page<Recipe> result = recipeService.findAll("Test", null, null, null, null, pageable);

            assertThat(result.getContent()).hasSize(1);
            verify(recipeRepository).findAll(any(Specification.class), eq(pageable));
        }

        @Test
        @DisplayName("findAll_withAllFilters_shouldApplyAllFilters")
        void findAll_withAllFilters_shouldApplyAllFilters() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<Recipe> expectedPage = new PageImpl<>(List.of(testRecipe));

            when(dietTypeRepository.findByName("STANDARD")).thenReturn(java.util.Optional.of(standardDietType));
            when(recipeRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(expectedPage);

            Page<Recipe> result = recipeService.findAll(
                    "Test",
                    "Oats",
                    "STANDARD",
                    MealType.BREAKFAST,
                    1L,
                    pageable);

            assertThat(result.getContent()).hasSize(1);
        }
    }

    @Nested
    @DisplayName("findById")
    class FindByIdTests {

        @Test
        @DisplayName("findById_whenRecipeExists_shouldReturnRecipe")
        void findById_whenRecipeExists_shouldReturnRecipe() {
            when(recipeRepository.findById(1L)).thenReturn(Optional.of(testRecipe));

            Recipe result = recipeService.findById(1L);

            assertThat(result).isEqualTo(testRecipe);
        }

        @Test
        @DisplayName("findById_whenRecipeNotFound_shouldThrowResourceNotFound")
        void findById_whenRecipeNotFound_shouldThrowResourceNotFound() {
            when(recipeRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> recipeService.findById(999L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("create")
    class CreateTests {

        @Test
        @DisplayName("create_shouldSetAuthorAndSave")
        void create_shouldSetAuthorAndSave() {
            Recipe newRecipe = Recipe.builder()
                    .name("New Recipe")
                    .description("New description")
                    .mealType(MealType.LUNCH)
                    .build();

            when(userService.getCurrentUser()).thenReturn(testUser);
            when(dietTypeRepository.findByName("VEGAN")).thenReturn(java.util.Optional.of(veganDietType));
            when(recipeRepository.save(any(Recipe.class))).thenAnswer(i -> {
                Recipe r = i.getArgument(0);
                r.setId(2L);
                return r;
            });

            Recipe result = recipeService.create(newRecipe, "VEGAN");

            assertThat(result.getAuthor()).isEqualTo(testUser);
            verify(recipeRepository).save(newRecipe);
        }
    }

    @Nested
    @DisplayName("update")
    class UpdateTests {

        @Test
        @DisplayName("update_whenAuthor_shouldUpdateRecipe")
        void update_whenAuthor_shouldUpdateRecipe() {
            Recipe updatedDetails = Recipe.builder()
                    .name("Updated Name")
                    .description("Updated description")
                    .build();

            when(recipeRepository.findById(1L)).thenReturn(Optional.of(testRecipe));
            when(userService.getCurrentUser()).thenReturn(testUser);
            when(recipeRepository.save(any(Recipe.class))).thenAnswer(i -> i.getArgument(0));

            Recipe result = recipeService.update(1L, updatedDetails, null);

            verify(recipeMapper).updateFromEntity(updatedDetails, testRecipe);
            verify(recipeRepository).save(testRecipe);
        }

        @Test
        @DisplayName("update_whenAdmin_shouldUpdateRecipe")
        void update_whenAdmin_shouldUpdateRecipe() {
            Recipe updatedDetails = Recipe.builder()
                    .name("Updated Name")
                    .build();

            when(recipeRepository.findById(1L)).thenReturn(Optional.of(testRecipe));
            when(userService.getCurrentUser()).thenReturn(adminUser);
            when(recipeRepository.save(any(Recipe.class))).thenAnswer(i -> i.getArgument(0));

            recipeService.update(1L, updatedDetails, null);

            verify(recipeRepository).save(testRecipe);
        }

        @Test
        @DisplayName("update_whenNotAuthorized_shouldThrowForbiddenException")
        void update_whenNotAuthorized_shouldThrowForbiddenException() {
            User otherUser = UserTestUtils.createTestUser(3L, "other");
            Recipe updatedDetails = Recipe.builder().name("Updated Name").build();

            when(recipeRepository.findById(1L)).thenReturn(Optional.of(testRecipe));
            when(userService.getCurrentUser()).thenReturn(otherUser);

            assertThatThrownBy(() -> recipeService.update(1L, updatedDetails, null))
                    .isInstanceOf(ForbiddenException.class)
                    .hasMessageContaining("not authorized");
        }

        @Test
        @DisplayName("update_whenRecipeNotFound_shouldThrowResourceNotFound")
        void update_whenRecipeNotFound_shouldThrowResourceNotFound() {
            when(recipeRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> recipeService.update(999L, testRecipe, null))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("deleteById")
    class DeleteByIdTests {

        @Test
        @DisplayName("deleteById_whenAuthor_shouldDelete")
        void deleteById_whenAuthor_shouldDelete() {
            when(recipeRepository.findById(1L)).thenReturn(Optional.of(testRecipe));
            when(userService.getCurrentUser()).thenReturn(testUser);
            when(mealPlanRecipeRepository.existsByRecipeId(1L)).thenReturn(false);

            recipeService.deleteById(1L);

            verify(recipeRepository).delete(testRecipe);
        }

        @Test
        @DisplayName("deleteById_whenAdmin_shouldDelete")
        void deleteById_whenAdmin_shouldDelete() {
            when(recipeRepository.findById(1L)).thenReturn(Optional.of(testRecipe));
            when(userService.getCurrentUser()).thenReturn(adminUser);
            when(mealPlanRecipeRepository.existsByRecipeId(1L)).thenReturn(false);

            recipeService.deleteById(1L);

            verify(recipeRepository).delete(testRecipe);
        }

        @Test
        @DisplayName("deleteById_whenInMealPlan_shouldThrowBadRequest")
        void deleteById_whenInMealPlan_shouldThrowBadRequest() {
            when(recipeRepository.findById(1L)).thenReturn(Optional.of(testRecipe));
            when(userService.getCurrentUser()).thenReturn(testUser);
            when(mealPlanRecipeRepository.existsByRecipeId(1L)).thenReturn(true);

            assertThatThrownBy(() -> recipeService.deleteById(1L))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("used in");
        }

        @Test
        @DisplayName("deleteById_whenNotAuthorized_shouldThrowForbiddenException")
        void deleteById_whenNotAuthorized_shouldThrowForbiddenException() {
            User otherUser = UserTestUtils.createTestUser(3L, "other");

            when(recipeRepository.findById(1L)).thenReturn(Optional.of(testRecipe));
            when(userService.getCurrentUser()).thenReturn(otherUser);

            assertThatThrownBy(() -> recipeService.deleteById(1L))
                    .isInstanceOf(ForbiddenException.class);
        }
    }

    @Nested
    @DisplayName("addIngredient")
    class AddIngredientTests {

        @Test
        @DisplayName("addIngredient_shouldAddIngredientToRecipe")
        void addIngredient_shouldAddIngredientToRecipe() {
            Ingredient ingredient = Ingredient.builder()
                    .id(1L)
                    .name("Flour")
                    .build();

            when(recipeRepository.findById(1L)).thenReturn(Optional.of(testRecipe));
            when(userService.getCurrentUser()).thenReturn(testUser);
            when(ingredientRepository.findById(1L)).thenReturn(Optional.of(ingredient));
            when(recipeRepository.save(any(Recipe.class))).thenAnswer(i -> i.getArgument(0));

            Recipe result = recipeService.addIngredient(1L, 1L, 100.0);

            assertThat(result.getIngredients()).hasSize(1);
            verify(recipeRepository).save(testRecipe);
        }

        @Test
        @DisplayName("addIngredient_whenIngredientNotFound_shouldThrowResourceNotFound")
        void addIngredient_whenIngredientNotFound_shouldThrowResourceNotFound() {
            when(recipeRepository.findById(1L)).thenReturn(Optional.of(testRecipe));
            when(userService.getCurrentUser()).thenReturn(testUser);
            when(ingredientRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> recipeService.addIngredient(1L, 999L, 100.0))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("removeIngredient")
    class RemoveIngredientTests {

        @Test
        @DisplayName("removeIngredient_shouldRemoveIngredientFromRecipe")
        void removeIngredient_shouldRemoveIngredientFromRecipe() {
            Ingredient ingredient = Ingredient.builder().id(1L).name("Flour").build();
            RecipeIngredient ri = new RecipeIngredient();
            ri.setId(1L);
            ri.setIngredient(ingredient);
            ri.setRecipe(testRecipe);
            ri.setQuantity(100.0);
            testRecipe.getIngredients().add(ri);

            when(recipeRepository.findById(1L)).thenReturn(Optional.of(testRecipe));
            when(userService.getCurrentUser()).thenReturn(testUser);
            when(recipeRepository.save(any(Recipe.class))).thenAnswer(i -> i.getArgument(0));

            Recipe result = recipeService.removeIngredient(1L, 1L);

            verify(recipeRepository).save(testRecipe);
        }

        @Test
        @DisplayName("removeIngredient_whenIngredientNotInRecipe_shouldThrowResourceNotFound")
        void removeIngredient_whenIngredientNotInRecipe_shouldThrowResourceNotFound() {
            when(recipeRepository.findById(1L)).thenReturn(Optional.of(testRecipe));
            when(userService.getCurrentUser()).thenReturn(testUser);

            assertThatThrownBy(() -> recipeService.removeIngredient(1L, 999L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("findRandomForMealPlan")
    class FindRandomForMealPlanTests {

        @Test
        @DisplayName("findRandomForMealPlan_whenRecipesExist_shouldReturnRandomRecipe")
        void findRandomForMealPlan_whenRecipesExist_shouldReturnRandomRecipe() {
            when(dietTypeUtil.getCompatibleDietTypes(standardDietType)).thenReturn(java.util.Set.of(standardDietType));
            when(recipeRepository.findIdsByMealTypeAndDietTypes(eq(MealType.BREAKFAST), any()))
                    .thenReturn(List.of(1L, 2L, 3L));
            when(recipeRepository.findByIdWithIngredients(any())).thenReturn(Optional.of(testRecipe));

            Recipe result = recipeService.findRandomForMealPlan(MealType.BREAKFAST, standardDietType);

            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("findRandomForMealPlan_whenNoRecipes_shouldThrowResourceNotFound")
        void findRandomForMealPlan_whenNoRecipes_shouldThrowResourceNotFound() {
            when(dietTypeUtil.getCompatibleDietTypes(veganDietType)).thenReturn(java.util.Set.of(veganDietType));
            when(recipeRepository.findIdsByMealTypeAndDietTypes(eq(MealType.BREAKFAST), any()))
                    .thenReturn(List.of());

            assertThatThrownBy(() -> recipeService.findRandomForMealPlan(MealType.BREAKFAST, veganDietType))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("addFavourite")
    class AddFavouriteTests {

        @Test
        @DisplayName("addFavourite_shouldAddRecipeToUserFavourites")
        void addFavourite_shouldAddRecipeToUserFavourites() {
            testUser.setFavouriteRecipes(new HashSet<>());

            when(recipeRepository.findById(1L)).thenReturn(Optional.of(testRecipe));
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(userRepository.save(any(User.class))).thenReturn(testUser);

            recipeService.addFavourite(1L, 1L);

            verify(userRepository).save(testUser);
        }

        @Test
        @DisplayName("addFavourite_whenRecipeNotFound_shouldThrowResourceNotFound")
        void addFavourite_whenRecipeNotFound_shouldThrowResourceNotFound() {
            when(recipeRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> recipeService.addFavourite(999L, 1L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("addFavourite_whenUserNotFound_shouldThrowResourceNotFound")
        void addFavourite_whenUserNotFound_shouldThrowResourceNotFound() {
            when(recipeRepository.findById(1L)).thenReturn(Optional.of(testRecipe));
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> recipeService.addFavourite(1L, 999L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("removeFavourite")
    class RemoveFavouriteTests {

        @Test
        @DisplayName("removeFavourite_shouldRemoveRecipeFromUserFavourites")
        void removeFavourite_shouldRemoveRecipeFromUserFavourites() {
            Set<Recipe> favourites = new HashSet<>();
            favourites.add(testRecipe);
            testUser.setFavouriteRecipes(favourites);

            when(recipeRepository.findById(1L)).thenReturn(Optional.of(testRecipe));
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(userRepository.save(any(User.class))).thenReturn(testUser);

            recipeService.removeFavourite(1L, 1L);

            verify(userRepository).save(testUser);
        }
    }
}
