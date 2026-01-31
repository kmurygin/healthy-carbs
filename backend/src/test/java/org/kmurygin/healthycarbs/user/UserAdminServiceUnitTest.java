package org.kmurygin.healthycarbs.user;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.user.model.Role;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.repository.UserRepository;
import org.kmurygin.healthycarbs.user.service.UserAdminService;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.kmurygin.healthycarbs.user.UserTestUtils.createAdmin;
import static org.kmurygin.healthycarbs.user.UserTestUtils.createTestUser;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserAdminService Unit Tests")
class UserAdminServiceUnitTest {

    @Mock
    private UserRepository userRepository;

    private UserAdminService userAdminService;

    private User adminUser;
    private User regularUser;
    private User targetUser;

    @BeforeEach
    void setUp() {
        userAdminService = new UserAdminService(userRepository);

        adminUser = createAdmin();
        regularUser = createTestUser(2L, "user");
        targetUser = createTestUser(3L, "target");
    }

    @Nested
    @DisplayName("getAllUsers")
    class GetAllUsersTests {

        @Test
        @DisplayName("getAllUsers_whenCalled_shouldReturnAllUsers")
        void getAllUsers_whenCalled_shouldReturnAllUsers() {
            List<User> users = List.of(adminUser, regularUser, targetUser);
            when(userRepository.findAll()).thenReturn(users);

            List<User> result = userAdminService.getAllUsers();

            assertThat(result).hasSize(3).containsExactlyElementsOf(users);
            verify(userRepository).findAll();
        }

        @Test
        @DisplayName("getAllUsers_whenNoUsers_shouldReturnEmptyList")
        void getAllUsers_whenNoUsers_shouldReturnEmptyList() {
            when(userRepository.findAll()).thenReturn(List.of());

            List<User> result = userAdminService.getAllUsers();

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("findAllByRole")
    class FindAllByRoleTests {

        @Test
        @DisplayName("findAllByRole_whenRoleExists_shouldReturnMatchingUsers")
        void findAllByRole_whenRoleExists_shouldReturnMatchingUsers() {
            when(userRepository.findAllByRole(Role.USER)).thenReturn(List.of(regularUser, targetUser));

            List<User> result = userAdminService.findAllByRole(Role.USER);

            assertThat(result).hasSize(2);
            verify(userRepository).findAllByRole(Role.USER);
        }

        @Test
        @DisplayName("findAllByRole_whenNoMatches_shouldReturnEmptyList")
        void findAllByRole_whenNoMatches_shouldReturnEmptyList() {
            when(userRepository.findAllByRole(Role.DIETITIAN)).thenReturn(List.of());

            List<User> result = userAdminService.findAllByRole(Role.DIETITIAN);

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("changeUserRole")
    class ChangeUserRoleTests {

        @Test
        @DisplayName("changeUserRole_whenValidRequest_shouldUpdateRole")
        void changeUserRole_whenValidRequest_shouldUpdateRole() {
            when(userRepository.findById(3L)).thenReturn(Optional.of(targetUser));
            when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

            User result = userAdminService.changeUserRole(3L, Role.DIETITIAN, adminUser);

            assertThat(result.getRole()).isEqualTo(Role.DIETITIAN);
            verify(userRepository).save(targetUser);
        }

        @Test
        @DisplayName("changeUserRole_whenNotAdmin_shouldThrowAccessDenied")
        void changeUserRole_whenNotAdmin_shouldThrowAccessDenied() {
            assertThatThrownBy(() -> userAdminService.changeUserRole(3L, Role.DIETITIAN, regularUser))
                    .isInstanceOf(AccessDeniedException.class)
                    .hasMessageContaining("Only admins");
        }

        @Test
        @DisplayName("changeUserRole_whenNullUser_shouldThrowAccessDenied")
        void changeUserRole_whenNullUser_shouldThrowAccessDenied() {
            assertThatThrownBy(() -> userAdminService.changeUserRole(3L, Role.DIETITIAN, null))
                    .isInstanceOf(AccessDeniedException.class);
        }

        @Test
        @DisplayName("changeUserRole_whenSelfChange_shouldThrowIllegalArgument")
        void changeUserRole_whenSelfChange_shouldThrowIllegalArgument() {
            assertThatThrownBy(() -> userAdminService.changeUserRole(1L, Role.USER, adminUser))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("cannot change your own role");
        }

        @Test
        @DisplayName("changeUserRole_whenAssigningAdmin_shouldThrowIllegalArgument")
        void changeUserRole_whenAssigningAdmin_shouldThrowIllegalArgument() {
            assertThatThrownBy(() -> userAdminService.changeUserRole(3L, Role.ADMIN, adminUser))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Cannot assign ADMIN role");
        }

        @Test
        @DisplayName("changeUserRole_whenTargetIsAdmin_shouldThrowIllegalArgument")
        void changeUserRole_whenTargetIsAdmin_shouldThrowIllegalArgument() {
            User anotherAdmin = createTestUser(5L, "admin2", Role.ADMIN);
            when(userRepository.findById(5L)).thenReturn(Optional.of(anotherAdmin));

            assertThatThrownBy(() -> userAdminService.changeUserRole(5L, Role.USER, adminUser))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Cannot change role of an admin");
        }

        @Test
        @DisplayName("changeUserRole_whenUserNotFound_shouldThrowResourceNotFound")
        void changeUserRole_whenUserNotFound_shouldThrowResourceNotFound() {
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userAdminService.changeUserRole(999L, Role.DIETITIAN, adminUser))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("toggleUserActiveStatus")
    class ToggleUserActiveStatusTests {

        @Test
        @DisplayName("toggleUserActiveStatus_whenActive_shouldDeactivate")
        void toggleUserActiveStatus_whenActive_shouldDeactivate() {
            targetUser.setIsActive(true);
            when(userRepository.findById(3L)).thenReturn(Optional.of(targetUser));
            when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

            User result = userAdminService.toggleUserActiveStatus(3L, adminUser);

            assertThat(result.getIsActive()).isFalse();
            verify(userRepository).save(targetUser);
        }

        @Test
        @DisplayName("toggleUserActiveStatus_whenInactive_shouldActivate")
        void toggleUserActiveStatus_whenInactive_shouldActivate() {
            targetUser.setIsActive(false);
            when(userRepository.findById(3L)).thenReturn(Optional.of(targetUser));
            when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

            User result = userAdminService.toggleUserActiveStatus(3L, adminUser);

            assertThat(result.getIsActive()).isTrue();
        }

        @Test
        @DisplayName("toggleUserActiveStatus_whenNotAdmin_shouldThrowAccessDenied")
        void toggleUserActiveStatus_whenNotAdmin_shouldThrowAccessDenied() {
            assertThatThrownBy(() -> userAdminService.toggleUserActiveStatus(3L, regularUser))
                    .isInstanceOf(AccessDeniedException.class);
        }

        @Test
        @DisplayName("toggleUserActiveStatus_whenSelfToggle_shouldThrowIllegalArgument")
        void toggleUserActiveStatus_whenSelfToggle_shouldThrowIllegalArgument() {
            assertThatThrownBy(() -> userAdminService.toggleUserActiveStatus(1L, adminUser))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("cannot deactivate your own account");
        }

        @Test
        @DisplayName("toggleUserActiveStatus_whenUserNotFound_shouldThrowResourceNotFound")
        void toggleUserActiveStatus_whenUserNotFound_shouldThrowResourceNotFound() {
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userAdminService.toggleUserActiveStatus(999L, adminUser))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
