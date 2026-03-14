package org.kmurygin.healthycarbs.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kmurygin.healthycarbs.auth.service.AccessControlService;
import org.kmurygin.healthycarbs.exception.ForbiddenException;
import org.kmurygin.healthycarbs.user.UserTestUtils;
import org.kmurygin.healthycarbs.user.model.Role;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.service.UserService;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AccessControlService Unit Tests")
class AccessControlServiceUnitTest {

    @Mock
    private UserService userService;

    private AccessControlService accessControlService;

    private User regularUser;
    private User otherUser;
    private User adminUser;

    @BeforeEach
    void setUp() {
        accessControlService = new AccessControlService(userService);

        regularUser = UserTestUtils.createTestUser(1L, "regular", Role.USER);
        otherUser = UserTestUtils.createTestUser(2L, "other", Role.DIETITIAN);
        adminUser = UserTestUtils.createTestUser(3L, "admin", Role.ADMIN);
    }

    @Nested
    @DisplayName("assertAuthorOrAdmin")
    class AssertAuthorOrAdminTests {

        @Test
        @DisplayName("should_pass_when_currentUserIsAuthor")
        void should_pass_when_currentUserIsAuthor() {
            when(userService.getCurrentUser()).thenReturn(regularUser);

            assertThatCode(() -> accessControlService.assertAuthorOrAdmin(regularUser, "ingredient"))
                    .doesNotThrowAnyException();
        }

        @Test
        @DisplayName("should_pass_when_currentUserIsAdmin")
        void should_pass_when_currentUserIsAdmin() {
            when(userService.getCurrentUser()).thenReturn(adminUser);

            assertThatCode(() -> accessControlService.assertAuthorOrAdmin(otherUser, "ingredient"))
                    .doesNotThrowAnyException();
        }

        @Test
        @DisplayName("should_throwForbiddenException_when_currentUserIsNeitherAuthorNorAdmin")
        void should_throwForbiddenException_when_currentUserIsNeitherAuthorNorAdmin() {
            when(userService.getCurrentUser()).thenReturn(regularUser);

            assertThatThrownBy(() -> accessControlService.assertAuthorOrAdmin(otherUser, "ingredient"))
                    .isInstanceOf(ForbiddenException.class)
                    .hasMessageContaining("not authorized")
                    .hasMessageContaining("ingredient");
        }

        @Test
        @DisplayName("should_throwForbiddenException_when_authorIsNull")
        void should_throwForbiddenException_when_authorIsNull() {
            when(userService.getCurrentUser()).thenReturn(regularUser);

            assertThatThrownBy(() -> accessControlService.assertAuthorOrAdmin(null, "recipe"))
                    .isInstanceOf(ForbiddenException.class)
                    .hasMessageContaining("not authorized")
                    .hasMessageContaining("recipe");
        }
    }

    @Nested
    @DisplayName("assertOwnerOrAdmin")
    class AssertOwnerOrAdminTests {

        @Test
        @DisplayName("should_pass_when_currentUserIsOwner")
        void should_pass_when_currentUserIsOwner() {
            when(userService.getCurrentUser()).thenReturn(regularUser);

            assertThatCode(() -> accessControlService.assertOwnerOrAdmin(regularUser.getId(), "profile"))
                    .doesNotThrowAnyException();
        }

        @Test
        @DisplayName("should_pass_when_currentUserIsAdmin")
        void should_pass_when_currentUserIsAdmin() {
            when(userService.getCurrentUser()).thenReturn(adminUser);

            assertThatCode(() -> accessControlService.assertOwnerOrAdmin(otherUser.getId(), "profile"))
                    .doesNotThrowAnyException();
        }

        @Test
        @DisplayName("should_throwForbiddenException_when_currentUserIsNeitherOwnerNorAdmin")
        void should_throwForbiddenException_when_currentUserIsNeitherOwnerNorAdmin() {
            when(userService.getCurrentUser()).thenReturn(regularUser);

            assertThatThrownBy(() -> accessControlService.assertOwnerOrAdmin(otherUser.getId(), "profile"))
                    .isInstanceOf(ForbiddenException.class)
                    .hasMessageContaining("not authorized")
                    .hasMessageContaining("profile");
        }

        @Test
        @DisplayName("should_throwForbiddenException_when_ownerIdIsNull")
        void should_throwForbiddenException_when_ownerIdIsNull() {
            when(userService.getCurrentUser()).thenReturn(regularUser);

            assertThatThrownBy(() -> accessControlService.assertOwnerOrAdmin(null, "measurement"))
                    .isInstanceOf(ForbiddenException.class)
                    .hasMessageContaining("not authorized")
                    .hasMessageContaining("measurement");
        }
    }
}
