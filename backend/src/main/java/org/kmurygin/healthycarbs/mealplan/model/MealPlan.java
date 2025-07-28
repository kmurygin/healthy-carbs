package org.kmurygin.healthycarbs.mealplan.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.kmurygin.healthycarbs.user.User;

import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
@Entity
@Table(name = "meal_plans")
public class MealPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "mealPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MealPlanRecipe> recipes = new ArrayList<>();

    private double totalCalories;
    private double totalCarbs;
    private double totalProtein;
    private double totalFat;

    public void addRecipe(Recipe recipe) {
        MealPlanRecipe mealPlanRecipe = new MealPlanRecipe(null, this, recipe, recipe.getMealType());
        recipes.add(mealPlanRecipe);
    }

}