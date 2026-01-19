package org.kmurygin.healthycarbs.measurements.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.auth.service.AuthenticationService;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.service.DietaryProfileService;
import org.kmurygin.healthycarbs.measurements.mapper.UserMeasurementMapper;
import org.kmurygin.healthycarbs.measurements.model.UserMeasurement;
import org.kmurygin.healthycarbs.measurements.repository.UserMeasurementRepository;
import org.kmurygin.healthycarbs.user.User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserMeasurementService {

    private final UserMeasurementRepository userMeasurementRepository;
    private final DietaryProfileService dietaryProfileService;
    private final AuthenticationService authenticationService;
    private final UserMeasurementMapper userMeasurementMapper;

    @Transactional
    public void addMeasurement(UserMeasurement measurement) {
        User currentUser = authenticationService.getCurrentUser();

        measurement.setUser(currentUser);
        measurement.setDate(LocalDateTime.now());

        userMeasurementRepository.save(measurement);

        if (measurement.getWeight() != null) {
            dietaryProfileService.updateWeight(currentUser, measurement.getWeight());
        }
    }

    public List<UserMeasurement> findAll() {
        User currentUser = authenticationService.getCurrentUser();
        return userMeasurementRepository.findAllByUserIdOrderByDateAsc(currentUser.getId());
    }

    @Transactional
    public void updateRecentMeasurement(UserMeasurement update) {
        User currentUser = authenticationService.getCurrentUser();

        UserMeasurement recent = userMeasurementRepository
                .findFirstByUserIdOrderByDateDesc(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "UserMeasurement",
                        "userId",
                        currentUser.getId().toString()
                ));

        userMeasurementMapper.updateEntity(recent, update);
        userMeasurementRepository.save(recent);

        if (recent.getWeight() != null) {
            dietaryProfileService.updateWeight(currentUser, recent.getWeight());
        }
    }
}
