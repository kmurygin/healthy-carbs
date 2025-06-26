package org.kmurygin.healthycarbs.mealplan.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RecipeDTO {
    private Long id;
    private String name;
    private String description;
    private Integer calories;
    private Integer carbs;
    private Integer protein;
    private Integer fat;
    private List<RecipeIngredientDTO> ingredients;
    // private List<AllergenDTO> allergens;
}

