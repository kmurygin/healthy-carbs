package org.kmurygin.healthycarbs.mealplan.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;


@Entity
@Table(name = "meal_plan_days")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@ToString(exclude = {"recipes", "mealPlan"})
public class MealPlanDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DayOfWeek dayOfWeek;

    private LocalDate date;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meal_plan_id")
    private MealPlan mealPlan;

    @OneToMany(
            mappedBy = "mealPlanDay",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<MealPlanRecipe> recipes = new ArrayList<>();

    private Double totalCalories;
    private Double totalCarbs;
    private Double totalProtein;
    private Double totalFat;

    public void addRecipe(Recipe recipe) {
        MealPlanRecipe mealPlanRecipe = new MealPlanRecipe(this, recipe, recipe.getMealType());
        recipes.add(mealPlanRecipe);
    }

    public void setRecipes(List<MealPlanRecipe> recipes) {
        this.recipes.forEach(recipe -> recipe.setMealPlanDay(null));
        this.recipes.clear();
        if (recipes != null) {
            for (MealPlanRecipe recipe : recipes) {
                recipe.setMealPlanDay(this);
                this.recipes.add(recipe);
            }
        }
    }

    public void removeRecipe(Recipe recipe) {
        recipes.removeIf(r -> r.getRecipe().equals(recipe));
    }

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (o == null) return false;
        Class<?> oEffectiveClass = o instanceof HibernateProxy ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass() : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass() : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        MealPlanDay that = (MealPlanDay) o;
        return getId() != null && Objects.equals(getId(), that.getId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode() : getClass().hashCode();
    }
}
