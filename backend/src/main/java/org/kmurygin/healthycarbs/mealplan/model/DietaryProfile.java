package org.kmurygin.healthycarbs.mealplan.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;
import org.kmurygin.healthycarbs.mealplan.ActivityLevel;
import org.kmurygin.healthycarbs.mealplan.DietGoal;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.Gender;
import org.kmurygin.healthycarbs.user.User;

import java.util.Objects;

@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "dietary_profile")
public class DietaryProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(name = "weight")
    private Double weight; //kg

    @Column(name = "height")
    private Double height; //cm

    @Column(name = "age")
    private Integer age; //years

    @Column(name = "gender")
    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(name = "diet_goal")
    @Enumerated(EnumType.STRING)
    private DietGoal dietGoal;

    @Column(name = "diet_type")
    @Enumerated(EnumType.STRING)
    private DietType dietType;

    @Column(name = "activity_level")
    @Enumerated(EnumType.STRING)
    private ActivityLevel activityLevel;

    @Column(name = "calorie_target")
    private Double calorieTarget;

    @Column(name = "carbs_target")
    private Double carbsTarget;

    @Column(name = "protein_target")
    private Double proteinTarget;

    @Column(name = "fat_target")
    private Double fatTarget;

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (o == null) return false;
        Class<?> oEffectiveClass = o instanceof HibernateProxy ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass() : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass() : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        DietaryProfile that = (DietaryProfile) o;
        return getId() != null && Objects.equals(getId(), that.getId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode() : getClass().hashCode();
    }
}
