package org.kmurygin.healthycarbs.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kmurygin.healthycarbs.auth.model.RefreshToken;
import org.kmurygin.healthycarbs.auth.repository.RefreshTokenRepository;
import org.kmurygin.healthycarbs.auth.service.RefreshTokenService;
import org.kmurygin.healthycarbs.config.JwtService;
import org.kmurygin.healthycarbs.user.UserTestUtils;
import org.kmurygin.healthycarbs.user.model.User;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RefreshTokenService Unit Tests")
class RefreshTokenServiceUnitTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private JwtService jwtService;

    private RefreshTokenService refreshTokenService;

    private User testUser;

    @BeforeEach
    void setUp() {
        refreshTokenService = new RefreshTokenService(refreshTokenRepository, jwtService);
        testUser = UserTestUtils.createTestUser(1L, "testuser");
    }

    @Nested
    @DisplayName("createRefreshToken")
    class CreateRefreshTokenTests {

        @Test
        @DisplayName("should create token with UUID format and correct expiry")
        void createRefreshToken_shouldCreateTokenWithUuidAndCorrectExpiry() {
            when(jwtService.getRefreshTokenExpirationDays()).thenReturn(7L);
            when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArgument(0));

            String token = refreshTokenService.createRefreshToken(testUser);

            assertThat(token).isNotBlank();
            UUID.fromString(token); // throws if not valid UUID

            ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);
            verify(refreshTokenRepository).save(captor.capture());

            RefreshToken saved = captor.getValue();
            assertThat(saved.getUser()).isEqualTo(testUser);
            assertThat(saved.isRevoked()).isFalse();
            assertThat(saved.getExpiryDate()).isAfter(Instant.now().plus(6, ChronoUnit.DAYS));
            assertThat(saved.getExpiryDate()).isBefore(Instant.now().plus(8, ChronoUnit.DAYS));
        }
    }

    @Nested
    @DisplayName("rotateRefreshToken")
    class RotateRefreshTokenTests {

        @Test
        @DisplayName("should revoke old token and create new one")
        void rotateRefreshToken_validToken_shouldRevokeOldAndCreateNew() {
            RefreshToken existingToken = RefreshToken.builder()
                    .id(1L)
                    .token("old-token")
                    .expiryDate(Instant.now().plus(1, ChronoUnit.DAYS))
                    .revoked(false)
                    .user(testUser)
                    .build();

            when(refreshTokenRepository.findByTokenAndRevokedFalse("old-token"))
                    .thenReturn(Optional.of(existingToken));
            when(jwtService.getRefreshTokenExpirationDays()).thenReturn(7L);
            when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArgument(0));

            RefreshToken result = refreshTokenService.rotateRefreshToken("old-token");

            assertThat(existingToken.isRevoked()).isTrue();
            assertThat(result.getToken()).isNotEqualTo("old-token");
            assertThat(result.getUser()).isEqualTo(testUser);
            assertThat(result.isRevoked()).isFalse();
            verify(refreshTokenRepository, times(2)).save(any(RefreshToken.class));
        }

        @Test
        @DisplayName("should throw when token is expired")
        void rotateRefreshToken_expiredToken_shouldThrowIllegalState() {
            RefreshToken expiredToken = RefreshToken.builder()
                    .id(1L)
                    .token("expired-token")
                    .expiryDate(Instant.now().minus(1, ChronoUnit.HOURS))
                    .revoked(false)
                    .user(testUser)
                    .build();

            when(refreshTokenRepository.findByTokenAndRevokedFalse("expired-token"))
                    .thenReturn(Optional.of(expiredToken));
            when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArgument(0));

            assertThatThrownBy(() -> refreshTokenService.rotateRefreshToken("expired-token"))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("expired");
        }

        @Test
        @DisplayName("should throw when token is unknown")
        void rotateRefreshToken_unknownToken_shouldThrowIllegalArgument() {
            when(refreshTokenRepository.findByTokenAndRevokedFalse("unknown-token"))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> refreshTokenService.rotateRefreshToken("unknown-token"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Invalid refresh token");
        }
    }

    @Nested
    @DisplayName("revokeAllUserTokens")
    class RevokeAllUserTokensTests {

        @Test
        @DisplayName("should delegate to repository bulk revoke")
        void revokeAllUserTokens_shouldDelegateToRepository() {
            refreshTokenService.revokeAllUserTokens(testUser);

            verify(refreshTokenRepository).revokeAllByUser(testUser);
        }
    }
}
