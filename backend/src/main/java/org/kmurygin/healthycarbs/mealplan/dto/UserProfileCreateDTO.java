package org.kmurygin.healthycarbs.mealplan.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.ActivityLevel;
import org.kmurygin.healthycarbs.mealplan.DietGoal;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.Gender;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileCreateDTO {
    private String username;
    private Double weight;
    private Double height;
    private Integer age;
    private Gender gender;
    private DietType dietType;
    private ActivityLevel activityLevel;
    private DietGoal dietGoal;
}
