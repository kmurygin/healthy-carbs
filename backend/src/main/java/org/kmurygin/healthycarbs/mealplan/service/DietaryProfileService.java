package org.kmurygin.healthycarbs.mealplan.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.NutritionCalculator;
import org.kmurygin.healthycarbs.mealplan.dto.DietaryProfilePayload;
import org.kmurygin.healthycarbs.mealplan.model.DietaryProfile;
import org.kmurygin.healthycarbs.mealplan.repository.DietTypeRepository;
import org.kmurygin.healthycarbs.mealplan.repository.DietaryProfileRepository;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.repository.UserRepository;
import org.kmurygin.healthycarbs.user.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@RequiredArgsConstructor
@Service
public class DietaryProfileService {

    private final DietaryProfileRepository dietaryProfileRepository;
    private final DietTypeRepository dietTypeRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional
    public DietaryProfile save(DietaryProfilePayload payload) {
        User currentUser = userService.getCurrentUser();
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

        log.info("Saving dietary profile for user {}: {}", currentUser.getId(), profile);
        return dietaryProfileRepository.save(profile);
    }

    @Transactional
    public void updateWeight(User user, Double newWeight) {
        DietaryProfile profile = dietaryProfileRepository.findByUser(user);
        if (profile != null) {
            profile.setWeight(newWeight);
            applyNutritionalTargets(profile);
            dietaryProfileRepository.save(profile);

            log.info("Updated weight for user {} to {} kg and recalculated targets.", user.getId(), newWeight);
        }
    }

    private void applyNutritionalTargets(DietaryProfile profile) {
        NutritionCalculator.DailyTargets targets = calculateNutritionForProfile(profile);
        profile.applyTargets(targets);
    }

    private void updateDietaryProfile(DietaryProfile profile, DietaryProfilePayload payload, User user) {
        profile.setUser(user);
        profile.setWeight(payload.getWeight());
        profile.setHeight(payload.getHeight());
        profile.setAge(payload.getAge());
        profile.setGender(payload.getGender());
        profile.setDietGoal(payload.getDietGoal());
        profile.setActivityLevel(payload.getActivityLevel());

        DietType dietType = dietTypeRepository.findByName(payload.getDietType())
                .orElseThrow(() -> new ResourceNotFoundException("DietType", "name", payload.getDietType()));
        profile.setDietType(dietType);
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

    public DietaryProfile findCurrentUserProfile() {
        User user = userService.getCurrentUser();
        return dietaryProfileRepository.findByUser(user);
    }

    public DietaryProfile getByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return dietaryProfileRepository.findByUser(user);
    }

}
