package org.kmurygin.healthycarbs.mealplan.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.IngredientCategory;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class IngredientDTO {
    private Long id;
    private String name;
    private String unit;
    private Double caloriesPerUnit;
    private Double carbsPerUnit;
    private Double proteinPerUnit;
    private Double fatPerUnit;
    private IngredientCategory category;
}
