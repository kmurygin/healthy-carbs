package org.kmurygin.healthycarbs.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.kmurygin.healthycarbs.auth.dto.*;
import org.kmurygin.healthycarbs.auth.model.PasswordRecoveryToken;
import org.kmurygin.healthycarbs.auth.repository.PasswordRecoveryTokenRepository;
import org.kmurygin.healthycarbs.email.EmailService;
import org.kmurygin.healthycarbs.storage.StorageProvider;
import org.kmurygin.healthycarbs.user.UserTestUtils;
import org.kmurygin.healthycarbs.user.model.Role;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("AuthenticationController Integration Tests")
class AuthenticationControllerIntegrationTest {

    private static final String BASE_URL = "/api/v1/auth";
    private final String uniqueSuffix = String.valueOf(System.currentTimeMillis());
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordRecoveryTokenRepository passwordRecoveryTokenRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @MockitoBean
    private StorageProvider storageProvider;
    @MockitoBean
    private EmailService emailService;
    private User existingUser;

    @BeforeEach
    void setUp() {
        existingUser = userRepository.save(
                UserTestUtils.createUserForPersistence("existinguser", uniqueSuffix, Role.USER, passwordEncoder));
    }

    @Nested
    @DisplayName("POST /register")
    class RegisterTests {

