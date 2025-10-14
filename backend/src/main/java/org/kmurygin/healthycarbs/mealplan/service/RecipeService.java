package org.kmurygin.healthycarbs.mealplan.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.MealType;
import org.kmurygin.healthycarbs.mealplan.dto.RecipeDTO;
import org.kmurygin.healthycarbs.mealplan.dto.RecipeIngredientDTO;
import org.kmurygin.healthycarbs.mealplan.mapper.RecipeIngredientMapper;
import org.kmurygin.healthycarbs.mealplan.mapper.RecipeMapper;
import org.kmurygin.healthycarbs.mealplan.model.Ingredient;
import org.kmurygin.healthycarbs.mealplan.model.Recipe;
import org.kmurygin.healthycarbs.mealplan.model.RecipeIngredient;
import org.kmurygin.healthycarbs.mealplan.repository.IngredientRepository;
import org.kmurygin.healthycarbs.mealplan.repository.RecipeIngredientRepository;
import org.kmurygin.healthycarbs.mealplan.repository.RecipeRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Service
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;
    private final RecipeIngredientRepository recipeIngredientRepository;
    private final RecipeIngredientMapper recipeIngredientMapper;
    private final RecipeMapper recipeMapper;

    public List<Recipe> findAll() {
        return recipeRepository.findAll();
    }

    public Recipe findById(Long id) {
        return recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", id));
    }

    public Recipe save(Recipe recipe) {
        return recipeRepository.save(recipe);
    }

    public void deleteById(Long id) {
        recipeRepository.deleteById(id);
    }

    @Transactional
    public RecipeDTO addIngredient(Long recipeId, Long ingredientId, double quantity) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", recipeId));
        Ingredient ingredient = ingredientRepository.findById(ingredientId)
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient", "id", ingredientId));

        RecipeIngredient recipeIngredient = new RecipeIngredient();
        recipeIngredient.setIngredient(ingredient);
        recipeIngredient.setQuantity(quantity);

        recipe.addIngredient(recipeIngredient);
        Recipe savedRecipe = recipeRepository.save(recipe);
        return recipeMapper.toDTO(savedRecipe);
    }

    @Transactional
    public RecipeDTO removeIngredient(Long recipeId, Long ingredientId) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", recipeId));

        RecipeIngredient recipeIngredient = recipe.getIngredients().stream()
                .filter(ri -> ri.getIngredient().getId().equals(ingredientId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient", "id", ingredientId));

        recipe.removeIngredient(recipeIngredient);
        recipeIngredientRepository.delete(recipeIngredient);

        Recipe savedRecipe = recipeRepository.save(recipe);
        return recipeMapper.toDTO(savedRecipe);
    }

    public List<RecipeIngredientDTO> findAllIngredients(Long recipeId) {
        Recipe recipe = recipeRepository.findById(recipeId).orElse(null);
        if (recipe == null) return new ArrayList<>();
        return recipe.getIngredients().stream()
                .map(recipeIngredientMapper::toDTO)
                .toList();
    }

    @Transactional()
    public Recipe findRandom(MealType mealType, DietType dietType) {
        return recipeRepository.findRandomWithIngredients(mealType, dietType, PageRequest.of(0, 1))
                .getContent()
                .stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Recipe not found for mealType: " + mealType + " and dietType: " + dietType));
    }
}
