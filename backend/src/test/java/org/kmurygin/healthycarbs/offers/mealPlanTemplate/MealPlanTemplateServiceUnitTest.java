package org.kmurygin.healthycarbs.offers.mealPlanTemplate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.service.MealPlanService;
import org.kmurygin.healthycarbs.offers.offer.OfferService;
import org.kmurygin.healthycarbs.user.UserTestUtils;
import org.kmurygin.healthycarbs.user.model.Role;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.service.UserService;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("MealPlanTemplateService Unit Tests")
class MealPlanTemplateServiceUnitTest {

    @Mock
    private MealPlanTemplateRepository mealPlanTemplateRepository;

    @Mock
    private MealPlanService mealPlanService;

    @Mock
    private OfferService offerService;

    @Mock
    private UserService userService;

    private MealPlanTemplateService mealPlanTemplateService;

    private User authorUser;
    private User adminUser;
    private User otherUser;
    private MealPlanTemplate testTemplate;

    @BeforeEach
    void setUp() {
        mealPlanTemplateService = new MealPlanTemplateService(
                mealPlanTemplateRepository,
                mealPlanService,
                offerService,
                userService
        );

        authorUser = UserTestUtils.createTestUser(1L, "author", Role.DIETITIAN);
        adminUser = UserTestUtils.createTestUser(2L, "admin", Role.ADMIN);
        otherUser = UserTestUtils.createTestUser(3L, "other", Role.DIETITIAN);

        testTemplate = MealPlanTemplate.builder()
                .id(1L)
                .name("Test Template")
                .description("Test description")
                .totalCalories(2000.0)
                .totalCarbs(250.0)
                .totalProtein(150.0)
                .totalFat(67.0)
                .author(authorUser)
                .days(new ArrayList<>())
                .build();
    }

    @Nested
    @DisplayName("findAll")
    class FindAllTests {

        @Test
        @DisplayName("findAll_shouldReturnAllTemplates")
        void findAll_shouldReturnAllTemplates() {
            MealPlanTemplate template2 = MealPlanTemplate.builder()
                    .id(2L)
                    .name("Template 2")
                    .author(authorUser)
                    .build();

            when(mealPlanTemplateRepository.findAll()).thenReturn(List.of(testTemplate, template2));

            List<MealPlanTemplate> result = mealPlanTemplateService.findAll();

            assertThat(result).hasSize(2);
            assertThat(result).extracting(MealPlanTemplate::getName)
                    .containsExactly("Test Template", "Template 2");
        }

