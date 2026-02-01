package org.kmurygin.healthycarbs.measurements;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kmurygin.healthycarbs.auth.service.AuthenticationService;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.service.DietaryProfileService;
import org.kmurygin.healthycarbs.measurements.mapper.UserMeasurementMapper;
import org.kmurygin.healthycarbs.measurements.model.UserMeasurement;
import org.kmurygin.healthycarbs.measurements.repository.UserMeasurementRepository;
import org.kmurygin.healthycarbs.measurements.service.UserMeasurementService;
import org.kmurygin.healthycarbs.user.UserTestUtils;
import org.kmurygin.healthycarbs.user.model.User;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserMeasurementService Unit Tests")
class UserMeasurementServiceUnitTest {

    @Mock
    private UserMeasurementRepository userMeasurementRepository;

    @Mock
    private DietaryProfileService dietaryProfileService;

    @Mock
    private AuthenticationService authenticationService;

    @Mock
    private UserMeasurementMapper userMeasurementMapper;

    private UserMeasurementService userMeasurementService;

    private User testUser;
    private UserMeasurement testMeasurement;

    @BeforeEach
    void setUp() {
        userMeasurementService = new UserMeasurementService(
                userMeasurementRepository,
                dietaryProfileService,
                authenticationService,
                userMeasurementMapper
        );

        testUser = UserTestUtils.createTestUser(1L, "testuser");

        testMeasurement = UserMeasurement.builder()
                .id(1L)
                .user(testUser)
                .weight(75.0)
                .waistCircumference(85.0)
                .hipCircumference(95.0)
                .date(Instant.now())
                .build();
    }

    @Nested
    @DisplayName("addMeasurement")
    class AddMeasurementTests {

        @Test
        @DisplayName("addMeasurement_shouldSetUserAndDateAndSave")
        void addMeasurement_shouldSetUserAndDateAndSave() {
            UserMeasurement newMeasurement = UserMeasurement.builder()
                    .weight(76.5)
                    .waistCircumference(84.0)
                    .build();

            when(authenticationService.getCurrentUser()).thenReturn(testUser);
            when(userMeasurementRepository.save(any(UserMeasurement.class))).thenReturn(newMeasurement);

            userMeasurementService.addMeasurement(newMeasurement);

            assertThat(newMeasurement.getUser()).isEqualTo(testUser);
            assertThat(newMeasurement.getDate()).isNotNull();
            verify(userMeasurementRepository).save(newMeasurement);
            verify(dietaryProfileService).updateWeight(testUser, 76.5);
        }

        @Test
        @DisplayName("addMeasurement_withNullWeight_shouldNotUpdateDietaryProfile")
        void addMeasurement_withNullWeight_shouldNotUpdateDietaryProfile() {
            UserMeasurement newMeasurement = UserMeasurement.builder()
                    .waistCircumference(84.0)
                    .build();

            when(authenticationService.getCurrentUser()).thenReturn(testUser);
            when(userMeasurementRepository.save(any(UserMeasurement.class))).thenReturn(newMeasurement);

            userMeasurementService.addMeasurement(newMeasurement);

            verify(userMeasurementRepository).save(newMeasurement);
            verify(dietaryProfileService, never()).updateWeight(any(), any());
        }
    }

    @Nested
    @DisplayName("findAll")
    class FindAllTests {

        @Test
        @DisplayName("findAll_shouldReturnUserMeasurementsOrderedByDate")
        void findAll_shouldReturnUserMeasurementsOrderedByDate() {
            UserMeasurement measurement2 = UserMeasurement.builder()
                    .id(2L)
                    .user(testUser)
                    .weight(74.5)
                    .date(Instant.now().plusSeconds(3600))
                    .build();

            when(authenticationService.getCurrentUser()).thenReturn(testUser);
            when(userMeasurementRepository.findAllByUserIdOrderByDateAsc(1L))
                    .thenReturn(List.of(testMeasurement, measurement2));

            List<UserMeasurement> result = userMeasurementService.findAll();

            assertThat(result).hasSize(2);
            assertThat(result.get(0).getWeight()).isEqualTo(75.0);
            assertThat(result.get(1).getWeight()).isEqualTo(74.5);
        }

        @Test
        @DisplayName("findAll_whenNoMeasurements_shouldReturnEmptyList")
        void findAll_whenNoMeasurements_shouldReturnEmptyList() {
            when(authenticationService.getCurrentUser()).thenReturn(testUser);
            when(userMeasurementRepository.findAllByUserIdOrderByDateAsc(1L))
                    .thenReturn(List.of());

            List<UserMeasurement> result = userMeasurementService.findAll();

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("updateRecentMeasurement")
    class UpdateRecentMeasurementTests {

        @Test
        @DisplayName("updateRecentMeasurement_shouldUpdateAndSave")
        void updateRecentMeasurement_shouldUpdateAndSave() {
            UserMeasurement update = UserMeasurement.builder()
                    .weight(76.0)
                    .waistCircumference(83.0)
                    .build();

            when(authenticationService.getCurrentUser()).thenReturn(testUser);
            when(userMeasurementRepository.findFirstByUserIdOrderByDateDesc(1L))
                    .thenReturn(Optional.of(testMeasurement));
            doNothing().when(userMeasurementMapper).updateEntity(testMeasurement, update);
            when(userMeasurementRepository.save(testMeasurement)).thenReturn(testMeasurement);

            userMeasurementService.updateRecentMeasurement(update);

            verify(userMeasurementMapper).updateEntity(testMeasurement, update);
            verify(userMeasurementRepository).save(testMeasurement);
            verify(dietaryProfileService).updateWeight(testUser, testMeasurement.getWeight());
        }

        @Test
        @DisplayName("updateRecentMeasurement_whenNoMeasurementsExist_shouldThrowResourceNotFoundException")
        void updateRecentMeasurement_whenNoMeasurementsExist_shouldThrowResourceNotFoundException() {
            UserMeasurement update = UserMeasurement.builder()
                    .weight(76.0)
                    .build();

            when(authenticationService.getCurrentUser()).thenReturn(testUser);
            when(userMeasurementRepository.findFirstByUserIdOrderByDateDesc(1L))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> userMeasurementService.updateRecentMeasurement(update))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("UserMeasurement");
        }

        @Test
        @DisplayName("updateRecentMeasurement_withNullWeight_shouldNotUpdateDietaryProfile")
        void updateRecentMeasurement_withNullWeight_shouldNotUpdateDietaryProfile() {
            UserMeasurement update = UserMeasurement.builder()
                    .waistCircumference(83.0)
                    .build();

            UserMeasurement existingMeasurement = UserMeasurement.builder()
                    .id(1L)
                    .user(testUser)
                    .weight(null)
                    .waistCircumference(85.0)
                    .date(Instant.now())
                    .build();

            when(authenticationService.getCurrentUser()).thenReturn(testUser);
            when(userMeasurementRepository.findFirstByUserIdOrderByDateDesc(1L))
                    .thenReturn(Optional.of(existingMeasurement));
            doNothing().when(userMeasurementMapper).updateEntity(existingMeasurement, update);
            when(userMeasurementRepository.save(existingMeasurement)).thenReturn(existingMeasurement);

            userMeasurementService.updateRecentMeasurement(update);

            verify(dietaryProfileService, never()).updateWeight(any(), any());
        }
    }
}
