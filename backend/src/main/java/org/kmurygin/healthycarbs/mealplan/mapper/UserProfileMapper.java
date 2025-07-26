package org.kmurygin.healthycarbs.mealplan.mapper;

import org.kmurygin.healthycarbs.mealplan.dto.UserProfileDTO;
import org.kmurygin.healthycarbs.mealplan.model.UserProfile;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserProfileMapper {
    UserProfileDTO toDTO(UserProfile userProfile);

    UserProfile toEntity(UserProfileDTO userProfileDTO);
}
