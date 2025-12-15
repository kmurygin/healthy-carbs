package org.kmurygin.healthycarbs.offers.mealPlanTemplate;

import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.model.MealPlanDay;
import org.kmurygin.healthycarbs.mealplan.repository.MealPlanDayRepository;
import org.mapstruct.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface MealPlanTemplateMapper {
    @Mapping(target = "days", source = "dayIds", qualifiedByName = "mapIdsToMealPlanDays")
    MealPlanTemplate toEntity(
            MealPlanTemplateDTO dto,
            @Context MealPlanDayRepository mealPlanDayRepository
    );

    @Mapping(target = "dayIds", source = "days", qualifiedByName = "extractDayIds")
    MealPlanTemplateDTO toDTO(MealPlanTemplate entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "days", source = "dayIds", qualifiedByName = "mapIdsToMealPlanDays")
    void updateFromDTO(
            @MappingTarget MealPlanTemplate target,
            MealPlanTemplateDTO dto,
            @Context MealPlanDayRepository mealPlanDayRepository
    );

    @Named("extractDayIds")
    default List<Long> extractDayIds(List<MealPlanDay> days) {
        if (days == null || days.isEmpty()) {
            return List.of();
        }
        return days.stream()
                .map(MealPlanDay::getId)
                .toList();
    }

    @Named("mapIdsToMealPlanDays")
    default List<MealPlanDay> mapIdsToMealPlanDays(
            List<Long> ids,
            @Context MealPlanDayRepository repo
    ) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }

        List<MealPlanDay> mealPlanDays = repo.findAllById(ids);
        if (mealPlanDays.size() != ids.size()) {
            Set<Long> existingIds = mealPlanDays.stream()
                    .map(MealPlanDay::getId)
                    .collect(Collectors.toSet());
            Long missingId = ids.stream()
                    .filter(id -> !existingIds.contains(id))
                    .findFirst()
                    .orElse(null);
            throw new ResourceNotFoundException("MealPlanDay", "id", missingId);
        }

        Map<Long, MealPlanDay> mealPlanDayMap = mealPlanDays.stream()
                .collect(Collectors.toMap(MealPlanDay::getId, d -> d));
        return ids.stream()
                .map(mealPlanDayMap::get)
                .toList();
    }
}
