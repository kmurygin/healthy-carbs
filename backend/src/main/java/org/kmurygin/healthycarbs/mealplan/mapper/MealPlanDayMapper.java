package org.kmurygin.healthycarbs.mealplan.mapper;

import org.kmurygin.healthycarbs.mealplan.dto.MealPlanDayDTO;
import org.kmurygin.healthycarbs.mealplan.model.MealPlanDay;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = {MealPlanRecipeMapper.class})
public interface MealPlanDayMapper {
    MealPlanDayDTO toDto(MealPlanDay mealPlanDay);

    MealPlanDay toEntity(MealPlanDayDTO mealPlanDayDTO);
}
