package org.kmurygin.healthycarbs.measurements.repository;

import org.kmurygin.healthycarbs.measurements.model.UserMeasurement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserMeasurementRepository extends JpaRepository<UserMeasurement, Long> {
    List<UserMeasurement> findAllByUserIdOrderByDateAsc(Long userId);

    Optional<UserMeasurement> findFirstByUserIdOrderByDateDesc(Long userId);
}
