package org.kmurygin.healthycarbs.mealplan.mapper;

import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.dto.RecipeDTO;
import org.kmurygin.healthycarbs.mealplan.dto.RecipeIngredientDTO;
import org.kmurygin.healthycarbs.mealplan.model.Ingredient;
import org.kmurygin.healthycarbs.mealplan.model.Recipe;
import org.kmurygin.healthycarbs.mealplan.model.RecipeIngredient;
import org.kmurygin.healthycarbs.mealplan.repository.IngredientRepository;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class RecipeMapper {

    private final IngredientRepository ingredientRepository;

    public RecipeMapper(IngredientRepository ingredientRepository) {
        this.ingredientRepository = ingredientRepository;
    }

    public RecipeDTO toDTO(Recipe recipe) {
        if (recipe == null) return null;

        List<RecipeIngredientDTO> ingredients = recipe.getIngredients()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return new RecipeDTO(
                recipe.getId(),
                recipe.getName(),
                recipe.getDescription(),
                recipe.getCalories(),
                recipe.getCarbs(),
                recipe.getProtein(),
                recipe.getFat(),
                ingredients
        );
    }

    public RecipeIngredientDTO toDTO(RecipeIngredient recipeIngredient) {
        if (recipeIngredient == null) return null;

        return new RecipeIngredientDTO(
                recipeIngredient.getId(),
                recipeIngredient.getIngredient().getId(),
                recipeIngredient.getIngredient().getName(),
                recipeIngredient.getIngredient().getUnit(),
                recipeIngredient.getQuantity()
        );
    }

    public Recipe toEntity(RecipeDTO recipeDTO) {
        if (recipeDTO == null) return null;

        Recipe recipe = new Recipe();
        recipe.setId(recipeDTO.getId());
        recipe.setName(recipeDTO.getName());
        recipe.setDescription(recipeDTO.getDescription());
        recipe.setCalories(recipeDTO.getCalories());
        recipe.setCarbs(recipeDTO.getCarbs());
        recipe.setProtein(recipeDTO.getProtein());
        recipe.setFat(recipeDTO.getFat());

        List<RecipeIngredient> recipeIngredients = new ArrayList<>();
        if (recipeDTO.getIngredients() != null) {
            for (RecipeIngredientDTO ingredientDTO : recipeDTO.getIngredients()) {
                Ingredient ingredient = ingredientRepository.findById(ingredientDTO.getIngredientId())
                        .orElseThrow(() -> new ResourceNotFoundException("Ingredient", "id", ingredientDTO.getIngredientId()));

                RecipeIngredient recipeIngredient = new RecipeIngredient();
                recipeIngredient.setIngredient(ingredient);
                recipeIngredient.setQuantity(ingredientDTO.getQuantity());
                recipeIngredients.add(recipeIngredient);
            }
        }

        recipe.setIngredients(recipeIngredients);
        return recipe;
    }
}
