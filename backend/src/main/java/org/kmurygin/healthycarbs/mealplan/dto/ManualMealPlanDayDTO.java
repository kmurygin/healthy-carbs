package org.kmurygin.healthycarbs.mealplan.dto;

import java.util.List;

public record ManualMealPlanDayDTO(
        int dayOffset,
        List<Long> recipeIds
) {
}