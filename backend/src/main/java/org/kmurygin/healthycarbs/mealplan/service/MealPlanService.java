package org.kmurygin.healthycarbs.mealplan.service;

import org.kmurygin.healthycarbs.mealplan.model.MealPlan;
import org.kmurygin.healthycarbs.mealplan.repository.MealPlanRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MealPlanService {

    private final MealPlanRepository mealPlanRepository;

    public MealPlanService(MealPlanRepository mealPlanRepository) {
        this.mealPlanRepository = mealPlanRepository;
    }

    public List<MealPlan> findAll() {
        return mealPlanRepository.findAll();
    }

    public MealPlan findById(Long id) {
        return mealPlanRepository.findById(id).orElse(null);
    }

    public MealPlan save(MealPlan recipe) {
        return mealPlanRepository.save(recipe);
    }

    public void deleteById(Long id) {
        mealPlanRepository.deleteById(id);
    }

    public MealPlan generateMealPlan() {

        MealPlan mealPlan  = new MealPlan();

        // generate meal plan
        // save each daily plan and final meal plan in db

        save(mealPlan);
        return mealPlan;
    }
}
