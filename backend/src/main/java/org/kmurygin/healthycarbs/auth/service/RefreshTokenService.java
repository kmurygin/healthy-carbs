package org.kmurygin.healthycarbs.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kmurygin.healthycarbs.auth.model.RefreshToken;
import org.kmurygin.healthycarbs.auth.repository.RefreshTokenRepository;
import org.kmurygin.healthycarbs.config.JwtService;
import org.kmurygin.healthycarbs.user.model.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;

    public String createRefreshToken(User user) {
        RefreshToken refreshToken = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plus(jwtService.getRefreshTokenExpirationDays(), ChronoUnit.DAYS))
                .user(user)
                .build();
        log.info("Created refresh token for user {}", user.getUsername());
        refreshTokenRepository.save(refreshToken);
        return refreshToken.getToken();
    }

    @Transactional
    public RefreshToken rotateRefreshToken(String token) {
        RefreshToken existingToken = refreshTokenRepository.findByTokenAndRevokedFalse(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (existingToken.getExpiryDate().isBefore(Instant.now())) {
            existingToken.setRevoked(true);
            refreshTokenRepository.save(existingToken);
            throw new IllegalStateException("Refresh token has expired");
        }

        existingToken.setRevoked(true);
        refreshTokenRepository.save(existingToken);

        RefreshToken newToken = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plus(jwtService.getRefreshTokenExpirationDays(), ChronoUnit.DAYS))
                .user(existingToken.getUser())
                .build();

        log.info("Rotated refresh token for user {}", existingToken.getUser().getUsername());

        return refreshTokenRepository.save(newToken);
    }

    @Transactional
    public void revokeAllUserTokens(User user) {
        refreshTokenRepository.revokeAllByUser(user);
    }
}
