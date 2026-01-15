package org.kmurygin.healthycarbs.mealplan.genetic_algorithm.fitness;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.config.GeneticAlgorithmConfig;
import org.kmurygin.healthycarbs.mealplan.model.DietaryProfile;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FitnessFactory {

    private final GeneticAlgorithmConfig config;

    public Fitness createCalorieFitness(DietaryProfile profile) {
        return new MacroNutrientFitness(profile, config);
    }
}
