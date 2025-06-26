package org.kmurygin.healthycarbs.mealplan.service;

import org.kmurygin.healthycarbs.mealplan.model.DailyPlan;
import org.kmurygin.healthycarbs.mealplan.repository.DailyPlanRepository;
import org.kmurygin.healthycarbs.mealplan.repository.UserProfileRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
public class DailyPlanService {

    private final DailyPlanRepository dailyPlanRepository;
    private final UserProfileRepository userProfileRepository;

    private double fitness;

    public DailyPlanService(DailyPlanRepository dailyPlanRepository, UserProfileRepository userProfileRepository) {
        this.dailyPlanRepository = dailyPlanRepository;
        this.userProfileRepository = userProfileRepository;
    }

    public List<DailyPlan> findAll() {
        return dailyPlanRepository.findAll();
    }

    public DailyPlan findById(Long id) {
        return dailyPlanRepository.findById(id).orElse(null);
    }

    public DailyPlan save(DailyPlan dailyPlan) {
        return dailyPlanRepository.save(dailyPlan);
    }

    public void deleteById(Long id) {
        dailyPlanRepository.deleteById(id);
    }

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

//    void crossover() {
//        Random rand = new Random();
//        for (int i = 0; i < 3; i++) {
//            childMeals.add(rand.nextBoolean() ? this.meals.get(i) : partner.meals.get(i));
//        }
//        dailyPlan.getBreakfast() = rand.nextBoolean() ? dailyPlan.getBreakfast() : recipeReposiotory.findRandomRecipe();
//
////        return new DailyPlan(this.breakfast, this.lunch, this.dinner);
//    }

    void mutate() {
        // Implement the mutation logic here
    }

    void run() {
        // Implement the main loop of the genetic algorithm here
    }
}
