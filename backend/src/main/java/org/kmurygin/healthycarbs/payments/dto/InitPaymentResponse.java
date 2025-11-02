package org.kmurygin.healthycarbs.payments.dto;

public record InitPaymentResponse(
        String payuOrderId,
        String redirectUri
) {
}
