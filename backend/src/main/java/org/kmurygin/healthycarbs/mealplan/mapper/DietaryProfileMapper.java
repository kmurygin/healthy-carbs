package org.kmurygin.healthycarbs.mealplan.mapper;

import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.dto.DietaryProfileDTO;
import org.kmurygin.healthycarbs.mealplan.model.DietaryProfile;
import org.kmurygin.healthycarbs.user.mapper.UserMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface DietaryProfileMapper {

    @Mapping(target = "dietType", expression = "java(mapDietTypeToString(dietaryProfile.getDietType()))")
    DietaryProfileDTO toDTO(DietaryProfile dietaryProfile);

    @Mapping(target = "dietType", ignore = true)
    DietaryProfile toEntity(DietaryProfileDTO dietaryProfileDTO);

    default String mapDietTypeToString(DietType dietType) {
        return dietType != null ? dietType.getName() : null;
    }
}
