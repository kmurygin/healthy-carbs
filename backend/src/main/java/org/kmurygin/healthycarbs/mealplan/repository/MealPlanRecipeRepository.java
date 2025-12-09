package org.kmurygin.healthycarbs.mealplan.repository;

import org.kmurygin.healthycarbs.mealplan.model.MealPlanRecipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MealPlanRecipeRepository extends JpaRepository<MealPlanRecipe, Long> {
    boolean existsByRecipeId(Long recipeId);
}