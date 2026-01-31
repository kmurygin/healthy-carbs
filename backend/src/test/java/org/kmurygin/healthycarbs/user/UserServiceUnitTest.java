package org.kmurygin.healthycarbs.user;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kmurygin.healthycarbs.email.EmailService;
import org.kmurygin.healthycarbs.exception.ResourceAlreadyExistsException;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.user.dto.CreateUserRequest;
import org.kmurygin.healthycarbs.user.dto.UpdateUserRequest;
import org.kmurygin.healthycarbs.user.model.Role;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.model.UserProfileImage;
import org.kmurygin.healthycarbs.user.repository.UserRepository;
import org.kmurygin.healthycarbs.user.service.UserProfileImageService;
import org.kmurygin.healthycarbs.user.service.UserService;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService Unit Tests")
class UserServiceUnitTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserProfileImageService profileImageService;

    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, emailService, passwordEncoder, profileImageService);

        testUser = UserTestUtils.createTestUser(1L, "testuser");
    }

    @Nested
    @DisplayName("getUserById")
    class GetUserByIdTests {

        @Test
        @DisplayName("getUserById_whenUserExists_shouldReturnUser")
        void getUserById_whenUserExists_shouldReturnUser() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

            Optional<User> result = userService.getUserById(1L);

            assertThat(result).isPresent().contains(testUser);
        }

        @Test
        @DisplayName("getUserById_whenUserNotExists_shouldReturnEmpty")
        void getUserById_whenUserNotExists_shouldReturnEmpty() {
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            Optional<User> result = userService.getUserById(999L);

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("getUserByUsername")
    class GetUserByUsernameTests {

        @Test
        @DisplayName("getUserByUsername_whenUserExists_shouldReturnUser")
        void getUserByUsername_whenUserExists_shouldReturnUser() {
            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

            Optional<User> result = userService.getUserByUsername("testuser");

            assertThat(result).isPresent().contains(testUser);
        }

        @Test
        @DisplayName("getUserByUsername_whenUserNotExists_shouldReturnEmpty")
        void getUserByUsername_whenUserNotExists_shouldReturnEmpty() {
            when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

            Optional<User> result = userService.getUserByUsername("unknown");

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("save(CreateUserRequest)")
    class SaveCreateUserRequestTests {

        @Test
        @DisplayName("save_whenValidRequest_shouldCreateUser")
        void save_whenValidRequest_shouldCreateUser() {
            CreateUserRequest request = new CreateUserRequest(
                    "newuser", "New", "User", "new@example.com", "password123", "USER");

            when(userRepository.findByUsername("newuser")).thenReturn(Optional.empty());
            when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());
            when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
            when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

            User result = userService.save(request);

            assertThat(result.getUsername()).isEqualTo("newuser");
            assertThat(result.getEmail()).isEqualTo("new@example.com");
            assertThat(result.getRole()).isEqualTo(Role.USER);
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("save_whenDuplicateUsername_shouldThrowResourceAlreadyExists")
        void save_whenDuplicateUsername_shouldThrowResourceAlreadyExists() {
            CreateUserRequest request = new CreateUserRequest(
                    "testuser", "New", "User", "new@example.com", "password123", "USER");

            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

            assertThatThrownBy(() -> userService.save(request))
                    .isInstanceOf(ResourceAlreadyExistsException.class);
        }

        @Test
        @DisplayName("save_whenDuplicateEmail_shouldThrowResourceAlreadyExists")
        void save_whenDuplicateEmail_shouldThrowResourceAlreadyExists() {
            CreateUserRequest request = new CreateUserRequest(
                    "newuser", "New", "User", "test@example.com", "password123", "USER");

            when(userRepository.findByUsername("newuser")).thenReturn(Optional.empty());
            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

            assertThatThrownBy(() -> userService.save(request))
                    .isInstanceOf(ResourceAlreadyExistsException.class);
        }
    }

    @Nested
    @DisplayName("save(User)")
    class SaveUserTests {

        @Test
        @DisplayName("save_whenValidUser_shouldSave")
        void save_whenValidUser_shouldSave() {
            User newUser = UserTestUtils.createTestUser(null, "newuser");

            when(userRepository.findByUsername("newuser")).thenReturn(Optional.empty());
            when(userRepository.findByEmail("newuser@example.com")).thenReturn(Optional.empty());
            when(userRepository.save(newUser)).thenReturn(newUser);

            User result = userService.save(newUser);

            assertThat(result).isEqualTo(newUser);
            verify(userRepository).save(newUser);
        }

        @Test
        @DisplayName("save_whenDuplicateUsername_shouldThrowResourceAlreadyExists")
        void save_whenDuplicateUsername_shouldThrowResourceAlreadyExists() {
            User newUser = UserTestUtils.createTestUser(null, "testuser");
            newUser.setEmail("testuser@example.com"); // Matches UserTestUtils default

            when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

            assertThatThrownBy(() -> userService.save(newUser))
                    .isInstanceOf(ResourceAlreadyExistsException.class);
        }

        @Test
        @DisplayName("save_whenDuplicateEmail_shouldThrowResourceAlreadyExists")
        void save_whenDuplicateEmail_shouldThrowResourceAlreadyExists() {
            User newUser = UserTestUtils.createTestUser(null, "newuser");
            newUser.setEmail("test@example.com"); // Explicitly set to duplicate value

            when(userRepository.findByUsername("newuser")).thenReturn(Optional.empty());
            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

            assertThatThrownBy(() -> userService.save(newUser))
                    .isInstanceOf(ResourceAlreadyExistsException.class);
        }
    }

    @Nested
    @DisplayName("deleteUser")
    class DeleteUserTests {

        @Test
        @DisplayName("deleteUser_whenUserExists_shouldDelete")
        void deleteUser_whenUserExists_shouldDelete() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

            userService.deleteUser(1L);

            verify(userRepository).delete(testUser);
        }

        @Test
        @DisplayName("deleteUser_whenUserHasProfileImage_shouldDeleteImage")
        void deleteUser_whenUserHasProfileImage_shouldDeleteImage() {
            UserProfileImage profileImage = UserProfileImage.builder()
                    .imageKey("profile-images/1/image.jpg")
                    .build();
            testUser.setProfileImage(profileImage);

            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

            userService.deleteUser(1L);

            verify(userRepository).delete(testUser);
            verify(profileImageService).deleteProfileImageByKey("profile-images/1/image.jpg");
        }

        @Test
        @DisplayName("deleteUser_whenUserNotFound_shouldThrowResourceNotFound")
        void deleteUser_whenUserNotFound_shouldThrowResourceNotFound() {
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.deleteUser(999L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("update")
    class UpdateTests {

        @Test
        @DisplayName("update_whenValidRequest_shouldUpdateUser")
        void update_whenValidRequest_shouldUpdateUser() {
            UpdateUserRequest request = new UpdateUserRequest("Updated", "Name", "test@example.com");

            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

            User result = userService.update(1L, request);

            assertThat(result.getFirstName()).isEqualTo("Updated");
            assertThat(result.getLastName()).isEqualTo("Name");
        }

        @Test
        @DisplayName("update_whenEmailChanges_shouldSendNotification")
        void update_whenEmailChanges_shouldSendNotification() {
            UpdateUserRequest request = new UpdateUserRequest("Test", "User", "new@example.com");

            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());
            when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

            userService.update(1L, request);

            verify(emailService).sendMail(any());
        }

        @Test
        @DisplayName("update_whenUserNotFound_shouldThrowResourceNotFound")
        void update_whenUserNotFound_shouldThrowResourceNotFound() {
            UpdateUserRequest request = new UpdateUserRequest("Test", "User", "test@example.com");

            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.update(999L, request))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("update_whenEmailTaken_shouldThrowResourceAlreadyExists")
        void update_whenEmailTaken_shouldThrowResourceAlreadyExists() {
            UpdateUserRequest request = new UpdateUserRequest("Test", "User", "taken@example.com");
            User anotherUser = User.builder().id(2L).email("taken@example.com").build();

            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(userRepository.findByEmail("taken@example.com")).thenReturn(Optional.of(anotherUser));

            assertThatThrownBy(() -> userService.update(1L, request))
                    .isInstanceOf(ResourceAlreadyExistsException.class);
        }
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

            User result = userService.getCurrentUser();

            assertThat(result).isEqualTo(testUser);

            SecurityContextHolder.clearContext();
        }

        @Test
        @DisplayName("getCurrentUser_whenNotAuthenticated_shouldReturnNull")
        void getCurrentUser_whenNotAuthenticated_shouldReturnNull() {
            SecurityContext securityContext = mock(SecurityContext.class);
            when(securityContext.getAuthentication()).thenReturn(null);

            SecurityContextHolder.setContext(securityContext);

            User result = userService.getCurrentUser();

            assertThat(result).isNull();

            SecurityContextHolder.clearContext();
        }
    }

    @Nested
    @DisplayName("getFavouriteRecipesIds")
    class GetFavouriteRecipesIdsTests {

        @Test
        @DisplayName("getFavouriteRecipesIds_whenUserAuthenticated_shouldReturnRecipeIds")
        void getFavouriteRecipesIds_whenUserAuthenticated_shouldReturnRecipeIds() {
            SecurityContext securityContext = mock(SecurityContext.class);
            Authentication authentication = mock(Authentication.class);

            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.isAuthenticated()).thenReturn(true);
            when(authentication.getPrincipal()).thenReturn(testUser);
            when(userRepository.findFavouriteRecipeIdsByUserId(1L))
                    .thenReturn(java.util.Set.of(10L, 20L, 30L));

            SecurityContextHolder.setContext(securityContext);

            java.util.Set<Long> result = userService.getFavouriteRecipesIds();

            assertThat(result).containsExactlyInAnyOrder(10L, 20L, 30L);
            verify(userRepository).findFavouriteRecipeIdsByUserId(1L);

            SecurityContextHolder.clearContext();
        }

        @Test
        @DisplayName("getFavouriteRecipesIds_whenNoFavourites_shouldReturnEmptySet")
        void getFavouriteRecipesIds_whenNoFavourites_shouldReturnEmptySet() {
            SecurityContext securityContext = mock(SecurityContext.class);
            Authentication authentication = mock(Authentication.class);

            when(securityContext.getAuthentication()).thenReturn(authentication);
            when(authentication.isAuthenticated()).thenReturn(true);
            when(authentication.getPrincipal()).thenReturn(testUser);
            when(userRepository.findFavouriteRecipeIdsByUserId(1L))
                    .thenReturn(java.util.Set.of());

            SecurityContextHolder.setContext(securityContext);

            java.util.Set<Long> result = userService.getFavouriteRecipesIds();

            assertThat(result).isEmpty();

            SecurityContextHolder.clearContext();
        }
    }
}
