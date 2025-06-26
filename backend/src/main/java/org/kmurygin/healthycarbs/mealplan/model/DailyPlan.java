package org.kmurygin.healthycarbs.mealplan.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name= "daily_plans")
public class DailyPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "breakfast_id")
    private Recipe breakfast;

    @ManyToOne
    @JoinColumn(name = "lunch_id")
    private Recipe lunch;

    @ManyToOne
    @JoinColumn(name = "dinner_id")
    private Recipe dinner;


}
