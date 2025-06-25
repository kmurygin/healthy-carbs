package org.kmurygin.healthycarbs.mealplan.mapper;

import org.kmurygin.healthycarbs.mealplan.dto.UserProfileDTO;
import org.kmurygin.healthycarbs.mealplan.model.UserProfile;
import org.kmurygin.healthycarbs.user.User;
import org.springframework.stereotype.Component;

@Component
public class UserProfileMapper {

    public UserProfileDTO toDTO(UserProfile userProfile) {
        if (userProfile == null) {
            return null;
        }

        return UserProfileDTO.builder()
                .id(userProfile.getId())
                .userId(userProfile.getUserId().getId())
                .weight(userProfile.getWeight())
                .height(userProfile.getHeight())
                .age(userProfile.getAge())
                .gender(userProfile.getGender())
                .dietType(userProfile.getDietType())
                .activityLevel(userProfile.getActivityLevel())
                .caloriesPerDay(userProfile.getCaloriesPerDay())
                .carbsPerDay(userProfile.getCarbsPerDay())
                .proteinPerDay(userProfile.getProteinPerDay())
                .fatPerDay(userProfile.getFatPerDay())
                .build();
    }

    public UserProfile toEntity(UserProfileDTO dto, User user) {
        if (dto == null) {
            return null;
        }

        return UserProfile.builder()
                .id(dto.getId())
                .userId(user)
                .weight(dto.getWeight())
                .height(dto.getHeight())
                .age(dto.getAge())
                .gender(dto.getGender())
                .dietType(dto.getDietType())
                .activityLevel(dto.getActivityLevel())
                .caloriesPerDay(dto.getCaloriesPerDay())
                .carbsPerDay(dto.getCarbsPerDay())
                .proteinPerDay(dto.getProteinPerDay())
                .fatPerDay(dto.getFatPerDay())
                .build();
    }
}
