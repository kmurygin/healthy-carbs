package org.kmurygin.healthycarbs.offers;

import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface OfferMapper {
    OfferDTO toDTO(Offer offer);

    Offer toEntity(OfferDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    void updateFromEntity(Offer source, @MappingTarget Offer target);
}
