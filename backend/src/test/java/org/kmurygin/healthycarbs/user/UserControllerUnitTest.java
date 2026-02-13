package org.kmurygin.healthycarbs.user;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kmurygin.healthycarbs.user.controller.UserController;
import org.kmurygin.healthycarbs.user.dto.ChangePasswordRequest;
import org.kmurygin.healthycarbs.user.dto.CreateUserRequest;
import org.kmurygin.healthycarbs.user.dto.UpdateUserRequest;
import org.kmurygin.healthycarbs.user.dto.UserDTO;
import org.kmurygin.healthycarbs.user.mapper.UserMapper;
import org.kmurygin.healthycarbs.user.model.Role;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.service.UserPasswordService;
import org.kmurygin.healthycarbs.user.service.UserService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserController Unit Tests")
class UserControllerUnitTest {

    @Mock
    private UserService userService;

    @Mock
    private UserPasswordService userPasswordService;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserController userController;

    private User testUser;
    private UserDTO testUserDTO;

    @BeforeEach
    void setUp() {
        testUser = UserTestUtils.createTestUser();
        testUserDTO = UserDTO.builder()
                .id(1L)
                .username("userUsername")
                .firstName("Test")
                .lastName("User")
                .email("userUsername@example.com")
                .role(Role.USER)
                .build();
    }

    @Nested
    @DisplayName("getUserById")
    class GetUserByIdTests {

        @Test
        @DisplayName("getUserById_whenUserExists_shouldReturnUserDTO")
        void getUserById_whenUserExists_shouldReturnUserDTO() {
            when(userService.getCurrentUser()).thenReturn(testUser);
            when(userService.getUserById(1L)).thenReturn(Optional.of(testUser));
            when(userMapper.toDTO(testUser)).thenReturn(testUserDTO);

            ResponseEntity<?> response = userController.getUserById(1L);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            verify(userService).getUserById(1L);
            verify(userMapper).toDTO(testUser);
        }

        @Test
        @DisplayName("getUserById_whenUserNotExists_shouldReturnNotFound")
        void getUserById_whenUserNotExists_shouldReturnNotFound() {
            User admin = UserTestUtils.createAdmin();
            when(userService.getCurrentUser()).thenReturn(admin);
            when(userService.getUserById(999L)).thenReturn(Optional.empty());

            ResponseEntity<?> response = userController.getUserById(999L);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        }
    }

    @Nested
    @DisplayName("getUserByUsername")
    class GetUserByUsernameTests {

        @Test
        @DisplayName("getUserByUsername_whenUserExists_shouldReturnUserDTO")
        void getUserByUsername_whenUserExists_shouldReturnUserDTO() {
            when(userService.getCurrentUser()).thenReturn(testUser);
            when(userService.getUserByUsername("userUsername")).thenReturn(Optional.of(testUser));
            when(userMapper.toDTO(testUser)).thenReturn(testUserDTO);

            ResponseEntity<?> response = userController.getUserByUsername("userUsername");

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        }

        @Test
        @DisplayName("getUserByUsername_whenUserNotExists_shouldReturnNotFound")
        void getUserByUsername_whenUserNotExists_shouldReturnNotFound() {
            User admin = UserTestUtils.createAdmin();
            when(userService.getCurrentUser()).thenReturn(admin);
            when(userService.getUserByUsername("unknown")).thenReturn(Optional.empty());

            ResponseEntity<?> response = userController.getUserByUsername("unknown");

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        }
    }

    @Nested
    @DisplayName("createUser")
    class CreateUserTests {

        @Test
        @DisplayName("createUser_whenValidRequest_shouldReturnCreated")
        void createUser_whenValidRequest_shouldReturnCreated() {
            CreateUserRequest request = CreateUserRequest.builder()
                    .username("newuser")
                    .firstName("New")
                    .lastName("User")
                    .email("new@example.com")
                    .password("Password12345!")
                    .role("USER")
                    .build();
            User createdUser = User.builder().id(2L).username("newuser").build();
            UserDTO createdDTO = UserDTO.builder().id(2L).username("newuser").build();

            when(userService.save(request)).thenReturn(createdUser);
            when(userMapper.toDTO(createdUser)).thenReturn(createdDTO);

            ResponseEntity<?> response = userController.createUser(request);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        }
    }

    @Nested
    @DisplayName("updateUser")
    class UpdateUserTests {

        @Test
        @DisplayName("updateUser_whenValidRequest_shouldReturnOk")
        void updateUser_whenValidRequest_shouldReturnOk() {
            when(userService.getCurrentUser()).thenReturn(testUser);
            UpdateUserRequest request = UpdateUserRequest.builder()
                    .firstName("Updated")
                    .lastName("Name")
                    .email("updated@example.com")
                    .build();
            User updatedUser = User.builder().id(1L).firstName("Updated").build();
            UserDTO updatedDTO = UserDTO.builder().id(1L).firstName("Updated").build();

            when(userService.update(eq(1L), any())).thenReturn(updatedUser);
            when(userMapper.toDTO(updatedUser)).thenReturn(updatedDTO);

            ResponseEntity<?> response = userController.updateUser(1L, request);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        }
    }

    @Nested
    @DisplayName("deleteUser")
    class DeleteUserTests {

        @Test
        @DisplayName("deleteUser_whenUserExists_shouldReturnNoContent")
        void deleteUser_whenUserExists_shouldReturnNoContent() {
            when(userService.getCurrentUser()).thenReturn(testUser);
            doNothing().when(userService).deleteUser(1L);

            ResponseEntity<?> response = userController.deleteUser(1L);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
            verify(userService).deleteUser(1L);
        }
    }

    @Nested
    @DisplayName("changePassword")
    class ChangePasswordTests {

        @Test
        @DisplayName("changePassword_whenValidRequest_shouldReturnOk")
        void changePassword_whenValidRequest_shouldReturnOk() {
            setupSecurityContext("testuser");

            ChangePasswordRequest request = ChangePasswordRequest.builder()
                    .oldPassword("oldPassword12")
                    .newPassword("newPassword123")
                    .build();

            doNothing().when(userPasswordService).changePassword("testuser", "oldPassword12", "newPassword123");

            ResponseEntity<?> response = userController.changePassword(request);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            verify(userPasswordService).changePassword("testuser", "oldPassword12", "newPassword123");

            SecurityContextHolder.clearContext();
        }

        private void setupSecurityContext(String username) {
            SecurityContext securityContext = mock(SecurityContext.class);
            Authentication authentication = mock(Authentication.class);
            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.getName()).thenReturn(username);
            SecurityContextHolder.setContext(securityContext);
        }
    }
}
