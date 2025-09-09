package org.kmurygin.healthycarbs.payu.dto;

import java.util.List;

public record CreateOrderRequest(
        String continueUrl,
        String notifyUrl,
        String customerIp,
        String merchantPosId,
        String description,
        String currencyCode,
        String extOrderId,
        String totalAmount,
        Buyer buyer,
        List<Product> products
) {
}
