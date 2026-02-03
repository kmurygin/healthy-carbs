package org.kmurygin.healthycarbs.mealplan.repository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.MealType;
import org.kmurygin.healthycarbs.mealplan.model.Recipe;
import org.kmurygin.healthycarbs.user.UserTestUtils;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@DisplayName("RecipeRepository Integration Tests")
class RecipeRepositoryTest {

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DietTypeRepository dietTypeRepository;

    private User savedUser;
    private DietType standardDietType;
    private DietType vegetarianDietType;
    private DietType veganDietType;

    @BeforeEach
    void setUp() {
        recipeRepository.deleteAll();
        userRepository.deleteAll();

        savedUser = userRepository.save(UserTestUtils.createDietitianForPersistence(
                String.valueOf(System.currentTimeMillis())));

        standardDietType = dietTypeRepository.findByName("STANDARD")
                .orElseGet(() -> dietTypeRepository.save(DietType.builder().name("STANDARD").compatibilityLevel(1).build()));
        vegetarianDietType = dietTypeRepository.findByName("VEGETARIAN")
                .orElseGet(() -> dietTypeRepository.save(DietType.builder().name("VEGETARIAN").compatibilityLevel(2).build()));
        veganDietType = dietTypeRepository.findByName("VEGAN")
                .orElseGet(() -> dietTypeRepository.save(DietType.builder().name("VEGAN").compatibilityLevel(3).build()));
    }

    @Nested
    @DisplayName("CRUD operations")
    class CrudOperationsTests {

        @Test
        @DisplayName("save_shouldPersistRecipe")
        void save_shouldPersistRecipe() {
            Recipe recipe = recipeRepository.save(Recipe.builder()
                    .name("Test Recipe")
                    .description("Test description")
                    .instructions("Test instructions")
                    .mealType(MealType.BREAKFAST)
                    .dietType(standardDietType)
                    .author(savedUser)
                    .calories(300.0)
                    .carbs(40.0)
                    .protein(15.0)
                    .fat(10.0)
                    .build());

            assertThat(recipe.getId()).isNotNull();
            assertThat(recipeRepository.findById(recipe.getId())).isPresent();
        }

        @Test
        @DisplayName("findById_shouldReturnRecipe")
        void findById_shouldReturnRecipe() {
            Recipe saved = recipeRepository.save(Recipe.builder()
                    .name("Test Recipe")
                    .description("Test description")
                    .instructions("Test instructions")
                    .mealType(MealType.LUNCH)
                    .dietType(vegetarianDietType)
                    .author(savedUser)
                    .build());

            Optional<Recipe> result = recipeRepository.findById(saved.getId());

            assertThat(result).isPresent();
            assertThat(result.get().getName()).isEqualTo("Test Recipe");
        }

        @Test
        @DisplayName("findById_whenNotFound_shouldReturnEmpty")
        void findById_whenNotFound_shouldReturnEmpty() {
            Optional<Recipe> result = recipeRepository.findById(999L);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("delete_shouldRemoveRecipe")
        void delete_shouldRemoveRecipe() {
            Recipe recipe = recipeRepository.save(Recipe.builder()
                    .name("Test Recipe")
                    .description("Test description")
                    .instructions("Test instructions")
                    .mealType(MealType.DINNER)
                    .dietType(veganDietType)
                    .author(savedUser)
                    .build());

            Long recipeId = recipe.getId();
            recipeRepository.delete(recipe);

            assertThat(recipeRepository.findById(recipeId)).isEmpty();
        }

        @Test
        @DisplayName("findAll_shouldReturnAllRecipes")
        void findAll_shouldReturnAllRecipes() {
            recipeRepository.save(Recipe.builder()
                    .name("Recipe 1")
                    .description("Description 1")
                    .instructions("Instructions 1")
                    .mealType(MealType.BREAKFAST)
                    .dietType(standardDietType)
                    .author(savedUser)
                    .build());

            recipeRepository.save(Recipe.builder()
                    .name("Recipe 2")
                    .description("Description 2")
                    .instructions("Instructions 2")
                    .mealType(MealType.LUNCH)
                    .dietType(vegetarianDietType)
                    .author(savedUser)
                    .build());

            List<Recipe> result = recipeRepository.findAll();

            assertThat(result).hasSize(2);
        }
    }

