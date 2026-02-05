package org.kmurygin.healthycarbs.mealplan.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.kmurygin.healthycarbs.config.JwtService;
import org.kmurygin.healthycarbs.mealplan.ActivityLevel;
import org.kmurygin.healthycarbs.mealplan.DietGoal;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.Gender;
import org.kmurygin.healthycarbs.mealplan.dto.DietaryProfilePayload;
import org.kmurygin.healthycarbs.mealplan.model.DietaryProfile;
import org.kmurygin.healthycarbs.mealplan.repository.DietTypeRepository;
import org.kmurygin.healthycarbs.mealplan.repository.DietaryProfileRepository;
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

import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("DietaryProfileController Integration Tests")
class DietaryProfileControllerIntegrationTest {

    private static final String BASE_URL = "/api/v1/dietary-profiles";
    private final String uniqueSuffix = String.valueOf(System.currentTimeMillis());
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private DietaryProfileRepository dietaryProfileRepository;
    @Autowired
    private DietTypeRepository dietTypeRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtService;
    @MockitoBean
    private StorageProvider storageProvider;
    private User userWithProfile;
    private User userWithoutProfile;
    private DietaryProfile testProfile;
    private DietType standardDietType;
    private String tokenWithProfile;
    private String tokenWithoutProfile;

    @BeforeEach
    void setUp() {
        standardDietType = dietTypeRepository.findByName("STANDARD")
                .orElseGet(() -> dietTypeRepository.save(DietType.builder().name("STANDARD").compatibilityLevel(1).build()));

        userWithProfile = userRepository.save(
                UserTestUtils.createUserForPersistence("user_with_profile", uniqueSuffix, Role.USER, passwordEncoder));

        userWithoutProfile = userRepository.save(
                UserTestUtils.createUserForPersistence("user_without_profile", uniqueSuffix, Role.USER, passwordEncoder));

        testProfile = dietaryProfileRepository.save(DietaryProfile.builder()
                .user(userWithProfile)
                .weight(70.0)
                .height(175.0)
                .age(30)
                .gender(Gender.MALE)
                .dietGoal(DietGoal.MAINTAIN)
                .dietType(standardDietType)
                .activityLevel(ActivityLevel.MODERATE)
                .calorieTarget(2000.0)
                .carbsTarget(250.0)
                .proteinTarget(150.0)
                .fatTarget(67.0)
                .build());

        tokenWithProfile = jwtService.generateToken(userWithProfile);
        tokenWithoutProfile = jwtService.generateToken(userWithoutProfile);
    }

    private DietaryProfilePayload createValidPayload() {
        DietaryProfilePayload payload = new DietaryProfilePayload();
        payload.setWeight(75.0);
        payload.setHeight(180.0);
        payload.setAge(25);
        payload.setGender(Gender.MALE);
        payload.setDietGoal(DietGoal.LOSE);
        payload.setDietType("STANDARD");
        payload.setActivityLevel(ActivityLevel.HIGH);
        return payload;
    }

    @Nested
    @DisplayName("GET /dietary-profiles/{id}")
    class GetByIdTests {

        @Test
        @DisplayName("getById_whenProfileExists_shouldReturnProfile")
        void getById_whenProfileExists_shouldReturnProfile() throws Exception {
            mockMvc.perform(get(BASE_URL + "/{id}", testProfile.getId())
                            .header("Authorization", "Bearer " + tokenWithProfile))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.id", is(testProfile.getId().intValue())))
                    .andExpect(jsonPath("$.data.weight", is(70.0)));
        }

        @Test
        @DisplayName("getById_whenProfileNotFound_shouldReturnNotFound")
        void getById_whenProfileNotFound_shouldReturnNotFound() throws Exception {
            mockMvc.perform(get(BASE_URL + "/{id}", 999999L)
                            .header("Authorization", "Bearer " + tokenWithProfile))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /dietary-profiles")
    class IsCreatedTests {

        @Test
        @DisplayName("isCreated_whenProfileExists_shouldReturnProfile")
        void isCreated_whenProfileExists_shouldReturnProfile() throws Exception {
            mockMvc.perform(get(BASE_URL)
                            .header("Authorization", "Bearer " + tokenWithProfile))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.weight", is(70.0)))
                    .andExpect(jsonPath("$.message", is("Dietary profile exists")));
        }

        @Test
        @DisplayName("isCreated_whenProfileNotExists_shouldReturnNoContent")
        void isCreated_whenProfileNotExists_shouldReturnNoContent() throws Exception {
            mockMvc.perform(get(BASE_URL)
                            .header("Authorization", "Bearer " + tokenWithoutProfile))
                    .andExpect(status().isNoContent())
                    .andExpect(jsonPath("$.message", is("Dietary profile not created yet")));
        }
    }

    @Nested
    @DisplayName("POST /dietary-profiles")
    class SaveTests {

        @Test
        @DisplayName("save_whenValidPayload_shouldReturnCreated")
        void save_whenValidPayload_shouldReturnCreated() throws Exception {
            DietaryProfilePayload payload = createValidPayload();

            mockMvc.perform(post(BASE_URL)
                            .header("Authorization", "Bearer " + tokenWithoutProfile)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(payload)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.message", is("Dietary profile saved successfully")))
                    .andExpect(jsonPath("$.data.weight", is(75.0)));
        }

        @Test
        @DisplayName("save_whenNotAuthenticated_shouldReturnForbidden")
        void save_whenNotAuthenticated_shouldReturnForbidden() throws Exception {
            DietaryProfilePayload payload = createValidPayload();

            mockMvc.perform(post(BASE_URL)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(payload)))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("save_whenUpdatingExistingProfile_shouldUpdateAndReturn")
        void save_whenUpdatingExistingProfile_shouldUpdateAndReturn() throws Exception {
            DietaryProfilePayload payload = createValidPayload();
            payload.setWeight(80.0);

            mockMvc.perform(post(BASE_URL)
                            .header("Authorization", "Bearer " + tokenWithProfile)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(payload)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.data.weight", is(80.0)));
        }
    }
}
