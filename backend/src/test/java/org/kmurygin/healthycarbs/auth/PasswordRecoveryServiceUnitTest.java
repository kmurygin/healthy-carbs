package org.kmurygin.healthycarbs.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kmurygin.healthycarbs.auth.model.PasswordRecoveryToken;
import org.kmurygin.healthycarbs.auth.repository.PasswordRecoveryTokenRepository;
import org.kmurygin.healthycarbs.auth.service.PasswordRecoveryService;
import org.kmurygin.healthycarbs.exception.InvalidOtpException;
import org.kmurygin.healthycarbs.user.UserTestUtils;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.repository.UserRepository;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PasswordRecoveryService Unit Tests")
class PasswordRecoveryServiceUnitTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordRecoveryTokenRepository tokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    private PasswordRecoveryService passwordRecoveryService;

    private User testUser;

    @BeforeEach
    void setUp() {
        passwordRecoveryService = new PasswordRecoveryService(
                userRepository,
                tokenRepository,
                passwordEncoder,
                eventPublisher);

        testUser = UserTestUtils.createTestUser(1L, "testuser");
    }

    @Nested
    @DisplayName("forgotPassword")
    class ForgotPasswordTests {

        @Test
        @DisplayName("forgotPassword_whenUserExists_shouldGenerateOtpAndPublishEvent")
        void forgotPassword_whenUserExists_shouldGenerateOtpAndPublishEvent() {
            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
            when(passwordEncoder.encode(any())).thenReturn("encodedOtp");
            when(tokenRepository.findByUser(testUser)).thenReturn(Optional.empty());
            when(tokenRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            passwordRecoveryService.forgotPassword("testuser");

            verify(tokenRepository).save(any(PasswordRecoveryToken.class));
            verify(eventPublisher).publishEvent(any(OtpGeneratedEvent.class));
        }

        @Test
        @DisplayName("forgotPassword_whenUserNotFound_shouldNotThrowAndNotGenerateToken")
        void forgotPassword_whenUserNotFound_shouldNotThrowAndNotGenerateToken() {
            when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

            passwordRecoveryService.forgotPassword("nonexistent");

            verify(tokenRepository, never()).save(any());
            verify(eventPublisher, never()).publishEvent(any());
        }

        @Test
        @DisplayName("forgotPassword_whenTokenExists_shouldUpdateExistingToken")
        void forgotPassword_whenTokenExists_shouldUpdateExistingToken() {
            PasswordRecoveryToken existingToken = PasswordRecoveryToken.builder()
                    .id(1L)
                    .user(testUser)
                    .token("oldEncodedOtp")
                    .expiryDate(Instant.now().minus(1, ChronoUnit.HOURS))
                    .build();

            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
            when(passwordEncoder.encode(any())).thenReturn("newEncodedOtp");
            when(tokenRepository.findByUser(testUser)).thenReturn(Optional.of(existingToken));
            when(tokenRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            passwordRecoveryService.forgotPassword("testuser");

            ArgumentCaptor<PasswordRecoveryToken> captor = ArgumentCaptor.forClass(PasswordRecoveryToken.class);
            verify(tokenRepository).save(captor.capture());

            assertThat(captor.getValue().getToken()).isEqualTo("newEncodedOtp");
            assertThat(captor.getValue().getExpiryDate()).isAfter(Instant.now());
        }

        @Test
        @DisplayName("forgotPassword_shouldPublishOtpEvent")
        void forgotPassword_shouldPublishOtpEvent() {
            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
            when(passwordEncoder.encode(any())).thenReturn("encodedOtp");
            when(tokenRepository.findByUser(testUser)).thenReturn(Optional.empty());
            when(tokenRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            passwordRecoveryService.forgotPassword("testuser");

            ArgumentCaptor<OtpGeneratedEvent> captor = ArgumentCaptor.forClass(OtpGeneratedEvent.class);
            verify(eventPublisher).publishEvent(captor.capture());

            assertThat(captor.getValue().clientEmail()).isEqualTo("testuser@example.com");
            assertThat(captor.getValue().username()).isEqualTo("testuser");
            assertThat(captor.getValue().otp()).isNotBlank();
        }
    }

    @Nested
    @DisplayName("verifyOtp")
    class VerifyOtpTests {

        @Test
        @DisplayName("verifyOtp_whenValidOtp_shouldNotThrow")
        void verifyOtp_whenValidOtp_shouldNotThrow() {
            PasswordRecoveryToken token = PasswordRecoveryToken.builder()
                    .id(1L)
                    .user(testUser)
                    .token("encodedOtp")
                    .expiryDate(Instant.now().plus(15, ChronoUnit.MINUTES))
                    .build();

            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
            when(tokenRepository.findByUser(testUser)).thenReturn(Optional.of(token));
            when(passwordEncoder.matches("123456", "encodedOtp")).thenReturn(true);

            passwordRecoveryService.verifyOtp("testuser", "123456");
        }

        @Test
        @DisplayName("verifyOtp_whenUserNotFound_shouldThrowInvalidOtp")
        void verifyOtp_whenUserNotFound_shouldThrowInvalidOtp() {
            when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> passwordRecoveryService.verifyOtp("nonexistent", "123456"))
                    .isInstanceOf(InvalidOtpException.class)
                    .hasMessageContaining("Invalid or expired OTP");
        }

        @Test
        @DisplayName("verifyOtp_whenTokenNotFound_shouldThrowInvalidOtp")
        void verifyOtp_whenTokenNotFound_shouldThrowInvalidOtp() {
            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
            when(tokenRepository.findByUser(testUser)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> passwordRecoveryService.verifyOtp("testuser", "123456"))
                    .isInstanceOf(InvalidOtpException.class)
                    .hasMessageContaining("Invalid or expired OTP");
        }

        @Test
        @DisplayName("verifyOtp_whenOtpInvalid_shouldThrowInvalidOtp")
        void verifyOtp_whenOtpInvalid_shouldThrowInvalidOtp() {
            PasswordRecoveryToken token = PasswordRecoveryToken.builder()
                    .id(1L)
                    .user(testUser)
                    .token("encodedOtp")
                    .expiryDate(Instant.now().plus(15, ChronoUnit.MINUTES))
                    .build();

            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
            when(tokenRepository.findByUser(testUser)).thenReturn(Optional.of(token));
            when(passwordEncoder.matches("wrongOtp", "encodedOtp")).thenReturn(false);

            assertThatThrownBy(() -> passwordRecoveryService.verifyOtp("testuser", "wrongOtp"))
                    .isInstanceOf(InvalidOtpException.class)
                    .hasMessageContaining("Invalid or expired OTP");
        }

        @Test
        @DisplayName("verifyOtp_whenOtpExpired_shouldThrowInvalidOtp")
        void verifyOtp_whenOtpExpired_shouldThrowInvalidOtp() {
            PasswordRecoveryToken token = PasswordRecoveryToken.builder()
                    .id(1L)
                    .user(testUser)
                    .token("encodedOtp")
                    .expiryDate(Instant.now().minus(1, ChronoUnit.MINUTES))
                    .build();

            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
            when(tokenRepository.findByUser(testUser)).thenReturn(Optional.of(token));
            when(passwordEncoder.matches("123456", "encodedOtp")).thenReturn(true);

            assertThatThrownBy(() -> passwordRecoveryService.verifyOtp("testuser", "123456"))
                    .isInstanceOf(InvalidOtpException.class)
                    .hasMessageContaining("Invalid or expired OTP");
        }
    }

    @Nested
    @DisplayName("resetPassword")
    class ResetPasswordTests {

        @Test
        @DisplayName("resetPassword_whenValidOtp_shouldResetPasswordAndDeleteToken")
        void resetPassword_whenValidOtp_shouldResetPasswordAndDeleteToken() {
            PasswordRecoveryToken token = PasswordRecoveryToken.builder()
                    .id(1L)
                    .user(testUser)
                    .token("encodedOtp")
                    .expiryDate(Instant.now().plus(15, ChronoUnit.MINUTES))
                    .build();

            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
            when(tokenRepository.findByUser(testUser)).thenReturn(Optional.of(token));
            when(passwordEncoder.matches("123456", "encodedOtp")).thenReturn(true);
            when(passwordEncoder.encode("newPassword123")).thenReturn("newEncodedPassword");
            when(userRepository.save(any())).thenReturn(testUser);

            passwordRecoveryService.resetPassword("testuser", "123456", "newPassword123");

            verify(passwordEncoder).encode("newPassword123");
            verify(userRepository).save(argThat(user -> user.getPassword().equals("newEncodedPassword")));
            verify(tokenRepository).deleteByUser(testUser);
        }

        @Test
        @DisplayName("resetPassword_whenInvalidOtp_shouldThrowAndNotResetPassword")
        void resetPassword_whenInvalidOtp_shouldThrowAndNotResetPassword() {
            PasswordRecoveryToken token = PasswordRecoveryToken.builder()
                    .id(1L)
                    .user(testUser)
                    .token("encodedOtp")
                    .expiryDate(Instant.now().plus(15, ChronoUnit.MINUTES))
                    .build();

            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
            when(tokenRepository.findByUser(testUser)).thenReturn(Optional.of(token));
            when(passwordEncoder.matches("wrongOtp", "encodedOtp")).thenReturn(false);

            assertThatThrownBy(() -> passwordRecoveryService.resetPassword("testuser", "wrongOtp", "newPassword123"))
                    .isInstanceOf(InvalidOtpException.class);

            verify(tokenRepository, never()).deleteByUser(any());
        }
    }
}
