package org.kmurygin.healthycarbs.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyOtpRequest {
    @NotBlank(message = "Username must not be blank")
    private String username;

    @NotBlank(message = "OTP must not be blank")
    private String otp;
}
