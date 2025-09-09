package org.kmurygin.healthycarbs.payu.dto;

import java.time.OffsetDateTime;

public record OrderResponse(
        String localOrderId,
        String description,
        int totalAmount,
        String currency,
        OffsetDateTime createdAt,
        String paymentStatus
) {
}

