package org.kmurygin.healthycarbs.offers.mealPlanTemplate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MealPlanTemplateRepository extends JpaRepository<MealPlanTemplate, Long> {
}
