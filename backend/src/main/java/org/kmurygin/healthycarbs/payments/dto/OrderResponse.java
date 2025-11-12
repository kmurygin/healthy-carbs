package org.kmurygin.healthycarbs.payments.dto;

import java.time.OffsetDateTime;

public record OrderResponse(
        String localOrderId,
        String description,
        int totalAmount,
        String currency,
        OffsetDateTime createdAt,
        PaymentStatus paymentStatus
) {
}

