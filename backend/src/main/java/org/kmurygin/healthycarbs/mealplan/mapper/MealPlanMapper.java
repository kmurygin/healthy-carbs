package org.kmurygin.healthycarbs.mealplan.mapper;

import org.kmurygin.healthycarbs.mealplan.dto.MealPlanDTO;
import org.kmurygin.healthycarbs.mealplan.model.MealPlan;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {MealPlanDayMapper.class})
public interface MealPlanMapper {
    MealPlanDTO toDTO(MealPlan plan);

    MealPlan toEntity(MealPlanDTO dto);
}