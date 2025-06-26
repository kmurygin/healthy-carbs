package org.kmurygin.healthycarbs.mealplan.model;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.DietGoal;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.Gender;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileRequest {

    private Double weight;
    private Double height;
    private DietGoal dietGoal;
    private DietType dietType;
    private Gender gender;
}
