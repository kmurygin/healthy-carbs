package org.kmurygin.healthycarbs.user;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.kmurygin.healthycarbs.config.JwtService;
import org.kmurygin.healthycarbs.storage.StorageProvider;
import org.kmurygin.healthycarbs.user.dto.ChangeRoleRequest;
import org.kmurygin.healthycarbs.user.model.Role;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("UserAdminController Integration Tests")
class UserAdminControllerIntegrationTest {

    private static final String BASE_URL = "/api/v1/admin/users";
    private final String uniqueSuffix = String.valueOf(System.currentTimeMillis());
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtService;
    @MockitoBean
    private StorageProvider storageProvider;
    private User adminUser;
    private User regularUser;
    private String adminToken;
    private String userToken;

    @BeforeEach
    void setUp() {
        adminUser = userRepository.save(
                UserTestUtils.createAdminForPersistence(uniqueSuffix, passwordEncoder));

        regularUser = userRepository.save(
                UserTestUtils.createRegularUserForPersistence(uniqueSuffix, passwordEncoder));

        adminToken = jwtService.generateToken(adminUser);
        userToken = jwtService.generateToken(regularUser);
    }

    @Nested
    @DisplayName("GET /admin/users")
    class GetAllUsersTests {

        @Test
        @DisplayName("getAllUsers_whenAdmin_shouldReturnAllUsers")
        void getAllUsers_whenAdmin_shouldReturnAllUsers() throws Exception {
            mockMvc.perform(get(BASE_URL)
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", isA(java.util.List.class)))
                    .andExpect(jsonPath("$.data.length()", greaterThanOrEqualTo(2)));
        }

        @Test
        @DisplayName("getAllUsers_whenNotAdmin_shouldReturnForbidden")
        void getAllUsers_whenNotAdmin_shouldReturnForbidden() throws Exception {
            mockMvc.perform(get(BASE_URL)
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("getAllUsers_whenNotAuthenticated_shouldReturnForbidden")
        void getAllUsers_whenNotAuthenticated_shouldReturnForbidden() throws Exception {
            mockMvc.perform(get(BASE_URL))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("PATCH /admin/users/{id}/role")
    class ChangeUserRoleTests {

        @Test
        @DisplayName("changeUserRole_whenAdmin_shouldReturnUpdatedUser")
        void changeUserRole_whenAdmin_shouldReturnUpdatedUser() throws Exception {
            ChangeRoleRequest request = new ChangeRoleRequest(Role.DIETITIAN);

            mockMvc.perform(patch(BASE_URL + "/{id}/role", regularUser.getId())
                            .header("Authorization", "Bearer " + adminToken)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.role", is("DIETITIAN")));
        }

        @Test
        @DisplayName("changeUserRole_whenNotAdmin_shouldReturnForbidden")
        void changeUserRole_whenNotAdmin_shouldReturnForbidden() throws Exception {
            ChangeRoleRequest request = new ChangeRoleRequest(Role.DIETITIAN);

            mockMvc.perform(patch(BASE_URL + "/{id}/role", regularUser.getId())
                            .header("Authorization", "Bearer " + userToken)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("changeUserRole_whenUserNotFound_shouldReturnNotFound")
        void changeUserRole_whenUserNotFound_shouldReturnNotFound() throws Exception {
            ChangeRoleRequest request = new ChangeRoleRequest(Role.DIETITIAN);
            mockMvc.perform(patch(BASE_URL + "/{id}/role", 999999L)
                            .header("Authorization", "Bearer " + adminToken)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("changeUserRole_whenChangingOwnRole_shouldReturnForbidden")
        void changeUserRole_whenChangingOwnRole_shouldReturnForbidden() throws Exception {
            ChangeRoleRequest request = new ChangeRoleRequest(Role.USER);

            mockMvc.perform(patch(BASE_URL + "/{id}/role", adminUser.getId())
                            .header("Authorization", "Bearer " + adminToken)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("PATCH /admin/users/{id}/toggle-active")
    class ToggleUserActiveStatusTests {

        @Test
        @DisplayName("toggleUserActiveStatus_whenAdmin_shouldToggleStatus")
        void toggleUserActiveStatus_whenAdmin_shouldToggleStatus() throws Exception {
            mockMvc.perform(patch(BASE_URL + "/{id}/toggle-active", regularUser.getId())
                            .header("Authorization", "Bearer " + adminToken)
                            .with(csrf()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.isActive", is(false)));
        }

        @Test
        @DisplayName("toggleUserActiveStatus_whenNotAdmin_shouldReturnForbidden")
        void toggleUserActiveStatus_whenNotAdmin_shouldReturnForbidden() throws Exception {
            mockMvc.perform(patch(BASE_URL + "/{id}/toggle-active", regularUser.getId())
                            .header("Authorization", "Bearer " + userToken)
                            .with(csrf()))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("toggleUserActiveStatus_whenUserNotFound_shouldReturnNotFound")
        void toggleUserActiveStatus_whenUserNotFound_shouldReturnNotFound() throws Exception {
            mockMvc.perform(patch(BASE_URL + "/{id}/toggle-active", 999999L)
                            .header("Authorization", "Bearer " + adminToken)
                            .with(csrf()))
                    .andExpect(status().isNotFound());
        }
    }
}
