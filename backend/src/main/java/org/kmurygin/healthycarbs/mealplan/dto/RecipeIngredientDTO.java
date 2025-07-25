package org.kmurygin.healthycarbs.mealplan.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RecipeIngredientDTO {
    private Long id;
    private RecipeDTO recipe;
    private IngredientDTO ingredient;
    private Double quantity;
}
