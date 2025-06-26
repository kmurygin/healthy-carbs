package org.kmurygin.healthycarbs.mealplan.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class IngredientDTO {
    private Long id;
    private String name;
    private String unit;
    private Integer caloriesPerUnit;
    private Integer carbsPerUnit;
    private Integer proteinPerUnit;
    private Integer fatPerUnit;
}

