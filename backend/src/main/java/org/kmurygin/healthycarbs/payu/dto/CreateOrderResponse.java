package org.kmurygin.healthycarbs.payu.dto;

public record CreateOrderResponse(
        String statusCode,
        String redirectUri,
        String orderId
) {
}
