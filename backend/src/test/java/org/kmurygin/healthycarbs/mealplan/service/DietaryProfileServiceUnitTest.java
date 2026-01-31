package org.kmurygin.healthycarbs.mealplan.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kmurygin.healthycarbs.auth.service.AuthenticationService;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.ActivityLevel;
import org.kmurygin.healthycarbs.mealplan.DietGoal;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.Gender;
import org.kmurygin.healthycarbs.mealplan.dto.DietaryProfilePayload;
import org.kmurygin.healthycarbs.mealplan.model.DietaryProfile;
import org.kmurygin.healthycarbs.mealplan.repository.DietaryProfileRepository;
import org.kmurygin.healthycarbs.user.UserTestUtils;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.repository.UserRepository;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DietaryProfileService Unit Tests")
class DietaryProfileServiceUnitTest {

    @Mock
    private DietaryProfileRepository dietaryProfileRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthenticationService authenticationService;

    private DietaryProfileService dietaryProfileService;

    private User testUser;
    private DietaryProfile testProfile;

    @BeforeEach
    void setUp() {
        dietaryProfileService = new DietaryProfileService(
                dietaryProfileRepository,
                userRepository,
                authenticationService);

        testUser = UserTestUtils.createTestUser(1L, "testuser");

        testProfile = DietaryProfile.builder()
                .id(1L)
                .user(testUser)
                .weight(70.0)
                .height(175.0)
                .age(30)
                .gender(Gender.MALE)
                .dietGoal(DietGoal.MAINTAIN)
                .dietType(DietType.STANDARD)
                .activityLevel(ActivityLevel.MODERATE)
                .calorieTarget(2000.0)
                .carbsTarget(250.0)
                .proteinTarget(150.0)
                .fatTarget(67.0)
                .build();
    }

    @Nested
    @DisplayName("save")
    class SaveTests {

        @Test
        @DisplayName("save_whenNoExistingProfile_shouldCreateNewProfile")
        void save_whenNoExistingProfile_shouldCreateNewProfile() {
            DietaryProfilePayload payload = new DietaryProfilePayload();
            payload.setWeight(70.0);
            payload.setHeight(175.0);
            payload.setAge(30);
            payload.setGender(Gender.MALE);
            payload.setDietGoal(DietGoal.MAINTAIN);
            payload.setDietType(DietType.STANDARD);
            payload.setActivityLevel(ActivityLevel.MODERATE);

            when(authenticationService.getCurrentUser()).thenReturn(testUser);
            when(dietaryProfileRepository.findByUser(testUser)).thenReturn(null);
            when(dietaryProfileRepository.save(any(DietaryProfile.class))).thenAnswer(i -> {
                DietaryProfile p = i.getArgument(0);
                p.setId(1L);
                return p;
            });

            DietaryProfile result = dietaryProfileService.save(payload);

            assertThat(result).isNotNull();
            assertThat(result.getUser()).isEqualTo(testUser);
            verify(dietaryProfileRepository).save(any(DietaryProfile.class));
        }

        @Test
        @DisplayName("save_whenExistingProfile_shouldUpdateProfile")
        void save_whenExistingProfile_shouldUpdateProfile() {
            DietaryProfilePayload payload = new DietaryProfilePayload();
            payload.setWeight(75.0);
            payload.setHeight(175.0);
            payload.setAge(30);
            payload.setGender(Gender.MALE);
            payload.setDietGoal(DietGoal.LOSE);
            payload.setDietType(DietType.VEGETARIAN);
            payload.setActivityLevel(ActivityLevel.HIGH);

            when(authenticationService.getCurrentUser()).thenReturn(testUser);
            when(dietaryProfileRepository.findByUser(testUser)).thenReturn(testProfile);
            when(dietaryProfileRepository.save(any(DietaryProfile.class))).thenAnswer(i -> i.getArgument(0));

            DietaryProfile result = dietaryProfileService.save(payload);

            assertThat(result.getWeight()).isEqualTo(75.0);
            assertThat(result.getDietGoal()).isEqualTo(DietGoal.LOSE);
            assertThat(result.getDietType()).isEqualTo(DietType.VEGETARIAN);
        }

