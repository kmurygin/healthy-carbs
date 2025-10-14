package org.kmurygin.healthycarbs.mealplan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.ActivityLevel;
import org.kmurygin.healthycarbs.mealplan.DietGoal;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.Gender;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DietaryProfilePayload {
    private Double weight;
    private Double height;
    private Integer age;
    private Gender gender;
    private DietGoal dietGoal;
    private DietType dietType;
    private ActivityLevel activityLevel;
    private List<String> allergies;
}
