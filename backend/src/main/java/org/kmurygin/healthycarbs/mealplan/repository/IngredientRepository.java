package org.kmurygin.healthycarbs.mealplan.repository;

import org.kmurygin.healthycarbs.mealplan.IngredientCategory;
import org.kmurygin.healthycarbs.mealplan.model.Ingredient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, Long> {

    @Query("SELECT i FROM Ingredient i WHERE " +
            "(:name IS NULL OR LOWER(i.name) LIKE :name) AND " +
            "(:category IS NULL OR i.category = :category) AND " +
            "(:authorId IS NULL OR i.author.id = :authorId)")
    Page<Ingredient> search(
            @Param("name") String name,
            @Param("category") IngredientCategory category,
            @Param("authorId") Long authorId,
            Pageable pageable
    );
}
