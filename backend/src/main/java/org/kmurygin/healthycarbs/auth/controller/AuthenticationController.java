package org.kmurygin.healthycarbs.auth.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.auth.dto.*;
import org.kmurygin.healthycarbs.auth.service.AuthenticationService;
import org.kmurygin.healthycarbs.auth.service.PasswordRecoveryService;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.kmurygin.healthycarbs.util.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final PasswordRecoveryService passwordRecoveryService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        AuthenticationResponse authResponse = authenticationService.register(request);
        return ApiResponses.success(
                HttpStatus.OK,
                authResponse,
                "User registered successfully"
        );
    }

    @PostMapping("/authenticate")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> authenticate(
            @Valid @RequestBody AuthenticationRequest request
    ) {
        AuthenticationResponse authResponse = authenticationService.authenticate(request);
        return ApiResponses.success(
                HttpStatus.OK,
                authResponse,
                "Authentication successful"
        );
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {
        passwordRecoveryService.forgotPassword(request.getUsername());
        return ApiResponses.success(
                HttpStatus.OK,
                null,
                "If an account with that username exists, an OTP code has been sent."
        );
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request
    ) {
        passwordRecoveryService.verifyOtp(request.getUsername(), request.getOtp());
        return ApiResponses.success(
                HttpStatus.OK,
                null,
                "OTP has been verified successfully."
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        passwordRecoveryService.resetPassword(
                request.getUsername(), request.getOtp(), request.getNewPassword()
        );
        return ApiResponses.success(
                HttpStatus.OK,
                null,
                "Password has been reset successfully."
        );
    }
}
