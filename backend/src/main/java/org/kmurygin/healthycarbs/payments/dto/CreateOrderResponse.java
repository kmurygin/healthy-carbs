package org.kmurygin.healthycarbs.payments.dto;

public record CreateOrderResponse(
        String statusCode,
        String redirectUri,
        String orderId
) {
}
