package org.kmurygin.healthycarbs.measurements.repository;

import org.kmurygin.healthycarbs.measurements.model.UserMeasurement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserMeasurementRepository extends JpaRepository<UserMeasurement, Long> {
    List<UserMeasurement> findAllByUserIdOrderByDateAsc(Long userId);
}