        @Test
        @DisplayName("save_shouldCalculateNutritionTargets")
        void save_shouldCalculateNutritionTargets() {
            DietaryProfilePayload payload = new DietaryProfilePayload();
            payload.setWeight(70.0);
            payload.setHeight(175.0);
            payload.setAge(30);
            payload.setGender(Gender.MALE);
            payload.setDietGoal(DietGoal.MAINTAIN);
            payload.setDietType(DietType.STANDARD);
            payload.setActivityLevel(ActivityLevel.MODERATE);

            when(authenticationService.getCurrentUser()).thenReturn(testUser);
            when(dietaryProfileRepository.findByUser(testUser)).thenReturn(null);
            when(dietaryProfileRepository.save(any(DietaryProfile.class))).thenAnswer(i -> i.getArgument(0));

            DietaryProfile result = dietaryProfileService.save(payload);

            assertThat(result.getCalorieTarget()).isGreaterThan(0);
            assertThat(result.getCarbsTarget()).isGreaterThan(0);
            assertThat(result.getProteinTarget()).isGreaterThan(0);
            assertThat(result.getFatTarget()).isGreaterThan(0);
        }
    }

    @Nested
    @DisplayName("updateWeight")
    class UpdateWeightTests {

        @Test
        @DisplayName("updateWeight_whenProfileExists_shouldUpdateWeightAndRecalculateTargets")
        void updateWeight_whenProfileExists_shouldUpdateWeightAndRecalculateTargets() {
            when(dietaryProfileRepository.findByUser(testUser)).thenReturn(testProfile);
            when(dietaryProfileRepository.save(any(DietaryProfile.class))).thenAnswer(i -> i.getArgument(0));

            dietaryProfileService.updateWeight(testUser, 75.0);

            assertThat(testProfile.getWeight()).isEqualTo(75.0);
            verify(dietaryProfileRepository).save(testProfile);
        }

        @Test
        @DisplayName("updateWeight_whenProfileNotExists_shouldNotSave")
        void updateWeight_whenProfileNotExists_shouldNotSave() {
            when(dietaryProfileRepository.findByUser(testUser)).thenReturn(null);

            dietaryProfileService.updateWeight(testUser, 75.0);

            verify(dietaryProfileRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("findById")
    class FindByIdTests {

        @Test
        @DisplayName("findById_whenProfileExists_shouldReturnProfile")
        void findById_whenProfileExists_shouldReturnProfile() {
            when(dietaryProfileRepository.findById(1L)).thenReturn(Optional.of(testProfile));

            DietaryProfile result = dietaryProfileService.findById(1L);

            assertThat(result).isEqualTo(testProfile);
        }

        @Test
        @DisplayName("findById_whenProfileNotFound_shouldThrowResourceNotFound")
        void findById_whenProfileNotFound_shouldThrowResourceNotFound() {
            when(dietaryProfileRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> dietaryProfileService.findById(999L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("isCreated")
    class IsCreatedTests {

        @Test
        @DisplayName("isCreated_whenProfileExists_shouldReturnProfile")
        void isCreated_whenProfileExists_shouldReturnProfile() {
            when(authenticationService.getCurrentUser()).thenReturn(testUser);
            when(dietaryProfileRepository.findByUser(testUser)).thenReturn(testProfile);

            DietaryProfile result = dietaryProfileService.isCreated();

            assertThat(result).isEqualTo(testProfile);
        }

        @Test
        @DisplayName("isCreated_whenProfileNotExists_shouldReturnNull")
        void isCreated_whenProfileNotExists_shouldReturnNull() {
            when(authenticationService.getCurrentUser()).thenReturn(testUser);
            when(dietaryProfileRepository.findByUser(testUser)).thenReturn(null);

            DietaryProfile result = dietaryProfileService.isCreated();

            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("getByUserId")
    class GetByUserIdTests {

        @Test
        @DisplayName("getByUserId_whenUserAndProfileExist_shouldReturnProfile")
        void getByUserId_whenUserAndProfileExist_shouldReturnProfile() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(dietaryProfileRepository.findByUser(testUser)).thenReturn(testProfile);

            DietaryProfile result = dietaryProfileService.getByUserId(1L);

            assertThat(result).isEqualTo(testProfile);
        }

        @Test
        @DisplayName("getByUserId_whenUserNotFound_shouldThrowResourceNotFound")
        void getByUserId_whenUserNotFound_shouldThrowResourceNotFound() {
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> dietaryProfileService.getByUserId(999L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("getByUserId_whenProfileNotExists_shouldReturnNull")
        void getByUserId_whenProfileNotExists_shouldReturnNull() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(dietaryProfileRepository.findByUser(testUser)).thenReturn(null);

            DietaryProfile result = dietaryProfileService.getByUserId(1L);

            assertThat(result).isNull();
        }
    }
}
