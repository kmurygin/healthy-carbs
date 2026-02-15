package org.kmurygin.healthycarbs.mealplan.mapper;

import org.kmurygin.healthycarbs.mealplan.dto.IngredientDTO;
import org.kmurygin.healthycarbs.mealplan.model.Ingredient;
import org.kmurygin.healthycarbs.user.mapper.UserMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface IngredientMapper {
    IngredientDTO toDTO(Ingredient ingredient);

    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Ingredient toEntity(IngredientDTO dto);
}
