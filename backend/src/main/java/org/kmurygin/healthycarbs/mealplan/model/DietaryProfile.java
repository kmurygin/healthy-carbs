package org.kmurygin.healthycarbs.mealplan.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;
import org.kmurygin.healthycarbs.mealplan.ActivityLevel;
import org.kmurygin.healthycarbs.mealplan.DietType;
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
    @JoinColumn(name = "user_id")
    private User user;

    private Double weight; //kg
    private Double height; //cm
    private Integer age; //years

    @Enumerated(EnumType.STRING)
    private DietType dietType;

    @Enumerated(EnumType.STRING)
    private ActivityLevel activityLevel;

    private Double calorieTarget;
    private Double carbsTarget;
    private Double proteinTarget;
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
