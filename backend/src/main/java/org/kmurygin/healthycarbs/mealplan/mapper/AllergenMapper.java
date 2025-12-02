package org.kmurygin.healthycarbs.mealplan.mapper;

import org.kmurygin.healthycarbs.mealplan.dto.AllergenDTO;
import org.kmurygin.healthycarbs.mealplan.model.Allergen;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AllergenMapper {
    AllergenDTO toDTO(Object entity);

    Allergen toEntity(AllergenDTO dto);
}
