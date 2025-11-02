package org.kmurygin.healthycarbs.payments.dto;

public record PaymentStatusResponse(
        String localOrderId,
        String status
) {
}
