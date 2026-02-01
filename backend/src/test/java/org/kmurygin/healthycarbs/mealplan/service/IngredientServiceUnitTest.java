package org.kmurygin.healthycarbs.mealplan.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kmurygin.healthycarbs.exception.BadRequestException;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.IngredientCategory;
import org.kmurygin.healthycarbs.mealplan.model.Ingredient;
import org.kmurygin.healthycarbs.mealplan.repository.IngredientRepository;
import org.kmurygin.healthycarbs.mealplan.repository.RecipeIngredientRepository;
import org.kmurygin.healthycarbs.user.UserTestUtils;
import org.kmurygin.healthycarbs.user.model.Role;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.service.UserService;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("IngredientService Unit Tests")
class IngredientServiceUnitTest {

    @Mock
    private IngredientRepository ingredientRepository;

    @Mock
    private UserService userService;

    @Mock
    private RecipeIngredientRepository recipeIngredientRepository;

    private IngredientService ingredientService;

    private User testUser;
    private User adminUser;
    private Ingredient testIngredient;

    @BeforeEach
    void setUp() {
        ingredientService = new IngredientService(ingredientRepository, userService, recipeIngredientRepository);

        testUser = UserTestUtils.createTestUser(1L, "testuser", Role.DIETITIAN);
        adminUser = UserTestUtils.createTestUser(2L, "admin", Role.ADMIN);

        testIngredient = Ingredient.builder()
                .id(1L)
                .name("Chicken Breast")
                .unit("grams")
                .caloriesPerUnit(1.65)
                .carbsPerUnit(0.0)
                .proteinPerUnit(0.31)
                .fatPerUnit(0.036)
                .category(IngredientCategory.MEAT)
                .author(testUser)
                .build();
    }

    @Nested
    @DisplayName("findAll")
    class FindAllTests {

        @Test
        @DisplayName("findAll_shouldReturnAllIngredients")
        void findAll_shouldReturnAllIngredients() {
            Ingredient ingredient2 = Ingredient.builder()
                    .id(2L)
                    .name("Rice")
                    .category(IngredientCategory.GRAINS)
                    .author(testUser)
                    .build();

            when(ingredientRepository.findAll()).thenReturn(List.of(testIngredient, ingredient2));

            List<Ingredient> result = ingredientService.findAll();

            assertThat(result).hasSize(2);
            assertThat(result).extracting(Ingredient::getName).containsExactly("Chicken Breast", "Rice");
        }

        @Test
        @DisplayName("findAll_whenEmpty_shouldReturnEmptyList")
        void findAll_whenEmpty_shouldReturnEmptyList() {
            when(ingredientRepository.findAll()).thenReturn(List.of());

            List<Ingredient> result = ingredientService.findAll();

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("findAllPage")
    class FindAllPageTests {

        @Test
        @DisplayName("findAllPage_withNoFilters_shouldReturnPaginatedResults")
        void findAllPage_withNoFilters_shouldReturnPaginatedResults() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<Ingredient> expectedPage = new PageImpl<>(List.of(testIngredient));

            when(ingredientRepository.search(null, null, null, pageable)).thenReturn(expectedPage);

            Page<Ingredient> result = ingredientService.findAllPage(null, null, null, pageable);

            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getName()).isEqualTo("Chicken Breast");
        }

        @Test
        @DisplayName("findAllPage_withNameFilter_shouldSearchByName")
        void findAllPage_withNameFilter_shouldSearchByName() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<Ingredient> expectedPage = new PageImpl<>(List.of(testIngredient));

            when(ingredientRepository.search(eq("chicken%"), eq(null), eq(null), eq(pageable)))
                    .thenReturn(expectedPage);

            Page<Ingredient> result = ingredientService.findAllPage("Chicken", null, null, pageable);

            assertThat(result.getContent()).hasSize(1);
            verify(ingredientRepository).search("chicken%", null, null, pageable);
        }

