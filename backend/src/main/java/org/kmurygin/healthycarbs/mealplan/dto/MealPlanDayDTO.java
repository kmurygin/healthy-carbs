package org.kmurygin.healthycarbs.mealplan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class MealPlanDayDTO {
    private Long id;
    private DayOfWeek dayOfWeek;
    private LocalDate date;
    private List<MealPlanRecipeDTO> recipes;
    private double totalCalories;
    private double totalCarbs;
    private double totalProtein;
    private double totalFat;
}
