package org.kmurygin.healthycarbs.mealplan.repository;

import org.kmurygin.healthycarbs.mealplan.model.DietaryProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DietaryProfileRepository extends JpaRepository<DietaryProfile, Long> {
//    UserProfile findByUserId(Integer userId);
}
