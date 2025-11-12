package org.kmurygin.healthycarbs.offers;

import org.kmurygin.healthycarbs.mealplan.model.MealPlanDay;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface MealPlanTemplateMapper {

    @Mapping(source = "days", target = "dayIds", qualifiedByName = "extractDayIds")
    MealPlanTemplateDTO toDTO(MealPlanTemplate template);

    @Mapping(target = "days", ignore = true)
    MealPlanTemplate toEntity(MealPlanTemplateDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "days", ignore = true)
    void updateFromDTO(@MappingTarget MealPlanTemplate targetTemplate, MealPlanTemplateDTO dto);

    @Named("extractDayIds")
    default List<Long> extractDayIds(List<MealPlanDay> days) {
        if (days == null) {
            return null;
        }
        return days.stream().map(MealPlanDay::getId).toList();
    }
}
