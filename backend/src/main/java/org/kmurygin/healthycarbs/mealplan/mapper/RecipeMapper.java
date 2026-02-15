package org.kmurygin.healthycarbs.mealplan.mapper;

import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.dto.RecipeDTO;
import org.kmurygin.healthycarbs.mealplan.model.Recipe;
import org.kmurygin.healthycarbs.user.mapper.UserMapper;
import org.mapstruct.*;

import java.util.Set;

@Mapper(componentModel = "spring", uses = {RecipeIngredientMapper.class, UserMapper.class})
public interface RecipeMapper {

    @Mapping(target = "dietType", expression = "java(mapDietTypeToString(recipe.getDietType()))")
    @Mapping(target = "isFavourite", constant = "false")
    RecipeDTO toDTO(Recipe recipe);

    @Mapping(target = "dietType", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "favouritesUsers", ignore = true)
    Recipe toEntity(RecipeDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dietType", ignore = true)
    void updateFromEntity(Recipe source, @MappingTarget Recipe target);

    @Mapping(target = "isFavourite", expression = "java(isRecipeFavourite(recipe, favouriteRecipeIds))")
    @Mapping(target = "dietType", expression = "java(mapDietTypeToString(recipe.getDietType()))")
    RecipeDTO toDTO(Recipe recipe, Set<Long> favouriteRecipeIds);

    default boolean isRecipeFavourite(Recipe recipe, Set<Long> favouriteRecipeIds) {
        if (favouriteRecipeIds == null || recipe == null || recipe.getId() == null) {
            return false;
        }
        return favouriteRecipeIds.contains(recipe.getId());
    }

    default String mapDietTypeToString(DietType dietType) {
        return dietType != null ? dietType.getName() : null;
    }
}
