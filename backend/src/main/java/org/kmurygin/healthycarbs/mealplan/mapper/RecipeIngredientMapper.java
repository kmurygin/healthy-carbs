package org.kmurygin.healthycarbs.mealplan.mapper;

import org.kmurygin.healthycarbs.mealplan.dto.RecipeIngredientDTO;
import org.kmurygin.healthycarbs.mealplan.model.RecipeIngredient;
import org.kmurygin.healthycarbs.user.mapper.UserMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface RecipeIngredientMapper {
    RecipeIngredientDTO toDTO(RecipeIngredient entity);

    @Mapping(target = "recipe", ignore = true)
    RecipeIngredient toEntity(RecipeIngredientDTO dto);
}
