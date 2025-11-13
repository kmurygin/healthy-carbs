package org.kmurygin.healthycarbs.payments.dto;

public record Buyer(
        String email,
        String firstName,
        String lastName,
        String language
) {
}
