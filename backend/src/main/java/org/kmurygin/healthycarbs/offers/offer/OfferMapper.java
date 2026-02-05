package org.kmurygin.healthycarbs.offers.offer;

import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface OfferMapper {
    @Mapping(source = "mealPlanTemplate.id", target = "mealPlanTemplateId")
    @Mapping(source = "mealPlanTemplate.name", target = "mealPlanTemplateName")
    @Mapping(source = "mealPlanTemplate.totalCalories", target = "mealPlanTemplateCalories")
    @Mapping(source = "mealPlanTemplate.totalCarbs", target = "mealPlanTemplateCarbs")
    @Mapping(source = "mealPlanTemplate.totalProtein", target = "mealPlanTemplateProtein")
    @Mapping(source = "mealPlanTemplate.totalFat", target = "mealPlanTemplateFat")
    OfferDTO toDTO(Offer offer);

    @Mapping(target = "mealPlanTemplate", ignore = true)
    Offer toEntity(OfferDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    void updateFromEntity(Offer source, @MappingTarget Offer target);
}
