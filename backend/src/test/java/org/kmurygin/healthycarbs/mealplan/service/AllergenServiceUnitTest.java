package org.kmurygin.healthycarbs.mealplan.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kmurygin.healthycarbs.exception.ForbiddenException;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.model.Allergen;
import org.kmurygin.healthycarbs.mealplan.repository.AllergenRepository;
import org.kmurygin.healthycarbs.user.UserTestUtils;
import org.kmurygin.healthycarbs.user.model.Role;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.service.UserService;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AllergenService Unit Tests")
class AllergenServiceUnitTest {

    @Mock
    private AllergenRepository allergenRepository;

    @Mock
    private UserService userService;

    private AllergenService allergenService;

    private User testUser;
    private User adminUser;
    private Allergen testAllergen;

    @BeforeEach
    void setUp() {
        allergenService = new AllergenService(allergenRepository, userService);

        testUser = UserTestUtils.createTestUser(1L, "testuser", Role.DIETITIAN);
        adminUser = UserTestUtils.createTestUser(2L, "admin", Role.ADMIN);

        testAllergen = Allergen.builder()
                .id(1L)
                .name("Gluten")
                .author(testUser)
                .build();
    }

    @Nested
    @DisplayName("findAll")
    class FindAllTests {

        @Test
        @DisplayName("findAll_shouldReturnAllAllergens")
        void findAll_shouldReturnAllAllergens() {
            Allergen allergen2 = Allergen.builder()
                    .id(2L)
                    .name("Dairy")
                    .author(testUser)
                    .build();

            when(allergenRepository.findAll()).thenReturn(List.of(testAllergen, allergen2));

            List<Allergen> result = allergenService.findAll();

            assertThat(result).hasSize(2);
            assertThat(result).extracting(Allergen::getName).containsExactly("Gluten", "Dairy");
            verify(allergenRepository).findAll();
        }

        @Test
        @DisplayName("findAll_whenEmpty_shouldReturnEmptyList")
        void findAll_whenEmpty_shouldReturnEmptyList() {
            when(allergenRepository.findAll()).thenReturn(List.of());

            List<Allergen> result = allergenService.findAll();

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("findById")
    class FindByIdTests {

        @Test
        @DisplayName("findById_whenExists_shouldReturnAllergen")
        void findById_whenExists_shouldReturnAllergen() {
            when(allergenRepository.findById(1L)).thenReturn(Optional.of(testAllergen));

            Allergen result = allergenService.findById(1L);

            assertThat(result).isEqualTo(testAllergen);
            assertThat(result.getName()).isEqualTo("Gluten");
        }

        @Test
        @DisplayName("findById_whenNotExists_shouldThrowResourceNotFoundException")
        void findById_whenNotExists_shouldThrowResourceNotFoundException() {
            when(allergenRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> allergenService.findById(999L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Allergen");
        }
    }

    @Nested
    @DisplayName("create")
    class CreateTests {

        @Test
        @DisplayName("create_shouldSetAuthorAndSave")
        void create_shouldSetAuthorAndSave() {
            Allergen newAllergen = Allergen.builder()
                    .name("Nuts")
                    .build();

            when(userService.getCurrentUser()).thenReturn(testUser);
            when(allergenRepository.save(any(Allergen.class))).thenAnswer(invocation -> {
                Allergen saved = invocation.getArgument(0);
                saved.setId(3L);
                return saved;
            });

            Allergen result = allergenService.create(newAllergen);

            assertThat(result.getAuthor()).isEqualTo(testUser);
            assertThat(result.getName()).isEqualTo("Nuts");
            verify(allergenRepository).save(newAllergen);
        }
    }

    @Nested
    @DisplayName("update")
    class UpdateTests {

        @Test
        @DisplayName("update_whenAuthorIsCurrentUser_shouldUpdateAndSave")
        void update_whenAuthorIsCurrentUser_shouldUpdateAndSave() {
            Allergen updatedAllergen = Allergen.builder()
                    .name("Updated Gluten")
                    .build();

            when(allergenRepository.findById(1L)).thenReturn(Optional.of(testAllergen));
            when(userService.getCurrentUser()).thenReturn(testUser);
            when(allergenRepository.save(any(Allergen.class))).thenReturn(testAllergen);

            Allergen result = allergenService.update(1L, updatedAllergen);

            assertThat(result.getName()).isEqualTo("Updated Gluten");
            verify(allergenRepository).save(testAllergen);
        }

        @Test
        @DisplayName("update_whenCurrentUserIsAdmin_shouldUpdateAndSave")
        void update_whenCurrentUserIsAdmin_shouldUpdateAndSave() {
            Allergen updatedAllergen = Allergen.builder()
                    .name("Admin Updated")
                    .build();

            when(allergenRepository.findById(1L)).thenReturn(Optional.of(testAllergen));
            when(userService.getCurrentUser()).thenReturn(adminUser);
            when(allergenRepository.save(any(Allergen.class))).thenReturn(testAllergen);

            Allergen result = allergenService.update(1L, updatedAllergen);

            assertThat(result.getName()).isEqualTo("Admin Updated");
            verify(allergenRepository).save(testAllergen);
        }

        @Test
        @DisplayName("update_whenNotAuthorAndNotAdmin_shouldThrowForbiddenException")
        void update_whenNotAuthorAndNotAdmin_shouldThrowForbiddenException() {
            User otherUser = UserTestUtils.createTestUser(3L, "otheruser", Role.DIETITIAN);
            Allergen updatedAllergen = Allergen.builder()
                    .name("Unauthorized Update")
                    .build();

            when(allergenRepository.findById(1L)).thenReturn(Optional.of(testAllergen));
            when(userService.getCurrentUser()).thenReturn(otherUser);

            assertThatThrownBy(() -> allergenService.update(1L, updatedAllergen))
                    .isInstanceOf(ForbiddenException.class)
                    .hasMessageContaining("not authorized");
        }

        @Test
        @DisplayName("update_whenAllergenNotExists_shouldThrowResourceNotFoundException")
        void update_whenAllergenNotExists_shouldThrowResourceNotFoundException() {
            Allergen updatedAllergen = Allergen.builder()
                    .name("Updated")
                    .build();

            when(allergenRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> allergenService.update(999L, updatedAllergen))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("deleteById")
    class DeleteByIdTests {

        @Test
        @DisplayName("deleteById_shouldCallRepositoryDelete")
        void deleteById_shouldCallRepositoryDelete() {
            when(allergenRepository.findById(1L)).thenReturn(Optional.of(testAllergen));
            when(userService.getCurrentUser()).thenReturn(testUser);
            doNothing().when(allergenRepository).deleteById(1L);

            allergenService.deleteById(1L);

            verify(allergenRepository).deleteById(1L);
        }
    }
}
