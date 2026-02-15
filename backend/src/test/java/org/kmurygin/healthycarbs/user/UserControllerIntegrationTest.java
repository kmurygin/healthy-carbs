package org.kmurygin.healthycarbs.user;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.kmurygin.healthycarbs.storage.StorageProvider;
import org.kmurygin.healthycarbs.user.dto.ChangePasswordRequest;
import org.kmurygin.healthycarbs.user.dto.CreateUserRequest;
import org.kmurygin.healthycarbs.user.dto.UpdateUserRequest;
import org.kmurygin.healthycarbs.user.model.Role;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("UserController Integration Tests")
class UserControllerIntegrationTest {

    private static final String BASE_URL = "/api/v1/users";
    private final String uniqueSuffix = String.valueOf(System.currentTimeMillis());
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @MockitoBean
    private StorageProvider storageProvider;
    private User savedUser;

    @BeforeEach
    void setUp() {
        savedUser = userRepository.save(
                UserTestUtils.createUserForPersistence("testuser", uniqueSuffix, Role.USER, passwordEncoder));
    }

    @Nested
    @DisplayName("GET /users/{id}")
    class GetUserByIdTests {

        @Test
        @DisplayName("getUserById_whenUserExists_shouldReturnUser")
        void getUserById_whenUserExists_shouldReturnUser() throws Exception {
            mockMvc.perform(get(BASE_URL + "/{id}", savedUser.getId())
                            .with(user(savedUser)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.id", is(savedUser.getId().intValue())))
                    .andExpect(jsonPath("$.data.username", is(savedUser.getUsername())));
        }

        @Test
        @DisplayName("getUserById_whenUserNotExists_shouldReturnNotFound")
        void getUserById_whenUserNotExists_shouldReturnNotFound() throws Exception {
            User admin = userRepository.save(
                    UserTestUtils.createAdminForPersistence("getById_" + uniqueSuffix, passwordEncoder));
            mockMvc.perform(get(BASE_URL + "/{id}", 999999L)
                            .with(user(admin)))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /users/username/{username}")
    class GetUserByUsernameTests {

        @Test
        @DisplayName("getUserByUsername_whenUserExists_shouldReturnUser")
        void getUserByUsername_whenUserExists_shouldReturnUser() throws Exception {
            mockMvc.perform(get(BASE_URL + "/username/{username}", savedUser.getUsername())
                            .with(user(savedUser)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.username", is(savedUser.getUsername())));
        }

        @Test
        @DisplayName("getUserByUsername_whenUserNotExists_shouldReturnNotFound")
        void getUserByUsername_whenUserNotExists_shouldReturnNotFound() throws Exception {
            User admin = userRepository.save(
                    UserTestUtils.createAdminForPersistence("getByName_" + uniqueSuffix, passwordEncoder));
            mockMvc.perform(get(BASE_URL + "/username/{username}", "nonexistent_user")
                            .with(user(admin)))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /users")
    class CreateUserTests {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("createUser_whenValidRequest_shouldReturnCreated")
        void createUser_whenValidRequest_shouldReturnCreated() throws Exception {
            String timestamp = String.valueOf(System.nanoTime());
            CreateUserRequest request = new CreateUserRequest(
                    "newuser_" + timestamp, "New", "User",
                    "new_" + timestamp + "@example.com", "Password123!", "USER");

            mockMvc.perform(post(BASE_URL)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.data.username", is("newuser_" + timestamp)));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("createUser_whenDuplicateUsername_shouldReturnConflict")
        void createUser_whenDuplicateUsername_shouldReturnConflict() throws Exception {
            CreateUserRequest request = new CreateUserRequest(
                    savedUser.getUsername(), "New", "User",
                    "unique_" + System.nanoTime() + "@example.com", "Password123!", "USER");

            mockMvc.perform(post(BASE_URL)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("createUser_whenDuplicateEmail_shouldReturnConflict")
        void createUser_whenDuplicateEmail_shouldReturnConflict() throws Exception {
            CreateUserRequest request = new CreateUserRequest(
                    "unique_" + System.nanoTime(), "New", "User",
                    savedUser.getEmail(), "Password123!", "USER");

            mockMvc.perform(post(BASE_URL)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict());
        }
    }

    @Nested
    @DisplayName("PUT /users/{id}")
    class UpdateUserTests {

        @Test
        @DisplayName("updateUser_whenValidRequest_shouldReturnUpdatedUser")
        void updateUser_whenValidRequest_shouldReturnUpdatedUser() throws Exception {
            UpdateUserRequest request = new UpdateUserRequest(
                    "Updated", "Name", "updated_" + System.nanoTime() + "@example.com");

            mockMvc.perform(put(BASE_URL + "/{id}", savedUser.getId())
                            .with(csrf())
                            .with(user(savedUser))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.firstName", is("Updated")))
                    .andExpect(jsonPath("$.data.lastName", is("Name")));
        }

        @Test
        @DisplayName("updateUser_whenUserNotFound_shouldReturnNotFound")
        void updateUser_whenUserNotFound_shouldReturnNotFound() throws Exception {
            User admin = userRepository.save(
                    UserTestUtils.createAdminForPersistence("update_" + uniqueSuffix, passwordEncoder));
            UpdateUserRequest request = new UpdateUserRequest("Updated", "Name", "test@example.com");

            mockMvc.perform(put(BASE_URL + "/{id}", 999999L)
                            .with(csrf())
                            .with(user(admin))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("DELETE /users/{id}")
    class DeleteUserTests {

        @Test
        @DisplayName("deleteUser_whenUserExists_shouldReturnNoContent")
        void deleteUser_whenUserExists_shouldReturnNoContent() throws Exception {
            mockMvc.perform(delete(BASE_URL + "/{id}", savedUser.getId())
                            .with(csrf())
                            .with(user(savedUser)))
                    .andExpect(status().isNoContent());
        }

        @Test
        @DisplayName("deleteUser_whenUserNotFound_shouldReturnNotFound")
        void deleteUser_whenUserNotFound_shouldReturnNotFound() throws Exception {
            User admin = userRepository.save(
                    UserTestUtils.createAdminForPersistence("delete_" + uniqueSuffix, passwordEncoder));
            mockMvc.perform(delete(BASE_URL + "/{id}", 999999L)
                            .with(csrf())
                            .with(user(admin)))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /users/change-password")
    class ChangePasswordTests {

        @Test
        @DisplayName("changePassword_whenValidCredentials_shouldReturnOk")
        void changePassword_whenValidCredentials_shouldReturnOk() throws Exception {
            ChangePasswordRequest request = new ChangePasswordRequest("Password12345!", "NewPassword123!");

            mockMvc.perform(post(BASE_URL + "/change-password")
                            .with(csrf())
                            .with(user(savedUser.getUsername()).password("Password12345!").roles("USER"))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("changePassword_whenWrongOldPassword_shouldReturnBadRequest")
        void changePassword_whenWrongOldPassword_shouldReturnBadRequest() throws Exception {
            ChangePasswordRequest request = new ChangePasswordRequest("WrongPassword123!", "NewPassword123!");

            mockMvc.perform(post(BASE_URL + "/change-password")
                            .with(csrf())
                            .with(user(savedUser.getUsername()).password("Password12345!").roles("USER"))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }
    }
}
