package org.kmurygin.healthycarbs.payu.dto;

public record InitPaymentResponse(
        String payuOrderId,
        String redirectUri
) {
}