        @Test
        @DisplayName("findAllPage_withCategoryFilter_shouldFilterByCategory")
        void findAllPage_withCategoryFilter_shouldFilterByCategory() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<Ingredient> expectedPage = new PageImpl<>(List.of(testIngredient));

            when(ingredientRepository.search(null, IngredientCategory.MEAT, null, pageable))
                    .thenReturn(expectedPage);

            Page<Ingredient> result = ingredientService.findAllPage(null, IngredientCategory.MEAT, null, pageable);

            assertThat(result.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("findAllPage_withOnlyMineTrue_shouldFilterByAuthor")
        void findAllPage_withOnlyMineTrue_shouldFilterByAuthor() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<Ingredient> expectedPage = new PageImpl<>(List.of(testIngredient));

            when(userService.getCurrentUser()).thenReturn(testUser);
            when(ingredientRepository.search(null, null, 1L, pageable)).thenReturn(expectedPage);

            Page<Ingredient> result = ingredientService.findAllPage(null, null, true, pageable);

            assertThat(result.getContent()).hasSize(1);
            verify(ingredientRepository).search(null, null, 1L, pageable);
        }
    }

    @Nested
    @DisplayName("findById")
    class FindByIdTests {

        @Test
        @DisplayName("findById_whenExists_shouldReturnIngredient")
        void findById_whenExists_shouldReturnIngredient() {
            when(ingredientRepository.findById(1L)).thenReturn(Optional.of(testIngredient));

            Ingredient result = ingredientService.findById(1L);

            assertThat(result).isEqualTo(testIngredient);
            assertThat(result.getName()).isEqualTo("Chicken Breast");
        }

        @Test
        @DisplayName("findById_whenNotExists_shouldThrowResourceNotFoundException")
        void findById_whenNotExists_shouldThrowResourceNotFoundException() {
            when(ingredientRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> ingredientService.findById(999L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Ingredient");
        }
    }

    @Nested
    @DisplayName("create")
    class CreateTests {

        @Test
        @DisplayName("create_shouldSetAuthorAndSave")
        void create_shouldSetAuthorAndSave() {
            Ingredient newIngredient = Ingredient.builder()
                    .name("Salmon")
                    .category(IngredientCategory.FISH)
                    .build();

            when(userService.getCurrentUser()).thenReturn(testUser);
            when(ingredientRepository.save(any(Ingredient.class))).thenAnswer(invocation -> {
                Ingredient saved = invocation.getArgument(0);
                saved.setId(3L);
                return saved;
            });

            Ingredient result = ingredientService.create(newIngredient);

            assertThat(result.getAuthor()).isEqualTo(testUser);
            assertThat(result.getName()).isEqualTo("Salmon");
            verify(ingredientRepository).save(newIngredient);
        }
    }

    @Nested
    @DisplayName("update")
    class UpdateTests {

        @Test
        @DisplayName("update_whenAuthorIsCurrentUser_shouldUpdateAndSave")
        void update_whenAuthorIsCurrentUser_shouldUpdateAndSave() {
            Ingredient updatedIngredient = Ingredient.builder()
                    .name("Updated Chicken")
                    .build();

            when(ingredientRepository.findById(1L)).thenReturn(Optional.of(testIngredient));
            when(userService.getCurrentUser()).thenReturn(testUser);
            when(ingredientRepository.save(any(Ingredient.class))).thenReturn(testIngredient);

            Ingredient result = ingredientService.update(1L, updatedIngredient);

            assertThat(result).isNotNull();
            verify(ingredientRepository).save(testIngredient);
        }

        @Test
        @DisplayName("update_whenCurrentUserIsAdmin_shouldUpdateAndSave")
        void update_whenCurrentUserIsAdmin_shouldUpdateAndSave() {
            Ingredient updatedIngredient = Ingredient.builder()
                    .name("Admin Updated")
                    .build();

            when(ingredientRepository.findById(1L)).thenReturn(Optional.of(testIngredient));
            when(userService.getCurrentUser()).thenReturn(adminUser);
            when(ingredientRepository.save(any(Ingredient.class))).thenReturn(testIngredient);

            Ingredient result = ingredientService.update(1L, updatedIngredient);

            assertThat(result).isNotNull();
            verify(ingredientRepository).save(testIngredient);
        }

        @Test
        @DisplayName("update_whenNotAuthorAndNotAdmin_shouldThrowSecurityException")
        void update_whenNotAuthorAndNotAdmin_shouldThrowSecurityException() {
            User otherUser = UserTestUtils.createTestUser(3L, "otheruser", Role.DIETITIAN);
            Ingredient updatedIngredient = Ingredient.builder()
                    .name("Unauthorized Update")
                    .build();

            when(ingredientRepository.findById(1L)).thenReturn(Optional.of(testIngredient));
            when(userService.getCurrentUser()).thenReturn(otherUser);

            assertThatThrownBy(() -> ingredientService.update(1L, updatedIngredient))
                    .isInstanceOf(SecurityException.class)
                    .hasMessageContaining("not authorized");
        }

        @Test
        @DisplayName("update_whenIngredientNotExists_shouldThrowResourceNotFoundException")
        void update_whenIngredientNotExists_shouldThrowResourceNotFoundException() {
            Ingredient updatedIngredient = Ingredient.builder()
                    .name("Updated")
                    .build();

            when(ingredientRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> ingredientService.update(999L, updatedIngredient))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("deleteById")
    class DeleteByIdTests {

        @Test
        @DisplayName("deleteById_whenAuthorAndNotUsedInRecipes_shouldDelete")
        void deleteById_whenAuthorAndNotUsedInRecipes_shouldDelete() {
            when(ingredientRepository.findById(1L)).thenReturn(Optional.of(testIngredient));
            when(userService.getCurrentUser()).thenReturn(testUser);
            when(recipeIngredientRepository.existsByIngredientId(1L)).thenReturn(false);
            doNothing().when(ingredientRepository).delete(testIngredient);

            ingredientService.deleteById(1L);

            verify(ingredientRepository).delete(testIngredient);
        }

        @Test
        @DisplayName("deleteById_whenAdminAndNotUsedInRecipes_shouldDelete")
        void deleteById_whenAdminAndNotUsedInRecipes_shouldDelete() {
            when(ingredientRepository.findById(1L)).thenReturn(Optional.of(testIngredient));
            when(userService.getCurrentUser()).thenReturn(adminUser);
            when(recipeIngredientRepository.existsByIngredientId(1L)).thenReturn(false);
            doNothing().when(ingredientRepository).delete(testIngredient);

            ingredientService.deleteById(1L);

            verify(ingredientRepository).delete(testIngredient);
        }

        @Test
        @DisplayName("deleteById_whenNotAuthorAndNotAdmin_shouldThrowSecurityException")
        void deleteById_whenNotAuthorAndNotAdmin_shouldThrowSecurityException() {
            User otherUser = UserTestUtils.createTestUser(3L, "otheruser", Role.DIETITIAN);

            when(ingredientRepository.findById(1L)).thenReturn(Optional.of(testIngredient));
            when(userService.getCurrentUser()).thenReturn(otherUser);

            assertThatThrownBy(() -> ingredientService.deleteById(1L))
                    .isInstanceOf(SecurityException.class)
                    .hasMessageContaining("not authorized");
        }

        @Test
        @DisplayName("deleteById_whenUsedInRecipes_shouldThrowBadRequestException")
        void deleteById_whenUsedInRecipes_shouldThrowBadRequestException() {
            when(ingredientRepository.findById(1L)).thenReturn(Optional.of(testIngredient));
            when(userService.getCurrentUser()).thenReturn(testUser);
            when(recipeIngredientRepository.existsByIngredientId(1L)).thenReturn(true);

            assertThatThrownBy(() -> ingredientService.deleteById(1L))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("used in one or more recipes");
        }

        @Test
        @DisplayName("deleteById_whenIngredientNotExists_shouldThrowResourceNotFoundException")
        void deleteById_whenIngredientNotExists_shouldThrowResourceNotFoundException() {
            when(ingredientRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> ingredientService.deleteById(999L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
