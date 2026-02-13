package org.kmurygin.healthycarbs.mealplan.mapper;

import org.kmurygin.healthycarbs.mealplan.dto.MealPlanDayDTO;
import org.kmurygin.healthycarbs.mealplan.model.MealPlanDay;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = {MealPlanRecipeMapper.class})
public interface MealPlanDayMapper {
    @Mapping(target = "date", source = "date")
    MealPlanDayDTO toDto(MealPlanDay mealPlanDay);

    @Mapping(target = "mealPlan", ignore = true)
    MealPlanDay toEntity(MealPlanDayDTO mealPlanDayDTO);
}
