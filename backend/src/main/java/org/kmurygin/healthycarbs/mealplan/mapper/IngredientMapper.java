package org.kmurygin.healthycarbs.mealplan.mapper;

import org.kmurygin.healthycarbs.mealplan.dto.IngredientDTO;
import org.kmurygin.healthycarbs.mealplan.model.Ingredient;
import org.springframework.stereotype.Component;

@Component
public class IngredientMapper {

    public IngredientDTO toDTO(Ingredient ingredient) {
        if (ingredient == null) {
            return null;
        }

        return new IngredientDTO(
                ingredient.getId(),
                ingredient.getName(),
                ingredient.getUnit(),
                ingredient.getCaloriesPerUnit(),
                ingredient.getCarbsPerUnit(),
                ingredient.getProteinPerUnit(),
                ingredient.getFatPerUnit()
        );
    }

    public Ingredient toEntity(IngredientDTO dto) {
        if (dto == null) {
            return null;
        }

        return Ingredient.builder()
                .id(dto.getId())
                .name(dto.getName())
                .unit(dto.getUnit())
                .caloriesPerUnit(dto.getCaloriesPerUnit())
                .carbsPerUnit(dto.getCarbsPerUnit())
                .proteinPerUnit(dto.getProteinPerUnit())
                .fatPerUnit(dto.getFatPerUnit())
                .build();
    }
}
