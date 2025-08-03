package org.kmurygin.healthycarbs.mealplan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.kmurygin.healthycarbs.user.dto.UserDTO;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class MealPlanDTO {

    private Long id;

    private UserDTO user;

    private List<MealPlanRecipeDTO> recipes;

    private double totalCalories;
    private double totalCarbs;
    private double totalProtein;
    private double totalFat;
}
