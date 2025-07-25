package org.kmurygin.healthycarbs.mealplan.mapper;

import org.kmurygin.healthycarbs.mealplan.dto.IngredientDTO;
import org.kmurygin.healthycarbs.mealplan.model.Ingredient;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface IngredientMapper {
    IngredientDTO toDTO(Ingredient ingredient);
    Ingredient toEntity(IngredientDTO dto);
}
