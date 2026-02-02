package org.kmurygin.healthycarbs.mealplan.repository;

import org.kmurygin.healthycarbs.mealplan.model.MealPlan;
import org.kmurygin.healthycarbs.mealplan.model.ShoppingList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ShoppingListRepository extends JpaRepository<ShoppingList, Long> {

    @Query("SELECT sl FROM ShoppingList sl JOIN FETCH sl.items i JOIN FETCH i.ingredient WHERE sl.mealPlan.id = :mealPlanId")
    Optional<ShoppingList> findByMealPlanIdWithItems(Long mealPlanId);

    Optional<ShoppingList> findByMealPlan(MealPlan mealPlan);

    void deleteByMealPlan(MealPlan mealPlan);
}
