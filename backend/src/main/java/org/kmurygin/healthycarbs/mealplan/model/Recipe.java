package org.kmurygin.healthycarbs.mealplan.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.MealType;

import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
@Entity
@Table(name = "recipes")
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL)
    @Builder.Default
    private List<RecipeIngredient> ingredients = new ArrayList<>();

    private Integer calories;

    private Integer carbs;

    private Integer protein;

    private Integer fat;

    public boolean addIngredient(RecipeIngredient ingredient)
    {
        if (ingredient == null) return false;
        if (this.ingredients == null) this.ingredients = new ArrayList<>();
        this.ingredients.add(ingredient);
        ingredient.setRecipe(this);
        return true;
    }

    public boolean removeIngredient(RecipeIngredient ingredient)
    {
        if (this.ingredients == null || ingredient == null) return false;
        this.ingredients.remove(ingredient);
        ingredient.setRecipe(null);
        return true;
    }

    @ManyToMany
    @JoinTable(
            name = "recipe_allergens",
            joinColumns = @JoinColumn(name = "recipe_id"),
            inverseJoinColumns = @JoinColumn(name = "allergen_id")
    )
    private List<Allergen> allergens;

    private DietType dietType;

    private MealType mealType;
}
