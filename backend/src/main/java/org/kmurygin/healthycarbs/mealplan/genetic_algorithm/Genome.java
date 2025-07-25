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
    public final List<Recipe> genes = new ArrayList<>(3);
    public double fitness;
    public double totalCalories;

    public Genome(Genome other) {
        this.genes.addAll(other.genes);
        this.fitness = other.fitness;
        this.totalCalories = other.totalCalories;
    }
}
