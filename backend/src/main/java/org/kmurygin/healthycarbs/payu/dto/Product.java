package org.kmurygin.healthycarbs.payu.dto;

public record Product(
        String name,
        String unitPrice,
        String quantity
) {
}
