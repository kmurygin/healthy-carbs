package org.kmurygin.healthycarbs.mealplan.repository;

import org.kmurygin.healthycarbs.mealplan.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {}
