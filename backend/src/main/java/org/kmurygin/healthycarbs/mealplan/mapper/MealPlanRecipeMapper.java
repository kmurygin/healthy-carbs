package org.kmurygin.healthycarbs.mealplan.mapper;

import org.kmurygin.healthycarbs.mealplan.dto.MealPlanRecipeDTO;
import org.kmurygin.healthycarbs.mealplan.model.MealPlanRecipe;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {RecipeMapper.class, RecipeIngredientMapper.class})
public interface MealPlanRecipeMapper {

    @Mapping(target = "mealPlan", ignore = true)
    MealPlanRecipeDTO toDTO(MealPlanRecipe entity);

    @Mapping(target = "mealPlan", ignore = true)
    MealPlanRecipe toEntity(MealPlanRecipeDTO dto);
}
