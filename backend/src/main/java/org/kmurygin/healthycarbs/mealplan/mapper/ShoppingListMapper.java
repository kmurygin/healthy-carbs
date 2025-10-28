package org.kmurygin.healthycarbs.mealplan.mapper;

import org.kmurygin.healthycarbs.mealplan.IngredientCategory;
import org.kmurygin.healthycarbs.mealplan.dto.ShoppingListDTO;
import org.kmurygin.healthycarbs.mealplan.dto.ShoppingListItemDTO;
import org.kmurygin.healthycarbs.mealplan.model.ShoppingList;
import org.kmurygin.healthycarbs.mealplan.model.ShoppingListItem;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ShoppingListMapper {

    @Mapping(source = "ingredient.name", target = "name")
    @Mapping(source = "ingredient.unit", target = "unit")
    ShoppingListItemDTO shoppingListItemToDto(ShoppingListItem shoppingListItem);

    @AfterMapping
    default void setIsBoughtValue(ShoppingListItem source, @MappingTarget ShoppingListItemDTO target) {
        target.setIsBought(source.isBought());
    }

    default ShoppingListDTO toDTO(ShoppingList shoppingList) {
        if (shoppingList == null) {
            return null;
        }

        Map<IngredientCategory, List<ShoppingListItemDTO>> itemsByCategory = shoppingList.getItems().stream()
                .collect(Collectors.groupingBy(
                        item -> item.getIngredient().getCategory(),
                        Collectors.mapping(
                                this::shoppingListItemToDto,
                                Collectors.toList()
                        )
                ));

        return new ShoppingListDTO(itemsByCategory);
    }
}
