package org.kmurygin.healthycarbs.mealplan.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.kmurygin.healthycarbs.user.User;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name= "meal_plans")
public class MealPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne()
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne()
    @JoinColumn(name = "mondayPlan_id")
    private DailyPlan mondayPlan;

    @ManyToOne()
    @JoinColumn(name = "tuesdayPlan_id")
    private DailyPlan tuesdayPlan;

    @ManyToOne()
    @JoinColumn(name = "wednesdayPlan_id")
    private DailyPlan wednesdayPlan;

    @ManyToOne()
    @JoinColumn(name = "thursdayPlan_id")
    private DailyPlan thursdayPlan;

    @ManyToOne()
    @JoinColumn(name = "fridayPlan_id")
    private DailyPlan fridayPlan;

    @ManyToOne()
    @JoinColumn(name = "saturdayPlan_id")
    private DailyPlan saturdayPlan;

    @ManyToOne()
    @JoinColumn(name = "sundayPlan_id")
    private DailyPlan sundayPlan;

}
