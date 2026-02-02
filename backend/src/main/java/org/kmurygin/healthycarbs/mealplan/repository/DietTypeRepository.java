package org.kmurygin.healthycarbs.mealplan.repository;

import org.kmurygin.healthycarbs.mealplan.DietType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DietTypeRepository extends JpaRepository<DietType, Long> {
    Optional<DietType> findByName(String name);

    List<DietType> findByCompatibilityLevelLessThanEqual(int level);
}
