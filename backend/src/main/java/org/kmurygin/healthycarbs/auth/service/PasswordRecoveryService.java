package org.kmurygin.healthycarbs.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kmurygin.healthycarbs.auth.OtpGeneratedEvent;
import org.kmurygin.healthycarbs.auth.model.PasswordRecoveryToken;
import org.kmurygin.healthycarbs.auth.repository.PasswordRecoveryTokenRepository;
import org.kmurygin.healthycarbs.exception.InvalidOtpException;
import org.kmurygin.healthycarbs.user.User;
import org.kmurygin.healthycarbs.user.UserRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordRecoveryService {

    private final UserRepository userRepository;
    private final PasswordRecoveryTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void forgotPassword(String username) {
        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isEmpty()) {
            log.warn("Password recovery requested for a user that does not exist in db, username: {}", username);
            return;
        }

        User user = userOptional.get();

        String otp = generateSecureOtp();
        String encodedOtp = passwordEncoder.encode(otp);

        LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(15);

        PasswordRecoveryToken recoveryToken = tokenRepository.findByUser(user)
                .map(existingToken -> {
                    existingToken.setToken(encodedOtp);
                    existingToken.setExpiryDate(expiryDate);
                    return existingToken;
                })
                .orElseGet(() -> PasswordRecoveryToken.builder()
                        .token(encodedOtp)
                        .expiryDate(expiryDate)
                        .user(user)
                        .build());

        tokenRepository.save(recoveryToken);

        eventPublisher.publishEvent(new OtpGeneratedEvent(
                user.getEmail(),
                user.getUsername(),
                otp
        ));
    }

    public void verifyOtp(String username, String otp) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new InvalidOtpException("Invalid request"));

        PasswordRecoveryToken recoveryToken = tokenRepository.findByUser(user)
                .orElseThrow(() -> new InvalidOtpException("OTP for %s has not been generated".formatted(username)));

        if (!passwordEncoder.matches(otp, recoveryToken.getToken())) {
            throw new InvalidOtpException("Invalid OTP code provided.");
        }

        if (recoveryToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new InvalidOtpException("OTP code has expired.");
        }
    }

    @Transactional
    public void resetPassword(String username, String otp, String newPassword) {
        verifyOtp(username, otp);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new InvalidOtpException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        tokenRepository.deleteByUser(user);
    }

    private String generateSecureOtp() {
        int otpValue = secureRandom.nextInt(1_000_000);
        return String.format("%06d", otpValue);
    }
}
