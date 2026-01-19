package org.kmurygin.healthycarbs.auth;

public record OtpGeneratedEvent(
        String clientEmail,
        String username,
        String otp
) {
}
