package org.kmurygin.healthycarbs.mealplan.mapper;

import org.kmurygin.healthycarbs.mealplan.dto.RecipeIngredientDTO;
import org.kmurygin.healthycarbs.mealplan.model.RecipeIngredient;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RecipeIngredientMapper {
    RecipeIngredientDTO toDTO(RecipeIngredient entity);
    RecipeIngredient toEntity(RecipeIngredientDTO dto);
}
