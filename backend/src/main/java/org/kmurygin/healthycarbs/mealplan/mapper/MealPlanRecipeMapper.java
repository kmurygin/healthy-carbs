package org.kmurygin.healthycarbs.mealplan.mapper;

import org.kmurygin.healthycarbs.mealplan.dto.MealPlanRecipeDTO;
import org.kmurygin.healthycarbs.mealplan.model.MealPlanRecipe;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {RecipeMapper.class, RecipeIngredientMapper.class})
public interface MealPlanRecipeMapper {
    MealPlanRecipeDTO toDTO(MealPlanRecipe entity);
    MealPlanRecipe toEntity(MealPlanRecipeDTO dto);
}
