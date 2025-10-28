package org.kmurygin.healthycarbs.mealplan.repository;

import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.MealType;
import org.kmurygin.healthycarbs.mealplan.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long>, JpaSpecificationExecutor<Recipe> {

    @Query("""
            SELECT r.id
            FROM Recipe r
            WHERE r.mealType = :mealType
            AND r.dietType = :dietType
            """)
    List<Long> findIdsByMealTypeAndDietType(
            @Param("mealType") MealType mealType,
            @Param("dietType") DietType dietType
    );

    @Query("""
            SELECT r.id
            FROM Recipe r
            WHERE r.mealType = :mealType
            """)
    List<Long> findIdsByMealType(
            @Param("mealTypes") MealType mealType
    );

    @Query("""
            SELECT r.id
            FROM Recipe r
            WHERE r.mealType = :mealType
            AND r.dietType IN :dietTypes
            """)
    List<Long> findIdsByMealTypeAndDietTypes(
            @Param("mealType") MealType mealType,
            @Param("dietTypes") Set<DietType> dietTypes
    );

    @Query("""
            SELECT DISTINCT r
            FROM Recipe r
            LEFT JOIN FETCH r.ingredients ri
            LEFT JOIN FETCH ri.ingredient ing
            WHERE r.id = :id
            """)
    Optional<Recipe> findByIdWithIngredients(@Param("id") Long id);

}
