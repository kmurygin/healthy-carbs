package org.kmurygin.healthycarbs.mealplan;

import org.kmurygin.healthycarbs.mealplan.model.DailyPlan;
import org.kmurygin.healthycarbs.mealplan.model.MealPlan;
import org.kmurygin.healthycarbs.mealplan.model.Recipe;
import org.kmurygin.healthycarbs.mealplan.model.UserProfile;
import org.kmurygin.healthycarbs.mealplan.repository.RecipeRepository;

import java.util.Random;

public class GeneticAlgorithm {

//    private UserProfile userProfile;
//
//    private final int MAX_POPULATION_SIZE = 100;
//    private final int MAX_GENERATIONS = 1000;
//    private final double MUTATION_RATE = 0.05;
//
//    private double fitness;
//
//    private MealPlan mealPlan;
//
//    private DailyPlan dailyPlan;
//
//    GeneticAlgorithm(UserProfile userProfile)
//    {
//        this.userProfile = userProfile;
//
//    }
//
//    void calculateFitness() {
//        double caloriesGoal = userProfile.getCaloriesPerDay();
//        double carbsGoal = userProfile.getCarbsPerDay();
//        double proteinsGoal = userProfile.getProteinPerDay();
//        double fatsGoal = userProfile.getFatPerDay();
//
//        double calories = dailyPlan.getBreakfast().getCalories() + dailyPlan.getLunch().getCalories() + dailyPlan.getDinner().getCalories();
//        double carbs = dailyPlan.getBreakfast().getCarbs() + dailyPlan.getLunch().getCarbs() + dailyPlan.getDinner().getCarbs();
//        double proteins = dailyPlan.getBreakfast().getProtein() + dailyPlan.getLunch().getProtein() + dailyPlan.getDinner().getProtein();
//        double fats = dailyPlan.getBreakfast().getFat() + dailyPlan.getLunch().getFat() + dailyPlan.getDinner().getFat();
//
//        double calorieDiff = Math.abs(caloriesGoal - calories);
//        double carbsDiff = Math.abs(carbsGoal - carbs);
//        double proteinDiff = Math.abs(proteinsGoal - proteins);
//        double fatDiff = Math.abs(fatsGoal - fats);
//
//        double penalty = calorieDiff + carbsDiff + proteinDiff + fatDiff;
//
//        this.fitness = (int)(1000 - penalty);
//    }
//
//     void crossover() {
//        Random rand = new Random();
//        for (int i = 0; i < 3; i++) {
//            childMeals.add(rand.nextBoolean() ? this.meals.get(i) : partner.meals.get(i));
//        }
//         dailyPlan.getBreakfast() = rand.nextBoolean() ? dailyPlan.getBreakfast() : recipeReposiotory.findRandomRecipe();
//
////        return new DailyPlan(this.breakfast, this.lunch, this.dinner);
//    }
//
//    void mutate() {
//        // Implement the mutation logic here
//    }
//
//    void run() {
//        // Implement the main loop of the genetic algorithm here
//    }
}
