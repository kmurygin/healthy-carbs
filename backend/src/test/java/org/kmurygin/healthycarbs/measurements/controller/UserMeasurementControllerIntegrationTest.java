package org.kmurygin.healthycarbs.measurements.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.kmurygin.healthycarbs.config.JwtService;
import org.kmurygin.healthycarbs.measurements.dto.MeasurementPayload;
import org.kmurygin.healthycarbs.measurements.model.UserMeasurement;
import org.kmurygin.healthycarbs.measurements.repository.UserMeasurementRepository;
import org.kmurygin.healthycarbs.storage.StorageProvider;
import org.kmurygin.healthycarbs.user.UserTestUtils;
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

import java.time.Instant;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.isA;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("UserMeasurementController Integration Tests")
class UserMeasurementControllerIntegrationTest {

    private static final String BASE_URL = "/api/v1/measurements";
    private final String uniqueSuffix = String.valueOf(System.currentTimeMillis());

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMeasurementRepository userMeasurementRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private StorageProvider storageProvider;

    private User regularUser;
    private String userToken;

    @BeforeEach
    void setUp() {
        regularUser = userRepository.save(
                UserTestUtils.createUserForPersistence("user_measure", uniqueSuffix, Role.USER, passwordEncoder));

        userToken = jwtService.generateToken(regularUser);
    }

    @Nested
    @DisplayName("POST /measurements")
    class AddMeasurementTests {

        @Test
        @DisplayName("addMeasurement_shouldReturnCreated")
        void addMeasurement_shouldReturnCreated() throws Exception {
            MeasurementPayload payload = new MeasurementPayload(
                    75.0, 85.0, 95.0, 100.0, 35.0, 55.0, 38.0
            );

            mockMvc.perform(post(BASE_URL)
                            .header("Authorization", "Bearer " + userToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(payload)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.message", is("Measurement added successfully")));
        }

        @Test
        @DisplayName("addMeasurement_whenNotAuthenticated_shouldReturnForbidden")
        void addMeasurement_whenNotAuthenticated_shouldReturnForbidden() throws Exception {
            MeasurementPayload payload = new MeasurementPayload(
                    75.0, null, null, null, null, null, null
            );

            mockMvc.perform(post(BASE_URL)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(payload)))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("GET /measurements")
    class GetAllHistoryTests {

        @Test
        @DisplayName("getAllHistory_shouldReturnMeasurements")
        void getAllHistory_shouldReturnMeasurements() throws Exception {
            userMeasurementRepository.save(UserMeasurement.builder()
                    .user(regularUser)
                    .weight(75.0)
                    .waistCircumference(85.0)
                    .date(Instant.now())
                    .build());

            userMeasurementRepository.save(UserMeasurement.builder()
                    .user(regularUser)
                    .weight(74.5)
                    .waistCircumference(84.0)
                    .date(Instant.now().plusSeconds(3600))
                    .build());

            mockMvc.perform(get(BASE_URL)
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", isA(java.util.List.class)))
                    .andExpect(jsonPath("$.data.length()", is(2)));
        }

        @Test
        @DisplayName("getAllHistory_whenNoMeasurements_shouldReturnEmptyList")
        void getAllHistory_whenNoMeasurements_shouldReturnEmptyList() throws Exception {
            mockMvc.perform(get(BASE_URL)
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", isA(java.util.List.class)))
                    .andExpect(jsonPath("$.data.length()", is(0)));
        }
    }

    @Nested
    @DisplayName("PUT /measurements/recent")
    class UpdateRecentMeasurementTests {

        @Test
        @DisplayName("updateRecentMeasurement_shouldUpdateSuccessfully")
        void updateRecentMeasurement_shouldUpdateSuccessfully() throws Exception {
            userMeasurementRepository.save(UserMeasurement.builder()
                    .user(regularUser)
                    .weight(75.0)
                    .waistCircumference(85.0)
                    .date(Instant.now())
                    .build());

            MeasurementPayload updatePayload = new MeasurementPayload(
                    76.0, 84.0, null, null, null, null, null
            );

            mockMvc.perform(put(BASE_URL + "/recent")
                            .header("Authorization", "Bearer " + userToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updatePayload)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message", is("Measurement updated successfully")));
        }

        @Test
        @DisplayName("updateRecentMeasurement_whenNoMeasurementsExist_shouldReturn404")
        void updateRecentMeasurement_whenNoMeasurementsExist_shouldReturn404() throws Exception {
            MeasurementPayload updatePayload = new MeasurementPayload(
                    76.0, null, null, null, null, null, null
            );

            mockMvc.perform(put(BASE_URL + "/recent")
                            .header("Authorization", "Bearer " + userToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updatePayload)))
                    .andExpect(status().isNotFound());
        }
    }
}
