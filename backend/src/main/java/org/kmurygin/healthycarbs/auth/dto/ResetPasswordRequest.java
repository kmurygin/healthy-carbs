package org.kmurygin.healthycarbs.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank(message = "Username must not be blank")
    private String username;

    @NotBlank(message = "OTP must not be blank")
    private String otp;

    @NotBlank(message = "New password must not be blank")
    @Size(min = 12, max = 100, message = "Password must be between 12 and 100 characters")
    private String newPassword;
}
