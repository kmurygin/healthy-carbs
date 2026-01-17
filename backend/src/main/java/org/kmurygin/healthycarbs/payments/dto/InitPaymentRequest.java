package org.kmurygin.healthycarbs.payments.dto;

import java.util.List;

public record InitPaymentRequest(
        String localOrderId,
        String description,
        int totalAmount,
        Long offerId,
        List<ProductDTO> products
) {
}
