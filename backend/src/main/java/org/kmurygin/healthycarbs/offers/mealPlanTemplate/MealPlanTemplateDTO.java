package org.kmurygin.healthycarbs.offers.mealPlanTemplate;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record MealPlanTemplateDTO(
        Long id,
        @NotNull
        @Size(min = 3, max = 60)
        String name,
        String description,
        List<Long> dayIds,
        Double totalCalories,
        Double totalCarbs,
        Double totalProtein,
        Double totalFat
) {
}
