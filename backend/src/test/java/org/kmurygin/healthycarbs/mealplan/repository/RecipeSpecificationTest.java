package org.kmurygin.healthycarbs.mealplan.repository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.IngredientCategory;
import org.kmurygin.healthycarbs.mealplan.MealType;
import org.kmurygin.healthycarbs.mealplan.model.Ingredient;
import org.kmurygin.healthycarbs.mealplan.model.Recipe;
import org.kmurygin.healthycarbs.mealplan.model.RecipeIngredient;
import org.kmurygin.healthycarbs.storage.StorageProvider;
import org.kmurygin.healthycarbs.user.UserTestUtils;
import org.kmurygin.healthycarbs.user.model.Role;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("RecipeSpecification Tests")
class RecipeSpecificationTest {

    private final String uniqueSuffix = String.valueOf(System.currentTimeMillis());

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private StorageProvider storageProvider;

    private Recipe breakfastRecipe;
    private Recipe lunchRecipe;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = userRepository.save(
                UserTestUtils.createUserForPersistence("spec_user", uniqueSuffix, Role.DIETITIAN, passwordEncoder));

        Ingredient chicken = ingredientRepository.save(Ingredient.builder()
                .name("Spec Chicken " + uniqueSuffix)
                .unit("grams")
                .category(IngredientCategory.MEAT)
                .author(testUser)
                .build());

        Ingredient rice = ingredientRepository.save(Ingredient.builder()
                .name("Spec Rice " + uniqueSuffix)
                .unit("grams")
                .category(IngredientCategory.GRAINS)
                .author(testUser)
                .build());

        breakfastRecipe = Recipe.builder()
                .name("Spec Breakfast " + uniqueSuffix)
                .description("A breakfast recipe")
                .instructions("Cook it")
                .mealType(MealType.BREAKFAST)
                .dietType(DietType.STANDARD)
                .calories(300.0)
                .carbs(40.0)
                .protein(15.0)
                .fat(10.0)
                .author(testUser)
                .build();

        RecipeIngredient ri1 = RecipeIngredient.builder()
                .ingredient(chicken)
                .quantity(200.0)
                .build();
        breakfastRecipe.addIngredient(ri1);
        breakfastRecipe = recipeRepository.save(breakfastRecipe);

        lunchRecipe = Recipe.builder()
                .name("Spec Lunch " + uniqueSuffix)
                .description("A lunch recipe")
                .instructions("Cook lunch")
                .mealType(MealType.LUNCH)
                .dietType(DietType.VEGAN)
                .calories(500.0)
                .carbs(60.0)
                .protein(20.0)
                .fat(15.0)
                .author(testUser)
                .build();

        RecipeIngredient ri2 = RecipeIngredient.builder()
                .ingredient(rice)
                .quantity(150.0)
                .build();
        lunchRecipe.addIngredient(ri2);
        lunchRecipe = recipeRepository.save(lunchRecipe);
    }

    @Nested
    @DisplayName("hasName")
    class HasNameTests {

        @Test
        @DisplayName("hasName_shouldFilterByNameCaseInsensitive")
        void hasName_shouldFilterByNameCaseInsensitive() {
            Specification<Recipe> spec = RecipeSpecification.hasName("spec breakfast");
            Page<Recipe> result = recipeRepository.findAll(spec, PageRequest.of(0, 10));

            assertThat(result.getContent()).extracting(Recipe::getName)
                    .anyMatch(name -> name.contains("Spec Breakfast"));
        }

        @Test
        @DisplayName("hasName_whenNoMatch_shouldReturnEmpty")
        void hasName_whenNoMatch_shouldReturnEmpty() {
            Specification<Recipe> spec = RecipeSpecification.hasName("nonexistent_recipe_xyzzy");
            Page<Recipe> result = recipeRepository.findAll(spec, PageRequest.of(0, 10));

            assertThat(result.getContent()).isEmpty();
        }
    }

    @Nested
    @DisplayName("hasMealType")
    class HasMealTypeTests {

        @Test
        @DisplayName("hasMealType_shouldFilterByMealType")
        void hasMealType_shouldFilterByMealType() {
            Specification<Recipe> spec = RecipeSpecification.hasMealType(MealType.BREAKFAST);
            Page<Recipe> result = recipeRepository.findAll(spec, PageRequest.of(0, 100));

            assertThat(result.getContent()).allMatch(r -> r.getMealType() == MealType.BREAKFAST);
            assertThat(result.getContent()).extracting(Recipe::getName)
                    .anyMatch(name -> name.contains("Spec Breakfast"));
        }
    }

    @Nested
    @DisplayName("hasDietType")
    class HasDietTypeTests {

        @Test
        @DisplayName("hasDietType_shouldFilterByDietType")
        void hasDietType_shouldFilterByDietType() {
            Specification<Recipe> spec = RecipeSpecification.hasDietType(DietType.VEGAN);
            Page<Recipe> result = recipeRepository.findAll(spec, PageRequest.of(0, 100));

            assertThat(result.getContent()).allMatch(r -> r.getDietType() == DietType.VEGAN);
            assertThat(result.getContent()).extracting(Recipe::getName)
                    .anyMatch(name -> name.contains("Spec Lunch"));
        }
    }

    @Nested
    @DisplayName("hasIngredient")
    class HasIngredientTests {

        @Test
        @DisplayName("hasIngredient_shouldFilterByIngredientName")
        void hasIngredient_shouldFilterByIngredientName() {
            Specification<Recipe> spec = RecipeSpecification.hasIngredient("spec chicken");
            Page<Recipe> result = recipeRepository.findAll(spec, PageRequest.of(0, 100));

            assertThat(result.getContent()).isNotEmpty();
            assertThat(result.getContent()).extracting(Recipe::getName)
                    .anyMatch(name -> name.contains("Spec Breakfast"));
        }

        @Test
        @DisplayName("hasIngredient_whenNoMatch_shouldReturnEmpty")
        void hasIngredient_whenNoMatch_shouldReturnEmpty() {
            Specification<Recipe> spec = RecipeSpecification.hasIngredient("nonexistent_ingredient_xyzzy");
            Page<Recipe> result = recipeRepository.findAll(spec, PageRequest.of(0, 100));

            assertThat(result.getContent()).isEmpty();
        }
    }

    @Nested
    @DisplayName("isFavourite")
    class IsFavouriteTests {

        @Test
        @DisplayName("isFavourite_whenUserHasNoFavourites_shouldReturnEmpty")
        void isFavourite_whenUserHasNoFavourites_shouldReturnEmpty() {
            Specification<Recipe> spec = RecipeSpecification.isFavourite(testUser.getId());
            Page<Recipe> result = recipeRepository.findAll(spec, PageRequest.of(0, 100));

            assertThat(result.getContent()).isEmpty();
        }
    }

    @Nested
    @DisplayName("combined specifications")
    class CombinedSpecTests {

        @Test
        @DisplayName("combinedSpec_shouldApplyMultipleFilters")
        void combinedSpec_shouldApplyMultipleFilters() {
            Specification<Recipe> spec = Specification
                    .where(RecipeSpecification.hasMealType(MealType.BREAKFAST))
                    .and(RecipeSpecification.hasDietType(DietType.STANDARD));

            Page<Recipe> result = recipeRepository.findAll(spec, PageRequest.of(0, 100));

            assertThat(result.getContent()).allMatch(r ->
                    r.getMealType() == MealType.BREAKFAST && r.getDietType() == DietType.STANDARD);
        }
    }
}
