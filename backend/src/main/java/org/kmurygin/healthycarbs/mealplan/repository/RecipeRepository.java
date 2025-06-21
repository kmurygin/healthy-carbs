package org.kmurygin.healthycarbs.mealplan.repository;

import org.kmurygin.healthycarbs.mealplan.MealType;
import org.kmurygin.healthycarbs.mealplan.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {

//    @Query(value = "SELECT r FROM recipes WHERE r.mealType == _mealType ORDER BY random() LIMIT 1", nativeQuery = true)
//    Recipe findRandomRecipe(MealType _mealType);
}
