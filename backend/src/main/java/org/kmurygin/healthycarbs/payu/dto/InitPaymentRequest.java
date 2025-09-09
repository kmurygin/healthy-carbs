package org.kmurygin.healthycarbs.payu.dto;

import java.util.List;

public record InitPaymentRequest(
        String localOrderId,
        String description,
        int totalAmount,
        List<Product> products
) {
}
