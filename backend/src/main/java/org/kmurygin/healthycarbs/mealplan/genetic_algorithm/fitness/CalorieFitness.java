package org.kmurygin.healthycarbs.mealplan.genetic_algorithm.fitness;

import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.core.Genome;
import org.kmurygin.healthycarbs.mealplan.model.DietaryProfile;
import org.kmurygin.healthycarbs.mealplan.model.Recipe;

public class CalorieFitness implements Fitness {

    private final double calorieTarget;
    private final double carbsTarget;
    private final double proteinTarget;
    private final double fatTarget;

    public CalorieFitness(DietaryProfile profile) {
        this.calorieTarget = profile.getCalorieTarget();
        this.carbsTarget = profile.getCarbsTarget();
        this.proteinTarget = profile.getProteinTarget();
        this.fatTarget = profile.getFatTarget();
    }

    @Override
    public double evaluate(Genome plan) {
        double totalCalories = 0.0;
        double totalCarbs = 0.0;
        double totalProtein = 0.0;
        double totalFat = 0.0;

        for (Recipe recipe : plan.getGenes()) {
            if (recipe == null) continue;

            totalCalories += recipe.getCalories();
            totalCarbs += recipe.getCarbs();
            totalProtein += recipe.getProtein();
            totalFat += recipe.getFat();
        }

        plan.setTotalCalories(totalCalories);
        plan.setTotalCarbs(totalCarbs);
        plan.setTotalProtein(totalProtein);
        plan.setTotalFat(totalFat);

        if (totalCalories == 0) return 0.0;

        double fitness = (
                0.4 * score(totalCalories, calorieTarget) +
                        0.2 * score(totalCarbs, carbsTarget) +
                        0.2 * score(totalProtein, proteinTarget) +
                        0.2 * score(totalFat, fatTarget)
        );


        plan.setFitness(fitness);
        return fitness;
    }

    private double score(double actual, double target) {
        if (target == 0) return 0.0;
        double deviation = Math.abs(actual - target);
        double ratio = deviation / target;
        return Math.pow(1 - Math.min(ratio, 1.0), 2);
    }
}