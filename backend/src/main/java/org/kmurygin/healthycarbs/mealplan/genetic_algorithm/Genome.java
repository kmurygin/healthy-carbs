package org.kmurygin.healthycarbs.mealplan.genetic_algorithm;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.kmurygin.healthycarbs.mealplan.model.Recipe;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Genome {
    private List<Recipe> genes = new ArrayList<>(3);
    private double fitness;
    private double totalCalories;
    private double totalCarbs;
    private double totalProtein;
    private double totalFat;

    public Genome(Genome other) {
        this.genes.addAll(other.genes);
        this.fitness = other.fitness;
        this.totalCalories = other.totalCalories;
        this.totalCarbs = other.totalCarbs;
        this.totalProtein = other.totalProtein;
        this.totalFat = other.totalFat;
    }
}
