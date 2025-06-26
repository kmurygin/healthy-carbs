package org.kmurygin.healthycarbs.mealplan.repository;

import org.kmurygin.healthycarbs.mealplan.model.RecipeIngredient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecipeIngredientRepository extends JpaRepository<RecipeIngredient, Long> {
}

