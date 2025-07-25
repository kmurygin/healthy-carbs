package org.kmurygin.healthycarbs.mealplan.mapper;

import org.kmurygin.healthycarbs.mealplan.dto.RecipeDTO;
import org.kmurygin.healthycarbs.mealplan.model.Recipe;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {RecipeIngredientMapper.class})
public interface RecipeMapper {
    RecipeDTO toDTO(Recipe recipe);
    Recipe toEntity(RecipeDTO dto);
}
