package org.kmurygin.healthycarbs.mealplan.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;
import org.kmurygin.healthycarbs.user.User;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "meal_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class MealPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private User user;

    @OneToMany(mappedBy = "mealPlan",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    @Builder.Default
    private List<MealPlanRecipe> recipes = new ArrayList<>();

    private Double totalCalories;
    private Double totalCarbs;
    private Double totalProtein;
    private Double totalFat;

    public void addRecipe(Recipe recipe) {
        MealPlanRecipe mealPlanRecipe = new MealPlanRecipe(null, this, recipe, recipe.getMealType());
        recipes.add(mealPlanRecipe);
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
        MealPlan mealPlan = (MealPlan) o;
        return getId() != null && Objects.equals(getId(), mealPlan.getId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode() : getClass().hashCode();
    }
}