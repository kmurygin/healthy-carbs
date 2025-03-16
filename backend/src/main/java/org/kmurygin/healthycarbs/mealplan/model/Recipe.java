package org.kmurygin.healthycarbs.mealplan.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private List<RecipeIngredient> ingredients;

    private Integer calories;

    private Integer carbs;

    private Integer protein;

    private Integer fat;


    @ManyToMany
    @JoinTable(
            name = "recipe_allergens",
            joinColumns = @JoinColumn(name = "recipe_id"),
            inverseJoinColumns = @JoinColumn(name = "allergen_id")
    )
    private List<Allergen> allergens;


}
