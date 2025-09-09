package org.kmurygin.healthycarbs.payu.dto;

public record Buyer(
        String email,
        String firstName,
        String lastName,
        String language
) {
}
