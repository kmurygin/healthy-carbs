package org.kmurygin.healthycarbs.mealplan.dto;

import java.time.LocalDate;
import java.util.List;

public record CreateMealPlanRequest(
        Long clientId,
        LocalDate startDate,
        List<ManualMealPlanDayDTO> days
) {
}