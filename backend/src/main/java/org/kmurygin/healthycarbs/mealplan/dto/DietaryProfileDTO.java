package org.kmurygin.healthycarbs.mealplan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.ActivityLevel;
import org.kmurygin.healthycarbs.mealplan.DietGoal;
import org.kmurygin.healthycarbs.mealplan.Gender;
import org.kmurygin.healthycarbs.user.dto.UserDTO;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DietaryProfileDTO {
    private Long id;
    private UserDTO user;
    private Double weight;
    private Double height;
    private Integer age;
    private Gender gender;
    private DietGoal dietGoal;
    private String dietType;
    private ActivityLevel activityLevel;
    private Double calorieTarget;
    private Double carbsTarget;
    private Double proteinTarget;
    private Double fatTarget;
}
