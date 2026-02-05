package org.kmurygin.healthycarbs.user;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.kmurygin.healthycarbs.exception.ForbiddenException;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.storage.StorageProvider;
import org.kmurygin.healthycarbs.user.model.Role;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.repository.UserRepository;
import org.kmurygin.healthycarbs.user.service.UserAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.kmurygin.healthycarbs.user.UserTestUtils.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("UserAdminService Integration Tests")
class UserAdminServiceIntegrationTest {

    private final String uniqueSuffix = String.valueOf(System.currentTimeMillis());
    @Autowired
    private UserAdminService userAdminService;
    @Autowired
    private UserRepository userRepository;
    @MockitoBean
    private StorageProvider storageProvider;
    private User adminUser;
    private User regularUser;

    @BeforeEach
    void setUp() {
        adminUser = userRepository.save(createAdminForPersistence(uniqueSuffix));

        regularUser = userRepository.save(createRegularUserForPersistence(uniqueSuffix));
    }

    @Nested
    @DisplayName("getAllUsers")
    class GetAllUsersTests {

        @Test
        @DisplayName("getAllUsers_shouldReturnAllUsersFromDatabase")
        void getAllUsers_shouldReturnAllUsersFromDatabase() {
            List<User> result = userAdminService.getAllUsers();

            assertThat(result.size()).isGreaterThanOrEqualTo(2);
            assertThat(result).extracting("username")
                    .contains(adminUser.getUsername(), regularUser.getUsername());
        }
    }

    @Nested
    @DisplayName("changeUserRole")
    class ChangeUserRoleTests {

        @Test
        @DisplayName("changeUserRole_whenAdmin_shouldUpdateRole")
        void changeUserRole_whenAdmin_shouldUpdateRole() {
            User updated = userAdminService.changeUserRole(regularUser.getId(), Role.DIETITIAN, adminUser);

            assertThat(updated.getRole()).isEqualTo(Role.DIETITIAN);

            User fromDb = userRepository.findById(regularUser.getId()).orElseThrow();
            assertThat(fromDb.getRole()).isEqualTo(Role.DIETITIAN);
        }

        @Test
        @DisplayName("changeUserRole_whenNotAdmin_shouldThrowAccessDenied")
        void changeUserRole_whenNotAdmin_shouldThrowAccessDenied() {
            User nonAdmin = createTestUser(999L, "nonAdmin");

            assertThatThrownBy(() -> userAdminService.changeUserRole(regularUser.getId(), Role.DIETITIAN, nonAdmin))
                    .isInstanceOf(AccessDeniedException.class);
        }

        @Test
        @DisplayName("changeUserRole_whenUserNotFound_shouldThrow")
        void changeUserRole_whenUserNotFound_shouldThrow() {
            assertThatThrownBy(() -> userAdminService.changeUserRole(999999L, Role.DIETITIAN, adminUser))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("changeUserRole_changingOwnRole_shouldThrow")
        void changeUserRole_changingOwnRole_shouldThrow() {
            assertThatThrownBy(() -> userAdminService.changeUserRole(adminUser.getId(), Role.USER, adminUser))
                    .isInstanceOf(ForbiddenException.class)
                    .hasMessageContaining("cannot change your own role");
        }
    }

    @Nested
    @DisplayName("toggleUserActiveStatus")
    class ToggleUserActiveStatusTests {

        @Test
        @DisplayName("toggleUserActiveStatus_whenAdmin_shouldToggle")
        void toggleUserActiveStatus_whenAdmin_shouldToggle() {
            assertThat(regularUser.getIsActive()).isTrue();

            User toggled = userAdminService.toggleUserActiveStatus(regularUser.getId(), adminUser);

            assertThat(toggled.getIsActive()).isFalse();

            User fromDb = userRepository.findById(regularUser.getId()).orElseThrow();
            assertThat(fromDb.getIsActive()).isFalse();
        }

        @Test
        @DisplayName("toggleUserActiveStatus_whenNotAdmin_shouldThrowAccessDenied")
        void toggleUserActiveStatus_whenNotAdmin_shouldThrowAccessDenied() {
            User nonAdmin = createTestUser(999L, "nonAdmin");

            assertThatThrownBy(() -> userAdminService.toggleUserActiveStatus(regularUser.getId(), nonAdmin))
                    .isInstanceOf(AccessDeniedException.class);
        }

        @Test
        @DisplayName("toggleUserActiveStatus_whenUserNotFound_shouldThrow")
        void toggleUserActiveStatus_whenUserNotFound_shouldThrow() {
            assertThatThrownBy(() -> userAdminService.toggleUserActiveStatus(999999L, adminUser))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("toggleUserActiveStatus_togglingOwnStatus_shouldThrow")
        void toggleUserActiveStatus_togglingOwnStatus_shouldThrow() {
            assertThatThrownBy(() -> userAdminService.toggleUserActiveStatus(adminUser.getId(), adminUser))
                    .isInstanceOf(ForbiddenException.class)
                    .hasMessageContaining("cannot deactivate your own account");
        }
    }
}
