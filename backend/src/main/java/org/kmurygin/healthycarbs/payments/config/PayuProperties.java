package org.kmurygin.healthycarbs.payments.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "payu")
public record PayuProperties(
        String baseUrl,
        String posId,
        String clientId,
        String clientSecret,
        String secondKey,
        String continueUrl,
        String notifyUrl,
        String currency
) {
}
