package org.kmurygin.healthycarbs.email;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ContactEmailRequest(
        @NotBlank(message = "Subject is required")
        String subject,

        @NotBlank(message = "Message is required")
        @Size(max = 2000, message = "Message must be at most 2000 characters")
        String message,

        @NotNull(message = "Recipient user ID is required")
        Long recipientUserId
) {
}
