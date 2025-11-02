package org.kmurygin.healthycarbs.payments.dto;

public record Product(
        String name,
        String unitPrice,
        String quantity
) {
}
