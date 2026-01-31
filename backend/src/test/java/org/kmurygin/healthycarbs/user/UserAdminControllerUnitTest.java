package org.kmurygin.healthycarbs.user;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kmurygin.healthycarbs.user.controller.UserAdminController;
import org.kmurygin.healthycarbs.user.dto.ChangeRoleRequest;
import org.kmurygin.healthycarbs.user.dto.UserDTO;
import org.kmurygin.healthycarbs.user.mapper.UserMapper;
import org.kmurygin.healthycarbs.user.model.Role;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.service.UserAdminService;
import org.kmurygin.healthycarbs.user.service.UserService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserAdminController Unit Tests")
class UserAdminControllerUnitTest {

    @Mock
    private UserAdminService userAdminService;

    @Mock
    private UserService userService;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserAdminController userAdminController;

    private User adminUser;
    private User testUser;
    private UserDTO testUserDTO;

    @BeforeEach
    void setUp() {
        adminUser = UserTestUtils.createAdmin();

        testUser = UserTestUtils.createTestUser(2L, "testuser");
        testUser.setIsActive(true);

        testUserDTO = UserDTO.builder()
                .id(2L)
                .username("testuser")
                .role(Role.USER)
                .isActive(true)
                .build();
    }

    @Nested
    @DisplayName("getAllUsers")
    class GetAllUsersTests {

        @Test
        @DisplayName("getAllUsers_shouldReturnAllUsers")
        void getAllUsers_shouldReturnAllUsers() {
            when(userAdminService.getAllUsers()).thenReturn(List.of(testUser));
            when(userMapper.toDTO(testUser)).thenReturn(testUserDTO);

            ResponseEntity<?> response = userAdminController.getAllUsers();

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            verify(userAdminService).getAllUsers();
        }

        @Test
        @DisplayName("getAllUsers_whenEmpty_shouldReturnEmptyList")
        void getAllUsers_whenEmpty_shouldReturnEmptyList() {
            when(userAdminService.getAllUsers()).thenReturn(List.of());

            ResponseEntity<?> response = userAdminController.getAllUsers();

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        }
    }

    @Nested
    @DisplayName("changeUserRole")
    class ChangeUserRoleTests {

        @Test
        @DisplayName("changeUserRole_whenValidRequest_shouldReturnUpdatedUser")
        void changeUserRole_whenValidRequest_shouldReturnUpdatedUser() {
            ChangeRoleRequest request = ChangeRoleRequest.builder()
                    .role(Role.DIETITIAN)
                    .build();
            User updatedUser = User.builder().id(2L).role(Role.DIETITIAN).build();
            UserDTO updatedDTO = UserDTO.builder().id(2L).role(Role.DIETITIAN).build();

            when(userService.getCurrentUser()).thenReturn(adminUser);
            when(userAdminService.changeUserRole(eq(2L), eq(Role.DIETITIAN), any())).thenReturn(updatedUser);
            when(userMapper.toDTO(updatedUser)).thenReturn(updatedDTO);

            ResponseEntity<?> response = userAdminController.changeUserRole(2L, request);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            verify(userAdminService).changeUserRole(eq(2L), eq(Role.DIETITIAN), any());
        }
    }

    @Nested
    @DisplayName("toggleUserActiveStatus")
    class ToggleUserActiveStatusTests {

        @Test
        @DisplayName("toggleUserActiveStatus_shouldReturnUpdatedUser")
        void toggleUserActiveStatus_shouldReturnUpdatedUser() {
            User toggledUser = User.builder().id(2L).isActive(false).build();
            UserDTO toggledDTO = UserDTO.builder().id(2L).isActive(false).build();

            when(userService.getCurrentUser()).thenReturn(adminUser);
            when(userAdminService.toggleUserActiveStatus(eq(2L), any())).thenReturn(toggledUser);
            when(userMapper.toDTO(toggledUser)).thenReturn(toggledDTO);

            ResponseEntity<?> response = userAdminController.toggleUserActiveStatus(2L);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            verify(userAdminService).toggleUserActiveStatus(eq(2L), any());
        }
    }
}
