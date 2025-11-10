package org.kmurygin.healthycarbs.mealplan.mapper;

import org.kmurygin.healthycarbs.mealplan.dto.RecipeDTO;
import org.kmurygin.healthycarbs.mealplan.model.Recipe;
import org.mapstruct.*;

import java.util.Set;

@Mapper(componentModel = "spring", uses = {RecipeIngredientMapper.class})
public interface RecipeMapper {
    RecipeDTO toDTO(Recipe recipe);

    Recipe toEntity(RecipeDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    void updateFromEntity(Recipe source, @MappingTarget Recipe target);

    @Mapping(target = "isFavourite", expression = "java(isRecipeFavourite(recipe, favouriteRecipeIds))")
    RecipeDTO toDTO(Recipe recipe, Set<Long> favouriteRecipeIds);

    default boolean isRecipeFavourite(Recipe recipe, Set<Long> favouriteRecipeIds) {
        if (favouriteRecipeIds == null || recipe == null || recipe.getId() == null) {
            return false;
        }
        return favouriteRecipeIds.contains(recipe.getId());
    }
}
