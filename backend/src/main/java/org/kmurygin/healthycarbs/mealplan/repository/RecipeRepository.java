package org.kmurygin.healthycarbs.mealplan.repository;

import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.MealType;
import org.kmurygin.healthycarbs.mealplan.model.Recipe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    @Query("SELECT r.id FROM Recipe r WHERE r.mealType = :mealType AND r.dietType = :dietType")
    List<Long> findIdsByMealTypeAndDietType(@Param("mealType") MealType mealType, @Param("dietType") DietType dietType);

    @Query(value = """
            SELECT r FROM Recipe r
            LEFT JOIN FETCH r.ingredients ri
            LEFT JOIN FETCH ri.ingredient
            WHERE r.mealType = :mealType AND r.dietType = :dietType
            ORDER BY RANDOM()
            """)
    Page<Recipe> findRandomWithIngredients(
            @Param("mealType") MealType mealType,
            @Param("dietType") DietType dietType,
            Pageable pageable);
}
