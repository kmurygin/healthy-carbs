package org.kmurygin.healthycarbs.mealplan.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.kmurygin.healthycarbs.config.JwtService;
import org.kmurygin.healthycarbs.mealplan.dto.AllergenDTO;
import org.kmurygin.healthycarbs.mealplan.model.Allergen;
import org.kmurygin.healthycarbs.mealplan.repository.AllergenRepository;
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
import static org.hamcrest.Matchers.isA;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("AllergenController Integration Tests")
class AllergenControllerIntegrationTest {
    private static final String BASE_URL = "/api/v1/allergens";
    private final String uniqueSuffix = String.valueOf(System.currentTimeMillis());
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AllergenRepository allergenRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtService;
    @MockitoBean
    private StorageProvider storageProvider;
    private User dietitianUser;
    private Allergen testAllergen;
    private String dietitianToken;

    @BeforeEach
    void setUp() {
        dietitianUser = userRepository.save(
                UserTestUtils.createUserForPersistence("dietitian", uniqueSuffix, Role.DIETITIAN, passwordEncoder));
        testAllergen = allergenRepository.save(Allergen.builder()
                .name("Gluten_" + uniqueSuffix)
                .author(dietitianUser)
                .build());
        dietitianToken = jwtService.generateToken(dietitianUser);
    }

    @Nested
    @DisplayName("GET /allergens")
    class GetAllTests {
        @Test
        @DisplayName("getAll_shouldReturnAllergens")
        void getAll_shouldReturnAllergens() throws Exception {
            mockMvc.perform(get(BASE_URL).header("Authorization", "Bearer " + dietitianToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data", isA(java.util.List.class)));
        }
    }

    @Nested
    @DisplayName("GET /allergens/{id}")
    class GetByIdTests {
        @Test
        @DisplayName("getById_whenExists_shouldReturn")
        void getById_whenExists_shouldReturn() throws Exception {
            mockMvc.perform(get(BASE_URL + "/{id}", testAllergen.getId())
                            .header("Authorization", "Bearer " + dietitianToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.id", is(testAllergen.getId().intValue())));
        }

        @Test
        @DisplayName("getById_whenNotExists_shouldReturnNotFound")
        void getById_whenNotExists_shouldReturnNotFound() throws Exception {
            mockMvc.perform(get(BASE_URL + "/{id}", 999999L)
                            .header("Authorization", "Bearer " + dietitianToken))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /allergens")
    class CreateTests {
        @Test
        @DisplayName("create_shouldCreate")
        void create_shouldCreate() throws Exception {
            AllergenDTO dto = AllergenDTO.builder().name("New_" + System.nanoTime()).build();
            mockMvc.perform(post(BASE_URL).with(csrf())
                            .header("Authorization", "Bearer " + dietitianToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.message", is("Allergen created successfully")));
        }
    }

    @Nested
    @DisplayName("PUT /allergens/{id}")
    class UpdateTests {
        @Test
        @DisplayName("update_shouldUpdate")
        void update_shouldUpdate() throws Exception {
            AllergenDTO dto = AllergenDTO.builder().name("Updated_" + System.nanoTime()).build();
            mockMvc.perform(put(BASE_URL + "/{id}", testAllergen.getId()).with(csrf())
                            .header("Authorization", "Bearer " + dietitianToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("DELETE /allergens/{id}")
    class DeleteTests {
        @Test
        @DisplayName("delete_shouldDelete")
        void delete_shouldDelete() throws Exception {
            Allergen toDelete = allergenRepository.save(Allergen.builder()
                    .name("ToDelete_" + System.nanoTime()).author(dietitianUser).build());
            mockMvc.perform(delete(BASE_URL + "/{id}", toDelete.getId()).with(csrf())
                            .header("Authorization", "Bearer " + dietitianToken))
                    .andExpect(status().isNoContent());
        }
    }
}
