package org.kmurygin.healthycarbs.payments.dto;

import java.time.OffsetDateTime;

public record PaymentSummaryDTO(
        Long id,
        String provider,
        String title,
        String orderId,
        Integer amount,
        String currency,
        String status,
        OffsetDateTime createdAt
) {
}
