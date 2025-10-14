package org.kmurygin.healthycarbs.mealplan.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.auth.AuthenticationService;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.NutritionCalculator;
import org.kmurygin.healthycarbs.mealplan.dto.DietaryProfilePayload;
import org.kmurygin.healthycarbs.mealplan.model.DietaryProfile;
import org.kmurygin.healthycarbs.mealplan.repository.DietaryProfileRepository;
import org.kmurygin.healthycarbs.user.User;
import org.kmurygin.healthycarbs.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class DietaryProfileService {

    private static final Logger logger = LoggerFactory.getLogger(DietaryProfileService.class);
    private final DietaryProfileRepository dietaryProfileRepository;
    private final UserRepository userRepository;
    private final AuthenticationService authenticationService;

    @Transactional
    public DietaryProfile save(DietaryProfilePayload payload) {
        User currentUser = authenticationService.getCurrentUser();
        DietaryProfile profile = dietaryProfileRepository.findByUser(currentUser);
        if (profile == null) {
            profile = new DietaryProfile();
        }
        updateDietaryProfile(profile, payload, currentUser);

        NutritionCalculator.DailyTargets targets = calculateNutritionForProfile(profile);
        profile.setCalorieTarget(targets.calories());
        profile.setCarbsTarget(targets.carbsGrams());
        profile.setProteinTarget(targets.proteinGrams());
        profile.setFatTarget(targets.fatGrams());

        logger.info("Saving dietary profile for user {}: {}", currentUser.getId(), profile);
        return dietaryProfileRepository.save(profile);
    }

    private void updateDietaryProfile(DietaryProfile profile, DietaryProfilePayload payload, User user) {
        profile.setUser(user);
        profile.setWeight(payload.getWeight());
        profile.setHeight(payload.getHeight());
        profile.setAge(payload.getAge());
        profile.setGender(payload.getGender());
        profile.setDietGoal(payload.getDietGoal());
        profile.setDietType(payload.getDietType());
        profile.setActivityLevel(payload.getActivityLevel());
    }

    private NutritionCalculator.DailyTargets calculateNutritionForProfile(DietaryProfile profile) {
        NutritionCalculator.CalculatorInput input = new NutritionCalculator.CalculatorInput(
                profile.getWeight(),
                profile.getHeight(),
                profile.getAge(),
                profile.getActivityLevel(),
                profile.getGender(),
                profile.getDietGoal()
        );
        return NutritionCalculator.calculate(input);
    }

    public DietaryProfile findById(Long id) {
        return dietaryProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dietary profile", "id", id));
    }

    public DietaryProfile isCreated() {
        User user = authenticationService.getCurrentUser();
        return dietaryProfileRepository.findByUser(user);
    }

    public DietaryProfile getByUserId(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return dietaryProfileRepository.findByUser(user);
    }

}
