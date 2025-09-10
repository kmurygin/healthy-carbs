package org.kmurygin.healthycarbs.payu.dto;

public record PaymentStatusResponse(
        String localOrderId,
        String status
) {
}
