package org.kmurygin.healthycarbs.user;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.kmurygin.healthycarbs.exception.ResourceAlreadyExistsException;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.storage.StorageProvider;
import org.kmurygin.healthycarbs.user.dto.CreateUserRequest;
import org.kmurygin.healthycarbs.user.dto.UpdateUserRequest;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.repository.UserRepository;
import org.kmurygin.healthycarbs.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("UserService Integration Tests")
class UserServiceIntegrationTest {

    private final String uniqueSuffix = String.valueOf(System.currentTimeMillis());
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;
    @MockitoBean
    private StorageProvider storageProvider;
    private User savedUser;

    @BeforeEach
    void setUp() {
        savedUser = userRepository.save(UserTestUtils.createRegularUserForPersistence(uniqueSuffix));
    }

    @Nested
    @DisplayName("getUserById")
    class GetUserByIdTests {

        @Test
        @DisplayName("getUserById_whenUserExists_shouldReturnUser")
        void getUserById_whenUserExists_shouldReturnUser() {
            Optional<User> result = userService.getUserById(savedUser.getId());

            assertThat(result).isPresent();
            assertThat(result.get().getUsername()).isEqualTo(savedUser.getUsername());
        }

        @Test
        @DisplayName("getUserById_whenUserNotExists_shouldReturnEmpty")
        void getUserById_whenUserNotExists_shouldReturnEmpty() {
            Optional<User> result = userService.getUserById(999999L);

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("getUserByUsername")
    class GetUserByUsernameTests {

        @Test
        @DisplayName("getUserByUsername_whenUserExists_shouldReturnUser")
        void getUserByUsername_whenUserExists_shouldReturnUser() {
            Optional<User> result = userService.getUserByUsername(savedUser.getUsername());

            assertThat(result).isPresent();
            assertThat(result.get().getId()).isEqualTo(savedUser.getId());
        }
    }

    @Nested
    @DisplayName("save")
    class SaveTests {

        @Test
        @DisplayName("save_whenValidRequest_shouldPersistUser")
        void save_whenValidRequest_shouldPersistUser() {
            String timestamp = String.valueOf(System.nanoTime());
            CreateUserRequest request = CreateUserRequest.builder()
                    .username("newuser_" + timestamp)
                    .firstName("New")
                    .lastName("User")
                    .email("new_" + timestamp + "@example.com")
                    .password("Password12345!")
                    .role("USER")
                    .build();

            User created = userService.save(request);

            assertThat(created.getId()).isNotNull();
            assertThat(userRepository.findById(created.getId())).isPresent();
        }

        @Test
        @DisplayName("save_whenDuplicateUsername_shouldThrow")
        void save_whenDuplicateUsername_shouldThrow() {
            CreateUserRequest request = CreateUserRequest.builder()
                    .username(savedUser.getUsername())
                    .firstName("Duplicate")
                    .lastName("User")
                    .email("duplicate_" + System.nanoTime() + "@example.com")
                    .password("Password12345!")
                    .role("USER")
                    .build();

            assertThatThrownBy(() -> userService.save(request))
                    .isInstanceOf(ResourceAlreadyExistsException.class);
        }

        @Test
        @DisplayName("save_whenDuplicateEmail_shouldThrow")
        void save_whenDuplicateEmail_shouldThrow() {
            CreateUserRequest request = CreateUserRequest.builder()
                    .username("unique_" + System.nanoTime())
                    .firstName("Duplicate")
                    .lastName("User")
                    .email(savedUser.getEmail())
                    .password("Password12345!")
                    .role("USER")
                    .build();

            assertThatThrownBy(() -> userService.save(request))
                    .isInstanceOf(ResourceAlreadyExistsException.class);
        }
    }

    @Nested
    @DisplayName("update")
    class UpdateTests {

        @Test
        @DisplayName("update_whenValidRequest_shouldUpdateUser")
        void update_whenValidRequest_shouldUpdateUser() {
            UpdateUserRequest request = UpdateUserRequest.builder()
                    .firstName("UpdatedFirst")
                    .lastName("UpdatedLast")
                    .email("updated_" + System.nanoTime() + "@example.com")
                    .build();

            User updated = userService.update(savedUser.getId(), request);

            assertThat(updated.getFirstName()).isEqualTo("UpdatedFirst");
            assertThat(updated.getLastName()).isEqualTo("UpdatedLast");
        }

        @Test
        @DisplayName("update_whenUserNotExists_shouldThrow")
        void update_whenUserNotExists_shouldThrow() {
            UpdateUserRequest request = UpdateUserRequest.builder()
                    .firstName("UpdatedFirst")
                    .lastName("UpdatedLast")
                    .email("updated@example.com")
                    .build();

            assertThatThrownBy(() -> userService.update(999999L, request))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("deleteUser")
    class DeleteUserTests {

        @Test
        @DisplayName("deleteUser_whenUserExists_shouldRemove")
        void deleteUser_whenUserExists_shouldRemove() {
            Long userId = savedUser.getId();

            userService.deleteUser(userId);

            assertThat(userRepository.findById(userId)).isEmpty();
        }

        @Test
        @DisplayName("deleteUser_whenUserNotExists_shouldThrow")
        void deleteUser_whenUserNotExists_shouldThrow() {
            assertThatThrownBy(() -> userService.deleteUser(999999L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
