package org.kmurygin.healthycarbs.mealplan.genetic_algorithm;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.config.GeneticAlgorithmConfig;
import org.kmurygin.healthycarbs.mealplan.model.Recipe;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CalorieFitness implements Fitness {

    private static final double CALORIE_TARGET = 2800.0;

    @Override
    public double evaluate(Genome plan) {
        double totalCalories = plan.getGenes().stream()
                .mapToDouble(Recipe::getCalories)
                .sum();

        if (totalCalories == 0) return 0;

        double deviation = Math.abs(totalCalories - CALORIE_TARGET);
        double ratio = deviation / CALORIE_TARGET;
        double fitness = Math.pow(1 - Math.min(ratio, 1), 2);

        plan.setTotalCalories(totalCalories);
        return Math.max(fitness, 0.0);
    }
}
