package org.kmurygin.healthycarbs.offers;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface OfferMapper {
    OfferDTO toDto(Offer offer);

    Offer toEntity(OfferDTO dto);
}
