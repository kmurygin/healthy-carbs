package org.kmurygin.healthycarbs.mealplan.service;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.auth.AuthenticationService;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.MealType;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.fitness.CalorieFitness;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.fitness.Fitness;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.core.GeneticAlgorithm;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.core.Genome;
import org.kmurygin.healthycarbs.mealplan.model.DietaryProfile;
import org.kmurygin.healthycarbs.mealplan.model.MealPlan;
import org.kmurygin.healthycarbs.mealplan.repository.MealPlanRepository;
import org.kmurygin.healthycarbs.user.User;
import org.springframework.stereotype.Service;


@RequiredArgsConstructor
@Service
public class MealPlanService {
    private final GeneticAlgorithm geneticAlgorithm;
    private final RecipeService recipeService;
    private final DietaryProfileService dietaryProfileService;
    private final MealPlanRepository mealPlanRepository;
    private final AuthenticationService authenticationService;

    public MealPlan save(MealPlan mealPlan) {
        return mealPlanRepository.save(mealPlan);
    }

    public MealPlan generateMealPlan() {
        User user = authenticationService.getCurrentUser();
        DietaryProfile dietaryProfile = dietaryProfileService.getByUserId(user.getId());
        Fitness fitness = new CalorieFitness(dietaryProfile);
        DietType dietType = dietaryProfile.getDietType();
        Genome best = geneticAlgorithm.run((() -> randomCandidate(dietType)), fitness, dietType);
        MealPlan mealPlan = toMealPlan(best, user);
        return save(mealPlan);
    }

    private Genome randomCandidate(DietType dietType) {
        Genome genome = new Genome();
        for (MealType mealType : MealType.values()) {
            genome.getGenes().add(recipeService.findRandom(mealType, dietType));
        }
        return genome;
    }

    private MealPlan toMealPlan(Genome genome, User user) {
        MealPlan plan = new MealPlan();
        plan.setTotalCalories(genome.getTotalCalories());
        plan.setTotalCarbs(genome.getTotalCarbs());
        plan.setTotalProtein(genome.getTotalProtein());
        plan.setTotalFat(genome.getTotalFat());
        plan.setUser(user);
        genome.getGenes().forEach(plan::addRecipe);
        return plan;
    }
}
