package org.kmurygin.healthycarbs.mealplan;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "diet_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DietType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "compatibility_level", nullable = false)
    private Integer compatibilityLevel;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DietType dietType = (DietType) o;
        return id != null && id.equals(dietType.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return name;
    }
}
