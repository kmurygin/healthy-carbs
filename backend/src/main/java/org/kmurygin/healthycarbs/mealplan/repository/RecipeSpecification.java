package org.kmurygin.healthycarbs.mealplan.repository;

import jakarta.persistence.criteria.Join;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.MealType;
import org.kmurygin.healthycarbs.mealplan.model.Ingredient;
import org.kmurygin.healthycarbs.mealplan.model.Recipe;
import org.kmurygin.healthycarbs.mealplan.model.RecipeIngredient;
import org.springframework.data.jpa.domain.Specification;

public class RecipeSpecification {

    public static Specification<Recipe> hasName(String name) {
        return (recipeRoot, criteriaQuery, criteriaBuilder) ->
                criteriaBuilder.like(criteriaBuilder.lower(recipeRoot.get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<Recipe> hasMealType(MealType mealType) {
        return (recipeRoot, criteriaQuery, criteriaBuilder) ->
                criteriaBuilder.equal(recipeRoot.get("mealType"), mealType);
    }

    public static Specification<Recipe> hasDietType(DietType dietType) {
        return (recipeRoot, criteriaQuery, criteriaBuilder) ->
                criteriaBuilder.equal(recipeRoot.get("dietType"), dietType);
    }

    public static Specification<Recipe> hasIngredient(String ingredientName) {
        return (recipeRoot, criteriaQuery, criteriaBuilder) -> {
            assert criteriaQuery != null;
            criteriaQuery.distinct(true);

            Join<Recipe, RecipeIngredient> recipeIngredientJoin = recipeRoot.join("ingredients");
            Join<RecipeIngredient, Ingredient> ingredientJoin = recipeIngredientJoin.join("ingredient");

            return criteriaBuilder.like(
                    criteriaBuilder.lower(ingredientJoin.get("name")),
                    "%" + ingredientName.toLowerCase() + "%"
            );
        };
    }
}
