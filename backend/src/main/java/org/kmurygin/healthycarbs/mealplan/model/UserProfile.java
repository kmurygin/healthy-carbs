package org.kmurygin.healthycarbs.mealplan.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.ActivityLevel;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.Gender;
import org.kmurygin.healthycarbs.user.User;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name= "user_profiles")
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User userId;

    private Double weight; //kg
    private Double height; //cm
    private Integer age; //years
    private Gender gender;
    private DietType dietType;
    private ActivityLevel activityLevel;
    private Double caloriesPerDay;
    private Double carbsPerDay;
    private Double proteinPerDay;
    private Double fatPerDay;
}
