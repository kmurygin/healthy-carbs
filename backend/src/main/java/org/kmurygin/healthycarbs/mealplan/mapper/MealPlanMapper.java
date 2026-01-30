package org.kmurygin.healthycarbs.mealplan.mapper;

import org.kmurygin.healthycarbs.mealplan.dto.MealPlanDTO;
import org.kmurygin.healthycarbs.mealplan.model.MealPlan;
import org.kmurygin.healthycarbs.user.mapper.UserMapper;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {MealPlanDayMapper.class, UserMapper.class})
public interface MealPlanMapper {
    MealPlanDTO toDTO(MealPlan plan);

    MealPlan toEntity(MealPlanDTO dto);
}