    @Nested
    @DisplayName("findIdsByMealTypeAndDietType")
    class FindIdsByMealTypeAndDietTypeTests {

        @Test
        @DisplayName("findIdsByMealTypeAndDietType_shouldReturnMatchingRecipeIds")
        void findIdsByMealTypeAndDietType_shouldReturnMatchingRecipeIds() {
            Recipe recipe1 = recipeRepository.save(Recipe.builder()
                    .name("Breakfast Standard")
                    .description("Description")
                    .instructions("Instructions")
                    .mealType(MealType.BREAKFAST)
                    .dietType(standardDietType)
                    .author(savedUser)
                    .build());

            recipeRepository.save(Recipe.builder()
                    .name("Lunch Vegan")
                    .description("Description")
                    .instructions("Instructions")
                    .mealType(MealType.LUNCH)
                    .dietType(veganDietType)
                    .author(savedUser)
                    .build());

            List<Long> result = recipeRepository.findIdsByMealTypeAndDietType(MealType.BREAKFAST, standardDietType);

            assertThat(result).hasSize(1);
            assertThat(result.get(0)).isEqualTo(recipe1.getId());
        }

        @Test
        @DisplayName("findIdsByMealTypeAndDietType_whenNoMatch_shouldReturnEmpty")
        void findIdsByMealTypeAndDietType_whenNoMatch_shouldReturnEmpty() {
            recipeRepository.save(Recipe.builder()
                    .name("Lunch Standard")
                    .description("Description")
                    .instructions("Instructions")
                    .mealType(MealType.LUNCH)
                    .dietType(standardDietType)
                    .author(savedUser)
                    .build());

            List<Long> result = recipeRepository.findIdsByMealTypeAndDietType(MealType.DINNER, veganDietType);

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("findIdsByMealTypeAndDietTypes")
    class FindIdsByMealTypeAndDietTypesTests {

        @Test
        @DisplayName("findIdsByMealTypeAndDietTypes_shouldReturnMatchingRecipeIds")
        void findIdsByMealTypeAndDietTypes_shouldReturnMatchingRecipeIds() {
            Recipe recipe1 = recipeRepository.save(Recipe.builder()
                    .name("Breakfast Standard")
                    .description("Description")
                    .instructions("Instructions")
                    .mealType(MealType.BREAKFAST)
                    .dietType(standardDietType)
                    .author(savedUser)
                    .build());

            Recipe recipe2 = recipeRepository.save(Recipe.builder()
                    .name("Breakfast Vegetarian")
                    .description("Description")
                    .instructions("Instructions")
                    .mealType(MealType.BREAKFAST)
                    .dietType(vegetarianDietType)
                    .author(savedUser)
                    .build());

            List<Long> result = recipeRepository.findIdsByMealTypeAndDietTypes(
                    MealType.BREAKFAST,
                    Set.of(standardDietType, vegetarianDietType));

            assertThat(result).hasSize(2);
            assertThat(result).containsExactlyInAnyOrder(recipe1.getId(), recipe2.getId());
        }
    }

    @Nested
    @DisplayName("findByIdWithIngredients")
    class FindByIdWithIngredientsTests {

        @Test
        @DisplayName("findByIdWithIngredients_shouldReturnRecipeWithIngredients")
        void findByIdWithIngredients_shouldReturnRecipeWithIngredients() {
            Recipe saved = recipeRepository.save(Recipe.builder()
                    .name("Test Recipe")
                    .description("Description")
                    .instructions("Instructions")
                    .mealType(MealType.LUNCH)
                    .dietType(standardDietType)
                    .author(savedUser)
                    .build());

            Optional<Recipe> result = recipeRepository.findByIdWithIngredients(saved.getId());

            assertThat(result).isPresent();
            assertThat(result.get().getName()).isEqualTo("Test Recipe");
        }

        @Test
        @DisplayName("findByIdWithIngredients_whenNotFound_shouldReturnEmpty")
        void findByIdWithIngredients_whenNotFound_shouldReturnEmpty() {
            Optional<Recipe> result = recipeRepository.findByIdWithIngredients(999L);

            assertThat(result).isEmpty();
        }
    }
}
