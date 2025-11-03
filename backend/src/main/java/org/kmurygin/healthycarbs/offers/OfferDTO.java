package org.kmurygin.healthycarbs.offers;

import java.util.Set;

public record OfferDTO(
        Long id,
        String title,
        String description,
        int price,
        String currency,
        Set<String> features
) {
}