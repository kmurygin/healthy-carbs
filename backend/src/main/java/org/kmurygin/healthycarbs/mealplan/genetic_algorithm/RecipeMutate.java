package org.kmurygin.healthycarbs.mealplan.genetic_algorithm;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.MealType;
import org.kmurygin.healthycarbs.mealplan.config.GeneticAlgorithmConfig;
import org.kmurygin.healthycarbs.mealplan.service.RecipeService;
import org.springframework.stereotype.Component;

import java.util.Random;
import java.util.concurrent.ThreadLocalRandom;

@Component
@RequiredArgsConstructor
public class RecipeMutate implements Mutate {

    private final GeneticAlgorithmConfig config;
    private final RecipeService recipeService;
    private final Random random = new Random();

    private final DietType dietType = DietType.VEGAN;

    @Override
    public void mutate(Genome plan) {
        if (plan.getGenes().isEmpty()) {
            return;
        }

        for (int i = 0; i < plan.getGenes().size(); i++) {
            if (ThreadLocalRandom.current().nextDouble() < config.getMutationRate()) {
                MealType mealType = plan.getGenes().get(i).getMealType();
                plan.getGenes().set(i, recipeService.findRandom(mealType, dietType));
            }
        }
    }
}
