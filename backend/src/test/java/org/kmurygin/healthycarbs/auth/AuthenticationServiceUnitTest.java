package org.kmurygin.healthycarbs.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kmurygin.healthycarbs.auth.dto.AuthenticationRequest;
import org.kmurygin.healthycarbs.auth.dto.AuthenticationResponse;
import org.kmurygin.healthycarbs.auth.dto.RegisterRequest;
import org.kmurygin.healthycarbs.auth.service.AuthenticationService;
import org.kmurygin.healthycarbs.auth.service.RefreshTokenService;
import org.kmurygin.healthycarbs.config.JwtService;
import org.kmurygin.healthycarbs.email.EmailService;
import org.kmurygin.healthycarbs.exception.UnauthorizedException;
import org.kmurygin.healthycarbs.user.UserTestUtils;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.repository.UserRepository;
import org.kmurygin.healthycarbs.user.service.UserService;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthenticationService Unit Tests")
class AuthenticationServiceUnitTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserService userService;

    @Mock
    private EmailService emailService;

    @Mock
    private SpringTemplateEngine templateEngine;

    @Mock
    private RefreshTokenService refreshTokenService;

    private AuthenticationService authenticationService;

    private User testUser;

    @BeforeEach
    void setUp() {
        authenticationService = new AuthenticationService(
                userRepository,
                passwordEncoder,
                jwtService,
                authenticationManager,
                userService,
                emailService,
                templateEngine,
                refreshTokenService);

        testUser = UserTestUtils.createTestUser(1L, "testuser");
    }

    @Nested
    @DisplayName("getCurrentUser")
    class GetCurrentUserTests {

        @Test
        @DisplayName("getCurrentUser_whenAuthenticated_shouldReturnUser")
        void getCurrentUser_whenAuthenticated_shouldReturnUser() {
            SecurityContext securityContext = mock(SecurityContext.class);
            Authentication authentication = mock(Authentication.class);

            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.isAuthenticated()).thenReturn(true);
            when(authentication.getPrincipal()).thenReturn(testUser);

            SecurityContextHolder.setContext(securityContext);

            User result = authenticationService.getCurrentUser();

            assertThat(result).isEqualTo(testUser);

            SecurityContextHolder.clearContext();
        }

        @Test
        @DisplayName("getCurrentUser_whenNotAuthenticated_shouldThrowUnauthorized")
        void getCurrentUser_whenNotAuthenticated_shouldThrowUnauthorized() {
            SecurityContext securityContext = mock(SecurityContext.class);
            when(securityContext.getAuthentication()).thenReturn(null);

            SecurityContextHolder.setContext(securityContext);

            assertThatThrownBy(() -> authenticationService.getCurrentUser())
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessageContaining("No authenticated user found");

            SecurityContextHolder.clearContext();
        }

        @Test
        @DisplayName("getCurrentUser_whenPrincipalNotUser_shouldThrowUnauthorized")
        void getCurrentUser_whenPrincipalNotUser_shouldThrowUnauthorized() {
            SecurityContext securityContext = mock(SecurityContext.class);
            Authentication authentication = mock(Authentication.class);

            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.isAuthenticated()).thenReturn(true);
            when(authentication.getPrincipal()).thenReturn("anonymousUser");

            SecurityContextHolder.setContext(securityContext);

            assertThatThrownBy(() -> authenticationService.getCurrentUser())
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessageContaining("No authenticated user found");

            SecurityContextHolder.clearContext();
        }
    }

    @Nested
    @DisplayName("register")
    class RegisterTests {

        @Test
        @DisplayName("register_whenValidRequest_shouldReturnToken")
        void register_whenValidRequest_shouldReturnToken() {
            RegisterRequest request = RegisterRequest.builder()
                    .firstName("New")
                    .lastName("User")
                    .username("newuser")
                    .email("new@example.com")
                    .password("password123456")
                    .build();

            when(passwordEncoder.encode("password123456")).thenReturn("encodedPassword");
            when(userService.save(any(User.class))).thenAnswer(i -> {
                User u = i.getArgument(0);
                u.setId(1L);
                return u;
            });
            when(jwtService.generateToken(anyMap(), any(User.class))).thenReturn("jwt-token");
            when(refreshTokenService.createRefreshToken(any(User.class))).thenReturn("test-refresh-token");

            AuthenticationResponse result = authenticationService.register(request);

            assertThat(result.getToken()).isEqualTo("jwt-token");
            assertThat(result.getRefreshToken()).isEqualTo("test-refresh-token");
            verify(userService).save(any(User.class));
            verify(emailService).sendMail(any());
        }

        @Test
        @DisplayName("register_shouldEncodePassword")
        void register_shouldEncodePassword() {
            RegisterRequest request = RegisterRequest.builder()
                    .firstName("New")
                    .lastName("User")
                    .username("newuser")
                    .email("new@example.com")
                    .password("password123456")
                    .build();

            when(passwordEncoder.encode("password123456")).thenReturn("encodedPassword");
            when(jwtService.generateToken(anyMap(), any(User.class))).thenReturn("jwt-token");
            when(refreshTokenService.createRefreshToken(any(User.class))).thenReturn("test-refresh-token");

            authenticationService.register(request);

            verify(passwordEncoder).encode("password123456");
        }

        @Test
        @DisplayName("register_shouldSendWelcomeEmail")
        void register_shouldSendWelcomeEmail() {
            RegisterRequest request = RegisterRequest.builder()
                    .firstName("New")
                    .lastName("User")
                    .username("newuser")
                    .email("new@example.com")
                    .password("password123456")
                    .build();

            when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
            when(jwtService.generateToken(anyMap(), any(User.class))).thenReturn("jwt-token");
            when(refreshTokenService.createRefreshToken(any(User.class))).thenReturn("test-refresh-token");

            authenticationService.register(request);

            verify(emailService).sendMail(any());
        }
    }

    @Nested
    @DisplayName("authenticate")
    class AuthenticateTests {

        @Test
        @DisplayName("authenticate_whenValidCredentials_shouldReturnToken")
        void authenticate_whenValidCredentials_shouldReturnToken() {
            AuthenticationRequest request = AuthenticationRequest.builder()
                    .username("testuser")
                    .password("password123456")
                    .build();

            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
            when(jwtService.generateToken(anyMap(), any(User.class))).thenReturn("jwt-token");
            when(userRepository.save(any(User.class))).thenReturn(testUser);
            when(refreshTokenService.createRefreshToken(any(User.class))).thenReturn("test-refresh-token");

            AuthenticationResponse result = authenticationService.authenticate(request);

            assertThat(result.getToken()).isEqualTo("jwt-token");
            assertThat(result.getRefreshToken()).isEqualTo("test-refresh-token");
            verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        }

        @Test
        @DisplayName("authenticate_whenUserNotFound_shouldThrowUnauthorized")
        void authenticate_whenUserNotFound_shouldThrowUnauthorized() {
            AuthenticationRequest request = AuthenticationRequest.builder()
                    .username("nonexistent")
                    .password("password123456")
                    .build();

            when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authenticationService.authenticate(request))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessageContaining("Invalid username or password");
        }

        @Test
        @DisplayName("authenticate_whenAccountDeactivated_shouldThrowUnauthorized")
        void authenticate_whenAccountDeactivated_shouldThrowUnauthorized() {
            testUser.setIsActive(false);
            AuthenticationRequest request = AuthenticationRequest.builder()
                    .username("testuser")
                    .password("password123456")
                    .build();

            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

            assertThatThrownBy(() -> authenticationService.authenticate(request))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessageContaining("Invalid username or password");
        }

        @Test
        @DisplayName("authenticate_whenBadCredentials_shouldThrowUnauthorized")
        void authenticate_whenBadCredentials_shouldThrowUnauthorized() {
            AuthenticationRequest request = AuthenticationRequest.builder()
                    .username("testuser")
                    .password("wrongpassword")
                    .build();

            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
            doThrow(new BadCredentialsException("Bad credentials"))
                    .when(authenticationManager).authenticate(any());

            assertThatThrownBy(() -> authenticationService.authenticate(request))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessageContaining("Invalid username or password");
        }

        @Test
        @DisplayName("authenticate_shouldUpdateLastLoginAt")
        void authenticate_shouldUpdateLastLoginAt() {
            AuthenticationRequest request = AuthenticationRequest.builder()
                    .username("testuser")
                    .password("password123456")
                    .build();

            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
            when(jwtService.generateToken(anyMap(), any(User.class))).thenReturn("jwt-token");
            when(userRepository.save(any(User.class))).thenReturn(testUser);
            when(refreshTokenService.createRefreshToken(any(User.class))).thenReturn("test-refresh-token");

            authenticationService.authenticate(request);

            verify(userRepository).save(argThat(user -> user.getLastLoginAt() != null));
        }
    }
}
