package org.kmurygin.healthycarbs.mealplan.mapper;

import org.kmurygin.healthycarbs.mealplan.dto.DietaryProfileDTO;
import org.kmurygin.healthycarbs.mealplan.model.DietaryProfile;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DietaryProfileMapper {
    DietaryProfileDTO toDTO(DietaryProfile dietaryProfile);

    DietaryProfile toEntity(DietaryProfileDTO dietaryProfileDTO);
}
