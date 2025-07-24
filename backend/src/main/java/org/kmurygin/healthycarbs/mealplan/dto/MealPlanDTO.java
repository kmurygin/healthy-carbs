package org.kmurygin.healthycarbs.mealplan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class MealPlanDTO {

    private Long id;
    private double totalCalories;
    private double fitness;

    private List<MealPlanRecipeDTO> recipes;
}
