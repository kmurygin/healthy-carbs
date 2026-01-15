package org.kmurygin.healthycarbs.mealplan.genetic_algorithm.fitness;

import org.kmurygin.healthycarbs.mealplan.config.GeneticAlgorithmConfig;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.core.Genome;
import org.kmurygin.healthycarbs.mealplan.model.DietaryProfile;
import org.kmurygin.healthycarbs.mealplan.model.Recipe;

public class MacroNutrientFitness implements Fitness {

    private final double calorieTarget;
    private final double carbsTarget;
    private final double proteinTarget;
    private final double fatTarget;

    private final double calorieWeight;
    private final double carbsWeight;
    private final double proteinWeight;
    private final double fatWeight;

    public MacroNutrientFitness(DietaryProfile profile, GeneticAlgorithmConfig config) {
        this.calorieTarget = profile.getCalorieTarget();
        this.carbsTarget = profile.getCarbsTarget();
        this.proteinTarget = profile.getProteinTarget();
        this.fatTarget = profile.getFatTarget();

        this.calorieWeight = config.getCaloriesWeight();
        this.carbsWeight = config.getCarbsWeight();
        this.proteinWeight = config.getProteinWeight();
        this.fatWeight = config.getFatWeight();
    }

    @Override
    public double evaluate(final Genome plan) {
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
                calorieWeight * score(totalCalories, calorieTarget) +
                        carbsWeight * score(totalCarbs, carbsTarget) +
                        proteinWeight * score(totalProtein, proteinTarget) +
                        fatWeight * score(totalFat, fatTarget)
        );

        plan.setFitness(fitness);
        return fitness;
    }

    private double score(double actual, double target) {
        if (target <= 0) {
            return (actual == 0) ? 1.0 : 0.0;
        }
        double deviation = Math.abs(actual - target);
        double ratio = Math.min(deviation / target, 1.0);
        return Math.pow(1.0 - ratio, 2);
    }
}
