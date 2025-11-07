package org.kmurygin.healthycarbs.mealplan.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.MealType;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RecipeDTO {
    private Long id;
    private String name;
    private String description;
    private String instructions;
    private List<RecipeIngredientDTO> ingredients;
    private Double calories;
    private Double carbs;
    private Double protein;
    private Double fat;
    private MealType mealType;
    private DietType dietType;
    private Boolean isFavourite;
    private Long favouritesCount;
}
