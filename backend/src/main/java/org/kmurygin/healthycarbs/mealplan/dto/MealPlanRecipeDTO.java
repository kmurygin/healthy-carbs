package org.kmurygin.healthycarbs.mealplan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.MealType;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class MealPlanRecipeDTO {
    private Long id;
    private MealType slot;
    private RecipeDTO recipe;
}
