package org.kmurygin.healthycarbs.mealplan.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.kmurygin.healthycarbs.mealplan.dto.RecipeDTO;
import org.kmurygin.healthycarbs.mealplan.dto.RecipeIngredientDTO;
import org.kmurygin.healthycarbs.mealplan.model.Ingredient;
import org.kmurygin.healthycarbs.mealplan.model.Recipe;
import org.kmurygin.healthycarbs.mealplan.model.RecipeIngredient;
import org.kmurygin.healthycarbs.mealplan.repository.IngredientRepository;
import org.kmurygin.healthycarbs.mealplan.repository.RecipeIngredientRepository;
import org.kmurygin.healthycarbs.mealplan.repository.RecipeRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class RecipeServiceTest {

    private RecipeRepository recipeRepository;
    private IngredientRepository ingredientRepository;
    private RecipeIngredientRepository recipeIngredientRepository;
    private RecipeService recipeService;

    @BeforeEach
    void setup() {
        recipeRepository = mock(RecipeRepository.class);
        ingredientRepository = mock(IngredientRepository.class);
        recipeIngredientRepository = mock(RecipeIngredientRepository.class);
        recipeService = new RecipeService(recipeRepository, ingredientRepository, recipeIngredientRepository);
    }

    @Test
    void shouldReturnAllRecipes() {
        Recipe recipe = new Recipe();
        recipe.setId(1L);
        recipe.setName("Test Recipe");
        recipe.setIngredients(new ArrayList<>());

        when(recipeRepository.findAll()).thenReturn(List.of(recipe));

        List<RecipeDTO> result = recipeService.findAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Test Recipe");
    }

    @Test
    void shouldReturnRecipeById() {
        Recipe recipe = new Recipe();
        recipe.setId(1L);
        recipe.setName("Pasta");

        when(recipeRepository.findById(1L)).thenReturn(Optional.of(recipe));

        RecipeDTO result = recipeService.findById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Pasta");
    }

    @Test
    void shouldSaveRecipe() {
        RecipeDTO dto = new RecipeDTO(null, "Smoothie", "Fruit mix", 200, 30, 5, 1, List.of());
        Recipe recipe = recipeService.toEntity(dto);

        when(recipeRepository.save(any())).thenAnswer(invocation -> {
            Recipe r = invocation.getArgument(0);
            r.setId(10L);
            return r;
        });

        RecipeDTO saved = recipeService.save(dto);

        assertThat(saved.getId()).isEqualTo(10L);
        assertThat(saved.getName()).isEqualTo("Smoothie");
    }

    @Test
    void shouldDeleteRecipe() {
        recipeService.deleteById(1L);
        verify(recipeRepository).deleteById(1L);
    }

    @Test
    void shouldAddIngredientToRecipe() {
        Recipe recipe = new Recipe();
        recipe.setId(1L);
        recipe.setIngredients(new ArrayList<>());

        Ingredient ingredient = new Ingredient();
        ingredient.setId(2L);
        ingredient.setName("Milk");
        ingredient.setUnit("ml");

        when(recipeRepository.findById(1L)).thenReturn(Optional.of(recipe));
        when(ingredientRepository.findById(2L)).thenReturn(Optional.of(ingredient));
        when(recipeRepository.save(any())).thenReturn(recipe);

        RecipeDTO result = recipeService.addIngredient(1L, 2L, 100.0);

        assertThat(result.getIngredients()).hasSize(1);
        assertThat(result.getIngredients().get(0).getIngredientName()).isEqualTo("Milk");
    }

    @Test
    void shouldRemoveIngredientFromRecipe() {
        Ingredient ingredient = new Ingredient();
        ingredient.setId(2L);
        ingredient.setName("Sugar");

        RecipeIngredient ri = new RecipeIngredient();
        ri.setIngredient(ingredient);
        ri.setQuantity(50.0);

        Recipe recipe = new Recipe();
        recipe.setId(1L);
        List<RecipeIngredient> ingredients = new ArrayList<>();
        ingredients.add(ri);
        recipe.setIngredients(ingredients);

        when(recipeRepository.findById(1L)).thenReturn(Optional.of(recipe));
        when(recipeRepository.save(any())).thenReturn(recipe);

        RecipeDTO result = recipeService.removeIngredient(1L, 2L);

        assertThat(result.getIngredients()).isEmpty();
        verify(recipeIngredientRepository).delete(ri);
    }

    @Test
    void shouldConvertRecipeToDTO() {
        Recipe recipe = new Recipe();
        recipe.setId(1L);
        recipe.setName("Test");
        recipe.setDescription("Test recipe");
        recipe.setCalories(100);
        recipe.setIngredients(new ArrayList<>());

        RecipeDTO dto = recipeService.toDTO(recipe);

        assertThat(dto.getName()).isEqualTo("Test");
    }

    @Test
    void shouldFindAllIngredientsForRecipe() {
        Ingredient ingredient = new Ingredient();
        ingredient.setId(10L);
        ingredient.setName("Oats");
        ingredient.setUnit("g");

        RecipeIngredient ri = new RecipeIngredient();
        ri.setIngredient(ingredient);
        ri.setQuantity(50.0);

        Recipe recipe = new Recipe();
        recipe.setId(1L);
        List<RecipeIngredient> ingredients = new ArrayList<>();
        ingredients.add(ri);
        recipe.setIngredients(ingredients);

        when(recipeRepository.findById(1L)).thenReturn(Optional.of(recipe));

        List<RecipeIngredientDTO> result = recipeService.findAllIngredients(1L);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getIngredientName()).isEqualTo("Oats");
    }
}