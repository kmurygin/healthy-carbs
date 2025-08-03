package org.kmurygin.healthycarbs.mealplan.genetic_algorithm.mutation;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.MealType;
import org.kmurygin.healthycarbs.mealplan.config.GeneticAlgorithmConfig;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.core.Genome;
import org.kmurygin.healthycarbs.mealplan.service.RecipeService;
import org.springframework.stereotype.Component;

import java.util.concurrent.ThreadLocalRandom;

@Component
@RequiredArgsConstructor
public class RecipeMutate implements Mutate {

    private final GeneticAlgorithmConfig config;
    private final RecipeService recipeService;


    @Override
    public void mutate(Genome plan, DietType dietType) {
        if (plan.getGenes().isEmpty()) return;

        for (int i = 0; i < plan.getGenes().size(); i++) {
            if (ThreadLocalRandom.current().nextDouble() < config.getMutationRate()) {
                MealType mealType = plan.getGenes().get(i).getMealType();
                plan.getGenes().set(i, recipeService.findRandom(mealType, dietType));
            }
        }
    }
}
