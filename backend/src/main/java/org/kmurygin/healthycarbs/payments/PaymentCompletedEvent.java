package org.kmurygin.healthycarbs.payments;

public record PaymentCompletedEvent(
        String localOrderId,
        Long offerId,
        String dietitianEmail,
        String dietitianName,
        String clientName,
        String clientEmail
) {
}
