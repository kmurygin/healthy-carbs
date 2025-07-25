package org.kmurygin.healthycarbs.mealplan.genetic_algorithm;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.MealType;
import org.kmurygin.healthycarbs.mealplan.service.RecipeService;
import org.springframework.stereotype.Component;

import java.util.Random;

@Component
@RequiredArgsConstructor
public class RecipeMutate implements Mutate {

    private static final double MUTATION_PROBABILITY = 0.2;

    private final RecipeService recipeService;
    private final Random random = new Random();

    private final DietType dietType = DietType.VEGAN;

    @Override
    public void mutate(Genome plan) {
        if (plan.genes.isEmpty()) {
            return;
        }

        for (int i = 0; i < plan.getGenes().size(); i++) {
            if (random.nextDouble() < MUTATION_PROBABILITY) {
                MealType mealType = plan.getGenes().get(i).getMealType();
                plan.getGenes().set(i, recipeService.findRandom(mealType, dietType));
            }
        }
    }
}
