package org.kmurygin.healthycarbs.mealplan.repository;

import org.kmurygin.healthycarbs.mealplan.model.MealPlanDay;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MealPlanDayRepository extends JpaRepository<MealPlanDay, Long> {
}
