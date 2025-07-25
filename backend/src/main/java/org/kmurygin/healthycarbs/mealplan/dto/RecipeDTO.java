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

    private List<RecipeIngredientDTO> ingredients;

    private Integer calories;
    private Integer carbs;
    private Integer protein;
    private Integer fat;
    private MealType mealType;
    private DietType dietType;
}

