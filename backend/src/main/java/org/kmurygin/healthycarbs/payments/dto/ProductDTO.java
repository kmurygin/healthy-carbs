package org.kmurygin.healthycarbs.payments.dto;

public record ProductDTO(
        String name,
        String unitPrice,
        String quantity
) {
}
