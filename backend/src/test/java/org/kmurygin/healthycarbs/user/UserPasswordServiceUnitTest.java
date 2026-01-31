package org.kmurygin.healthycarbs.user;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kmurygin.healthycarbs.exception.InvalidOldPasswordException;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.repository.UserRepository;
import org.kmurygin.healthycarbs.user.service.UserPasswordService;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserPasswordService Unit Tests")
class UserPasswordServiceUnitTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UserPasswordService userPasswordService;

    private User testUser;

    @BeforeEach
    void setUp() {
        userPasswordService = new UserPasswordService(userRepository, passwordEncoder);

        testUser = UserTestUtils.createTestUser(1L, "testuser");
        testUser.setPassword("encodedOldPassword");
    }

    @Test
    @DisplayName("changePassword_whenValidCredentials_shouldUpdatePassword")
    void changePassword_whenValidCredentials_shouldUpdatePassword() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("oldPassword", "encodedOldPassword")).thenReturn(true);
        when(passwordEncoder.encode("newPassword")).thenReturn("encodedNewPassword");

        userPasswordService.changePassword("testuser", "oldPassword", "newPassword");

        assertThat(testUser.getPassword()).isEqualTo("encodedNewPassword");
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("changePassword_whenUserNotFound_shouldThrowResourceNotFound")
    void changePassword_whenUserNotFound_shouldThrowResourceNotFound() {
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userPasswordService.changePassword("nonexistent", "old", "new"))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("changePassword_whenWrongOldPassword_shouldThrowInvalidOldPassword")
    void changePassword_whenWrongOldPassword_shouldThrowInvalidOldPassword() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongOldPassword", "encodedOldPassword")).thenReturn(false);

        assertThatThrownBy(() -> userPasswordService.changePassword("testuser", "wrongOldPassword", "newPassword"))
                .isInstanceOf(InvalidOldPasswordException.class);

        verify(userRepository, never()).save(any());
        verify(passwordEncoder, never()).encode(anyString());
    }
}
