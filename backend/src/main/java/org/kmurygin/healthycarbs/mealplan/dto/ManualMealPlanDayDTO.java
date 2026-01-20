package org.kmurygin.healthycarbs.mealplan.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ManualMealPlanDayDTO(
        @Min(value = 0, message = "Day offset must be non-negative")
        int dayOffset,
        @NotNull(message = "Recipe IDs list cannot be null")
        @NotEmpty(message = "Recipe IDs list cannot be empty")
        List<Long> recipeIds
) {
}