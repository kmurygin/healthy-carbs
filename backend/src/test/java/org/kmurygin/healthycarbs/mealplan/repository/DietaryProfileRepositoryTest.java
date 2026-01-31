package org.kmurygin.healthycarbs.mealplan.repository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.kmurygin.healthycarbs.mealplan.ActivityLevel;
import org.kmurygin.healthycarbs.mealplan.DietGoal;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.Gender;
import org.kmurygin.healthycarbs.mealplan.model.DietaryProfile;
import org.kmurygin.healthycarbs.user.UserTestUtils;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@DisplayName("DietaryProfileRepository Integration Tests")
class DietaryProfileRepositoryTest {

    @Autowired
    private DietaryProfileRepository dietaryProfileRepository;

    @Autowired
    private UserRepository userRepository;

    private User savedUser;

    @BeforeEach
    void setUp() {
        dietaryProfileRepository.deleteAll();
        userRepository.deleteAll();

        savedUser = userRepository.save(UserTestUtils.createRegularUserForPersistence(
                String.valueOf(System.currentTimeMillis())));
    }

    @Nested
    @DisplayName("findByUser")
    class FindByUserTests {

        @Test
        @DisplayName("findByUser_whenProfileExists_shouldReturnProfile")
        void findByUser_whenProfileExists_shouldReturnProfile() {
            DietaryProfile saved = dietaryProfileRepository.save(DietaryProfile.builder()
                    .user(savedUser)
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
                    .build());

            DietaryProfile result = dietaryProfileRepository.findByUser(savedUser);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(saved.getId());
            assertThat(result.getWeight()).isEqualTo(70.0);
        }

        @Test
        @DisplayName("findByUser_whenProfileNotExists_shouldReturnNull")
        void findByUser_whenProfileNotExists_shouldReturnNull() {
            DietaryProfile result = dietaryProfileRepository.findByUser(savedUser);

            assertThat(result).isNull();
        }

        @Test
        @DisplayName("findByUser_shouldReturnCorrectUserProfile")
        void findByUser_shouldReturnCorrectUserProfile() {
            User anotherUser = userRepository.save(UserTestUtils.createRegularUserForPersistence(
                    "another_" + System.currentTimeMillis()));

            dietaryProfileRepository.save(DietaryProfile.builder()
                    .user(savedUser)
                    .weight(70.0)
                    .height(175.0)
                    .age(30)
                    .gender(Gender.MALE)
                    .dietGoal(DietGoal.MAINTAIN)
                    .dietType(DietType.STANDARD)
                    .activityLevel(ActivityLevel.MODERATE)
                    .calorieTarget(2000.0)
                    .build());

            dietaryProfileRepository.save(DietaryProfile.builder()
                    .user(anotherUser)
                    .weight(65.0)
                    .height(165.0)
                    .age(25)
                    .gender(Gender.FEMALE)
                    .dietGoal(DietGoal.LOSE)
                    .dietType(DietType.VEGETARIAN)
                    .activityLevel(ActivityLevel.HIGH)
                    .calorieTarget(1800.0)
                    .build());

            DietaryProfile result = dietaryProfileRepository.findByUser(savedUser);

            assertThat(result.getWeight()).isEqualTo(70.0);
            assertThat(result.getGender()).isEqualTo(Gender.MALE);
        }
    }

    @Nested
    @DisplayName("CRUD operations")
    class CrudOperationsTests {

        @Test
        @DisplayName("save_shouldPersistProfile")
        void save_shouldPersistProfile() {
            DietaryProfile profile = dietaryProfileRepository.save(DietaryProfile.builder()
                    .user(savedUser)
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
                    .build());

            assertThat(profile.getId()).isNotNull();
            assertThat(dietaryProfileRepository.findById(profile.getId())).isPresent();
        }

        @Test
        @DisplayName("findById_shouldReturnProfile")
        void findById_shouldReturnProfile() {
            DietaryProfile saved = dietaryProfileRepository.save(DietaryProfile.builder()
                    .user(savedUser)
                    .weight(70.0)
                    .height(175.0)
                    .age(30)
                    .gender(Gender.MALE)
                    .dietGoal(DietGoal.MAINTAIN)
                    .dietType(DietType.STANDARD)
                    .activityLevel(ActivityLevel.MODERATE)
                    .calorieTarget(2000.0)
                    .build());

            Optional<DietaryProfile> result = dietaryProfileRepository.findById(saved.getId());

            assertThat(result).isPresent();
            assertThat(result.get().getWeight()).isEqualTo(70.0);
        }

        @Test
        @DisplayName("save_shouldUpdateExistingProfile")
        void save_shouldUpdateExistingProfile() {
            DietaryProfile profile = dietaryProfileRepository.save(DietaryProfile.builder()
                    .user(savedUser)
                    .weight(70.0)
                    .height(175.0)
                    .age(30)
                    .gender(Gender.MALE)
                    .dietGoal(DietGoal.MAINTAIN)
                    .dietType(DietType.STANDARD)
                    .activityLevel(ActivityLevel.MODERATE)
                    .calorieTarget(2000.0)
                    .build());

            profile.setWeight(75.0);
            profile.setDietGoal(DietGoal.LOSE);
            profile.setCalorieTarget(1800.0);
            dietaryProfileRepository.save(profile);

            Optional<DietaryProfile> updated = dietaryProfileRepository.findById(profile.getId());
            assertThat(updated).isPresent();
            assertThat(updated.get().getWeight()).isEqualTo(75.0);
            assertThat(updated.get().getDietGoal()).isEqualTo(DietGoal.LOSE);
            assertThat(updated.get().getCalorieTarget()).isEqualTo(1800.0);
        }

        @Test
        @DisplayName("delete_shouldRemoveProfile")
        void delete_shouldRemoveProfile() {
            DietaryProfile profile = dietaryProfileRepository.save(DietaryProfile.builder()
                    .user(savedUser)
                    .weight(70.0)
                    .height(175.0)
                    .age(30)
                    .gender(Gender.MALE)
                    .dietGoal(DietGoal.MAINTAIN)
                    .dietType(DietType.STANDARD)
                    .activityLevel(ActivityLevel.MODERATE)
                    .calorieTarget(2000.0)
                    .build());

            Long profileId = profile.getId();
            dietaryProfileRepository.delete(profile);

            assertThat(dietaryProfileRepository.findById(profileId)).isEmpty();
        }
    }
}
