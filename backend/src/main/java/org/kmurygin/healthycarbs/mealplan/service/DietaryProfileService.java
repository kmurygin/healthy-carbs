package org.kmurygin.healthycarbs.mealplan.service;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.model.DietaryProfile;
import org.kmurygin.healthycarbs.mealplan.repository.DietaryProfileRepository;
import org.kmurygin.healthycarbs.user.User;
import org.kmurygin.healthycarbs.user.UserRepository;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class DietaryProfileService {

    private final DietaryProfileRepository dietaryProfileRepository;
    private final UserRepository userRepository;

    public DietaryProfile save(DietaryProfile dietaryProfile) {
        return dietaryProfileRepository.save(dietaryProfile);
    }

    public DietaryProfile findById(Long id) {
        return dietaryProfileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Dietary profile not found with id: " + id));
    }

    public DietaryProfile getByUserId(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        return dietaryProfileRepository.findByUser(user);
    }

}
