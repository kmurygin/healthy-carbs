package org.kmurygin.healthycarbs.mealplan.service;

import org.kmurygin.healthycarbs.exception.BadRequestException;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.ActivityLevel;
import org.kmurygin.healthycarbs.mealplan.DietGoal;
import org.kmurygin.healthycarbs.mealplan.Gender;
import org.kmurygin.healthycarbs.mealplan.dto.UserProfileCreateDTO;
import org.kmurygin.healthycarbs.mealplan.dto.UserProfileDTO;
import org.kmurygin.healthycarbs.mealplan.mapper.UserProfileMapper;
import org.kmurygin.healthycarbs.mealplan.repository.UserProfileRepository;
import org.kmurygin.healthycarbs.user.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;

@Service
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;
    private final UserProfileMapper userProfileMapper;
    private final Map<ActivityLevel, Double> ActivityFactior = Map.of(
            ActivityLevel.SEDENTARY, 1.2,
            ActivityLevel.LIGHTLY_ACTIVE, 1.375,
            ActivityLevel.MODERATELY_ACTIVE, 1.55,
            ActivityLevel.VERY_ACTIVE, 1.725,
            ActivityLevel.SUPER_ACTIVE, 1.9
    );
    Double PROTEIN_PERCENTAGE = 0.25;
    Double CARBS_PERCENTAGE = 0.5;
    Double FAT_PERCENTAGE = 0.25;

    public UserProfileService(UserProfileRepository userProfileRepository, UserRepository userRepository, UserProfileMapper userProfileMapper) {
        this.userProfileRepository = userProfileRepository;
        this.userRepository = userRepository;
        this.userProfileMapper = userProfileMapper;
    }

    public UserProfileDTO calculateUserProfile(UserProfileCreateDTO userProfileCreateDTO) {
//        Double weight = userProfileCreateDTO.getWeight();
//        Double height = userProfileCreateDTO.getHeight();
//        Integer age = userProfileCreateDTO.getAge();
//        Gender gender = userProfileCreateDTO.getGender();
//        ActivityLevel activityLevel = userProfileCreateDTO.getActivityLevel();
//        DietGoal dietGoal = userProfileCreateDTO.getDietGoal();
//        DietType dietType = userProfileCreateDTO.getDietType();
//
//        User user = userRepository
//                .findByUsername(userProfileCreateDTO.getUsername())
//                .orElseThrow(() -> new ResourceNotFoundException("User", "username", userProfileCreateDTO.getUsername()));
//
//        Double totalCalories = calculateCaloriesForGoal(
//                calculateTDEE(
//                        calclateBMR(
//                                weight,
//                                height,
//                                age,
//                                gender
//                        ),
//                        activityLevel),
//                dietGoal);
//
//        Double protein = totalCalories * PROTEIN_PERCENTAGE;
//        Double carbs = totalCalories * CARBS_PERCENTAGE;
//        Double fat = totalCalories * FAT_PERCENTAGE;
//
//        UserProfileDTO userProfileDTO = new UserProfileDTO(
//                null,
//                user.getId(),
//                weight,
//                height,
//                age,
//                gender,
//                dietType,
//                activityLevel,
//                round(totalCalories,2),
//                round(carbs,2),
//                round(protein,2),
//                round(fat,2)
//        );

        return save(new UserProfileDTO());
    }

    public UserProfileDTO save(UserProfileDTO userProfileDTO) {
//        User user = userRepository.findById(userProfileDTO.getUserId())
//                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userProfileDTO.getUserId()));
//        UserProfile userProfileSaved = userProfileRepository.save(userProfileMapper.toEntity(userProfileDTO, user));
//        return userProfileMapper.toDTO(userProfileSaved);
        return new UserProfileDTO();
    }

    public List<UserProfileDTO> findAll() {
        return userProfileRepository.findAll()
                .stream()
                .map(userProfileMapper::toDTO)
                .toList();
    }

    public UserProfileDTO findById(Long id) {
        return userProfileRepository.findById(id)
                .map(userProfileMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", "id", id));
    }

    private Double calclateBMR(Double weight, Double height, Integer age, Gender gender) {
        if (gender == Gender.FEMALE) {
            return 10 * weight + 6.25 * height - 5 * age - 161;
        }
        return 10 * weight + 6.25 * height - 5 * age + 5;
    }

    private Double calculateTDEE(Double bmr, ActivityLevel activityLevel) {
        return bmr * ActivityFactior.get(activityLevel);
    }

    private Double calculateCaloriesForGoal(Double tdee, DietGoal dietGoal) {
        return switch (dietGoal) {
            case DietGoal.REDUCE -> tdee - tdee * 0.2;
            case DietGoal.GAIN -> tdee + tdee * 0.2;
            default -> tdee;
        };
    }

    private Double round(Double value, int places) {
        if (places < 0) throw new BadRequestException("Decimal places cannot be negative");
        BigDecimal bd = BigDecimal.valueOf(value);
        bd = bd.setScale(places, RoundingMode.HALF_UP);
        return bd.doubleValue();
    }
}
