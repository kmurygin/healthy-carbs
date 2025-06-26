package org.kmurygin.healthycarbs.mealplan.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RecipeIngredientDTO {
    private Long id;
    private Long ingredientId;
    private String ingredientName;
    private String unit;
    private Double quantity;
}