        @Test
        @DisplayName("findAll_whenEmpty_shouldReturnEmptyList")
        void findAll_whenEmpty_shouldReturnEmptyList() {
            when(mealPlanTemplateRepository.findAll()).thenReturn(List.of());

            List<MealPlanTemplate> result = mealPlanTemplateService.findAll();

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("findById")
    class FindByIdTests {

        @Test
        @DisplayName("findById_whenExists_shouldReturnTemplate")
        void findById_whenExists_shouldReturnTemplate() {
            when(mealPlanTemplateRepository.findById(1L)).thenReturn(Optional.of(testTemplate));

            MealPlanTemplate result = mealPlanTemplateService.findById(1L);

            assertThat(result).isEqualTo(testTemplate);
            assertThat(result.getName()).isEqualTo("Test Template");
        }

        @Test
        @DisplayName("findById_whenNotExists_shouldThrowResourceNotFoundException")
        void findById_whenNotExists_shouldThrowResourceNotFoundException() {
            when(mealPlanTemplateRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> mealPlanTemplateService.findById(999L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("MealPlanTemplate");
        }
    }

    @Nested
    @DisplayName("create")
    class CreateTests {

        @Test
        @DisplayName("create_shouldSetAuthorAndSave")
        void create_shouldSetAuthorAndSave() {
            MealPlanTemplate newTemplate = MealPlanTemplate.builder()
                    .name("New Template")
                    .description("New description")
                    .build();

            when(userService.getCurrentUser()).thenReturn(authorUser);
            when(mealPlanTemplateRepository.save(any(MealPlanTemplate.class))).thenAnswer(invocation -> {
                MealPlanTemplate saved = invocation.getArgument(0);
                saved.setId(3L);
                return saved;
            });

            MealPlanTemplate result = mealPlanTemplateService.create(newTemplate);

            assertThat(result.getAuthor()).isEqualTo(authorUser);
            verify(mealPlanTemplateRepository).save(newTemplate);
        }
    }

    @Nested
    @DisplayName("update")
    class UpdateTests {

        @Test
        @DisplayName("update_whenAuthor_shouldUpdateAndSave")
        void update_whenAuthor_shouldUpdateAndSave() {
            MealPlanTemplate updatedData = MealPlanTemplate.builder()
                    .name("Updated Name")
                    .description("Updated description")
                    .totalCalories(2500.0)
                    .totalCarbs(300.0)
                    .totalProtein(180.0)
                    .totalFat(80.0)
                    .days(new ArrayList<>())
                    .build();

            when(mealPlanTemplateRepository.findById(1L)).thenReturn(Optional.of(testTemplate));
            when(userService.getCurrentUser()).thenReturn(authorUser);
            when(mealPlanTemplateRepository.save(any(MealPlanTemplate.class))).thenAnswer(invocation -> invocation.getArgument(0));

            MealPlanTemplate result = mealPlanTemplateService.update(1L, updatedData);

            assertThat(result.getName()).isEqualTo("Updated Name");
            assertThat(result.getDescription()).isEqualTo("Updated description");
            verify(mealPlanTemplateRepository).save(any(MealPlanTemplate.class));
        }

        @Test
        @DisplayName("update_whenAdmin_shouldUpdateAndSave")
        void update_whenAdmin_shouldUpdateAndSave() {
            MealPlanTemplate updatedData = MealPlanTemplate.builder()
                    .name("Admin Updated")
                    .description("Admin update")
                    .totalCalories(2500.0)
                    .totalCarbs(300.0)
                    .totalProtein(180.0)
                    .totalFat(80.0)
                    .days(new ArrayList<>())
                    .build();

            when(mealPlanTemplateRepository.findById(1L)).thenReturn(Optional.of(testTemplate));
            when(userService.getCurrentUser()).thenReturn(adminUser);
            when(mealPlanTemplateRepository.save(any(MealPlanTemplate.class))).thenAnswer(invocation -> invocation.getArgument(0));

            MealPlanTemplate result = mealPlanTemplateService.update(1L, updatedData);

            assertThat(result.getName()).isEqualTo("Admin Updated");
            verify(mealPlanTemplateRepository).save(any(MealPlanTemplate.class));
        }

        @Test
        @DisplayName("update_whenNotAuthorOrAdmin_shouldThrowSecurityException")
        void update_whenNotAuthorOrAdmin_shouldThrowSecurityException() {
            MealPlanTemplate updatedData = MealPlanTemplate.builder()
                    .name("Unauthorized Update")
                    .build();

            when(mealPlanTemplateRepository.findById(1L)).thenReturn(Optional.of(testTemplate));
            when(userService.getCurrentUser()).thenReturn(otherUser);

            assertThatThrownBy(() -> mealPlanTemplateService.update(1L, updatedData))
                    .isInstanceOf(SecurityException.class)
                    .hasMessageContaining("not authorized");
        }

        @Test
        @DisplayName("update_whenNotFound_shouldThrowResourceNotFoundException")
        void update_whenNotFound_shouldThrowResourceNotFoundException() {
            MealPlanTemplate updatedData = MealPlanTemplate.builder()
                    .name("Not Found")
                    .build();

            when(mealPlanTemplateRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> mealPlanTemplateService.update(999L, updatedData))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("MealPlanTemplate");
        }
    }

    @Nested
    @DisplayName("deleteById")
    class DeleteByIdTests {

        @Test
        @DisplayName("deleteById_whenAuthor_shouldDelete")
        void deleteById_whenAuthor_shouldDelete() {
            when(mealPlanTemplateRepository.findById(1L)).thenReturn(Optional.of(testTemplate));
            when(userService.getCurrentUser()).thenReturn(authorUser);

            mealPlanTemplateService.deleteById(1L);

            verify(mealPlanTemplateRepository).deleteById(1L);
        }

        @Test
        @DisplayName("deleteById_whenAdmin_shouldDelete")
        void deleteById_whenAdmin_shouldDelete() {
            when(mealPlanTemplateRepository.findById(1L)).thenReturn(Optional.of(testTemplate));
            when(userService.getCurrentUser()).thenReturn(adminUser);

            mealPlanTemplateService.deleteById(1L);

            verify(mealPlanTemplateRepository).deleteById(1L);
        }

        @Test
        @DisplayName("deleteById_whenNotAuthorOrAdmin_shouldThrowSecurityException")
        void deleteById_whenNotAuthorOrAdmin_shouldThrowSecurityException() {
            when(mealPlanTemplateRepository.findById(1L)).thenReturn(Optional.of(testTemplate));
            when(userService.getCurrentUser()).thenReturn(otherUser);

            assertThatThrownBy(() -> mealPlanTemplateService.deleteById(1L))
                    .isInstanceOf(SecurityException.class)
                    .hasMessageContaining("not authorized");
        }

        @Test
        @DisplayName("deleteById_whenNotFound_shouldThrowResourceNotFoundException")
        void deleteById_whenNotFound_shouldThrowResourceNotFoundException() {
            when(mealPlanTemplateRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> mealPlanTemplateService.deleteById(999L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("MealPlanTemplate");
        }
    }
}
