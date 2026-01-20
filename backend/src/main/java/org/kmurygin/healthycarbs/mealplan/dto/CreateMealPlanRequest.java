package org.kmurygin.healthycarbs.mealplan.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record CreateMealPlanRequest(
        Long clientId,
        LocalDate startDate,
        @NotNull(message = "Days list cannot be null")
        @NotEmpty(message = "Days list cannot be empty")
        @Valid
        List<ManualMealPlanDayDTO> days
) {
}