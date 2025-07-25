package org.kmurygin.healthycarbs.mealplan.service;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.MealType;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.GeneticAlgorithm;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.Genome;
import org.kmurygin.healthycarbs.mealplan.model.MealPlan;
import org.springframework.stereotype.Service;


@RequiredArgsConstructor
@Service
public class MealPlanService {
    private final GeneticAlgorithm geneticAlgorithm;
    private final RecipeService recipeService;

    public MealPlan generateMealPlan() {
        Genome best = geneticAlgorithm.run(this::randomCandidate);
        return toMealPlan(best);
    }

    private Genome randomCandidate() {
        Genome genome = new Genome();
        for (MealType mealType : MealType.values()) {
            genome.getGenes().add(recipeService.findRandom(mealType, DietType.VEGAN));
        }
        return genome;
    }

    private MealPlan toMealPlan(Genome genome) {
        MealPlan plan = new MealPlan();
        plan.setFitness(genome.getFitness());
        plan.setTotalCalories(genome.getTotalCalories());
        genome.getGenes().forEach(plan::addRecipe);
        return plan;
    }
}