        @Test
        @DisplayName("register_whenValidRequest_shouldReturnOkWithToken")
        void register_whenValidRequest_shouldReturnOkWithToken() throws Exception {
            String timestamp = String.valueOf(System.nanoTime());
            RegisterRequest request = RegisterRequest.builder()
                    .firstName("Test")
                    .lastName("User")
                    .username("newuser_" + timestamp)
                    .email("newuser_" + timestamp + "@example.com")
                    .password("password1234567")
                    .build();

            mockMvc.perform(post(BASE_URL + "/register")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.token", notNullValue()))
                    .andExpect(jsonPath("$.message").value("User registered successfully"));
        }

        @Test
        @DisplayName("register_whenBlankUsername_shouldReturnBadRequest")
        void register_whenBlankUsername_shouldReturnBadRequest() throws Exception {
            RegisterRequest request = RegisterRequest.builder()
                    .firstName("Test")
                    .lastName("User")
                    .username("")
                    .email("test@example.com")
                    .password("password1234567")
                    .build();

            mockMvc.perform(post(BASE_URL + "/register")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("register_whenInvalidEmail_shouldReturnBadRequest")
        void register_whenInvalidEmail_shouldReturnBadRequest() throws Exception {
            RegisterRequest request = RegisterRequest.builder()
                    .firstName("Test")
                    .lastName("User")
                    .username("testuser")
                    .email("invalid-email")
                    .password("password1234567")
                    .build();

            mockMvc.perform(post(BASE_URL + "/register")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("register_whenPasswordTooShort_shouldReturnBadRequest")
        void register_whenPasswordTooShort_shouldReturnBadRequest() throws Exception {
            RegisterRequest request = RegisterRequest.builder()
                    .firstName("Test")
                    .lastName("User")
                    .username("testuser")
                    .email("test@example.com")
                    .password("short")
                    .build();

            mockMvc.perform(post(BASE_URL + "/register")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("register_whenDuplicateUsername_shouldReturnConflict")
        void register_whenDuplicateUsername_shouldReturnConflict() throws Exception {
            RegisterRequest request = RegisterRequest.builder()
                    .firstName("Test")
                    .lastName("User")
                    .username(existingUser.getUsername())
                    .email("new_" + System.nanoTime() + "@example.com")
                    .password("password1234567")
                    .build();

            mockMvc.perform(post(BASE_URL + "/register")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict());
        }
    }

    @Nested
    @DisplayName("POST /authenticate")
    class AuthenticateTests {

        @Test
        @DisplayName("authenticate_whenValidCredentials_shouldReturnOkWithToken")
        void authenticate_whenValidCredentials_shouldReturnOkWithToken() throws Exception {
            AuthenticationRequest request = AuthenticationRequest.builder()
                    .username(existingUser.getUsername())
                    .password(UserTestUtils.getDefaultPassword())
                    .build();

            mockMvc.perform(post(BASE_URL + "/authenticate")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.token", notNullValue()))
                    .andExpect(jsonPath("$.message").value("Authentication successful"));
        }

        @Test
        @DisplayName("authenticate_whenInvalidCredentials_shouldReturnUnauthorized")
        void authenticate_whenInvalidCredentials_shouldReturnUnauthorized() throws Exception {
            AuthenticationRequest request = AuthenticationRequest.builder()
                    .username(existingUser.getUsername())
                    .password("wrongpassword")
                    .build();

            mockMvc.perform(post(BASE_URL + "/authenticate")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("authenticate_whenUserNotExists_shouldReturnUnauthorized")
        void authenticate_whenUserNotExists_shouldReturnUnauthorized() throws Exception {
            AuthenticationRequest request = AuthenticationRequest.builder()
                    .username("nonexistent_user")
                    .password("password1234567")
                    .build();

            mockMvc.perform(post(BASE_URL + "/authenticate")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("POST /forgot-password")
    class ForgotPasswordTests {

        @Test
        @DisplayName("forgotPassword_whenValidUsername_shouldReturnOk")
        void forgotPassword_whenValidUsername_shouldReturnOk() throws Exception {
            ForgotPasswordRequest request = new ForgotPasswordRequest();
            request.setUsername(existingUser.getUsername());

            mockMvc.perform(post(BASE_URL + "/forgot-password")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("forgotPassword_whenUserNotExists_shouldStillReturnOk")
        void forgotPassword_whenUserNotExists_shouldStillReturnOk() throws Exception {
            ForgotPasswordRequest request = new ForgotPasswordRequest();
            request.setUsername("nonexistent_user");

            mockMvc.perform(post(BASE_URL + "/forgot-password")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("POST /verify-otp")
    class VerifyOtpTests {

        @Test
        @DisplayName("verifyOtp_whenValidOtp_shouldReturnOk")
        void verifyOtp_whenValidOtp_shouldReturnOk() throws Exception {
            String rawOtp = "123456";
            PasswordRecoveryToken token = passwordRecoveryTokenRepository.save(
                    PasswordRecoveryToken.builder()
                            .user(existingUser)
                            .token(passwordEncoder.encode(rawOtp))
                            .expiryDate(Instant.now().plus(15, ChronoUnit.MINUTES))
                            .build());

            VerifyOtpRequest request = new VerifyOtpRequest();
            request.setUsername(existingUser.getUsername());
            request.setOtp(rawOtp);

            mockMvc.perform(post(BASE_URL + "/verify-otp")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("verifyOtp_whenInvalidOtp_shouldReturnBadRequest")
        void verifyOtp_whenInvalidOtp_shouldReturnBadRequest() throws Exception {
            VerifyOtpRequest request = new VerifyOtpRequest();
            request.setUsername(existingUser.getUsername());
            request.setOtp("000000");

            mockMvc.perform(post(BASE_URL + "/verify-otp")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /reset-password")
    class ResetPasswordTests {

        @Test
        @DisplayName("resetPassword_whenValidOtp_shouldReturnOk")
        void resetPassword_whenValidOtp_shouldReturnOk() throws Exception {
            String rawOtp = "123456";
            PasswordRecoveryToken token = passwordRecoveryTokenRepository.save(
                    PasswordRecoveryToken.builder()
                            .user(existingUser)
                            .token(passwordEncoder.encode(rawOtp))
                            .expiryDate(Instant.now().plus(15, ChronoUnit.MINUTES))
                            .build());

            ResetPasswordRequest request = new ResetPasswordRequest();
            request.setUsername(existingUser.getUsername());
            request.setOtp(rawOtp);
            request.setNewPassword("NewPassword12345!");

            mockMvc.perform(post(BASE_URL + "/reset-password")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("resetPassword_whenInvalidOtp_shouldReturnBadRequest")
        void resetPassword_whenInvalidOtp_shouldReturnBadRequest() throws Exception {
            ResetPasswordRequest request = new ResetPasswordRequest();
            request.setUsername(existingUser.getUsername());
            request.setOtp("000000");
            request.setNewPassword("NewPassword12345!");

            mockMvc.perform(post(BASE_URL + "/reset-password")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }
}
