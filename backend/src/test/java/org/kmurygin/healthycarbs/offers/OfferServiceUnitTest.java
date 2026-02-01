package org.kmurygin.healthycarbs.offers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.offers.mealPlanTemplate.MealPlanTemplate;
import org.kmurygin.healthycarbs.offers.mealPlanTemplate.MealPlanTemplateRepository;
import org.kmurygin.healthycarbs.offers.offer.Offer;
import org.kmurygin.healthycarbs.offers.offer.OfferMapper;
import org.kmurygin.healthycarbs.offers.offer.OfferRepository;
import org.kmurygin.healthycarbs.offers.offer.OfferService;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("OfferService Unit Tests")
class OfferServiceUnitTest {

    @Mock
    private OfferRepository offerRepository;

    @Mock
    private OfferMapper offerMapper;

    @Mock
    private MealPlanTemplateRepository templateRepository;

    private OfferService offerService;

    private Offer testOffer;
    private MealPlanTemplate testTemplate;

    @BeforeEach
    void setUp() {
        offerService = new OfferService(offerRepository, offerMapper, templateRepository);

        testTemplate = MealPlanTemplate.builder()
                .id(1L)
                .name("Basic Plan Template")
                .description("A basic meal plan template")
                .build();

        testOffer = new Offer();
        testOffer.setId(1L);
        testOffer.setTitle("Basic Plan");
        testOffer.setDescription("A basic meal plan offer");
        testOffer.setPrice(9900);
        testOffer.setCurrency(Currency.PLN);
        testOffer.setFeatures(Set.of("Feature 1", "Feature 2"));
        testOffer.setDurationInDays(30);
        testOffer.setMealPlanTemplate(testTemplate);
    }

    @Nested
    @DisplayName("findAll")
    class FindAllTests {

        @Test
        @DisplayName("findAll_shouldReturnAllOffers")
        void findAll_shouldReturnAllOffers() {
            Offer offer2 = new Offer();
            offer2.setId(2L);
            offer2.setTitle("Premium Plan");

            when(offerRepository.findAll()).thenReturn(List.of(testOffer, offer2));

            List<Offer> result = offerService.findAll();

            assertThat(result).hasSize(2);
            assertThat(result).extracting(Offer::getTitle).containsExactly("Basic Plan", "Premium Plan");
        }

        @Test
        @DisplayName("findAll_whenEmpty_shouldReturnEmptyList")
        void findAll_whenEmpty_shouldReturnEmptyList() {
            when(offerRepository.findAll()).thenReturn(List.of());

            List<Offer> result = offerService.findAll();

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("findById")
    class FindByIdTests {

        @Test
        @DisplayName("findById_whenExists_shouldReturnOffer")
        void findById_whenExists_shouldReturnOffer() {
            when(offerRepository.findById(1L)).thenReturn(Optional.of(testOffer));

            Offer result = offerService.findById(1L);

            assertThat(result).isEqualTo(testOffer);
            assertThat(result.getTitle()).isEqualTo("Basic Plan");
        }

        @Test
        @DisplayName("findById_whenNotExists_shouldThrowResourceNotFoundException")
        void findById_whenNotExists_shouldThrowResourceNotFoundException() {
            when(offerRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> offerService.findById(999L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Offer");
        }
    }

    @Nested
    @DisplayName("create")
    class CreateTests {

        @Test
        @DisplayName("create_withoutTemplate_shouldSaveOffer")
        void create_withoutTemplate_shouldSaveOffer() {
            Offer newOffer = new Offer();
            newOffer.setTitle("New Offer");
            newOffer.setPrice(4900);

            when(offerRepository.save(any(Offer.class))).thenAnswer(invocation -> {
                Offer saved = invocation.getArgument(0);
                saved.setId(3L);
                return saved;
            });

            Offer result = offerService.create(newOffer);

            assertThat(result.getTitle()).isEqualTo("New Offer");
            verify(offerRepository).save(newOffer);
        }

        @Test
        @DisplayName("create_withTemplate_shouldAssociateTemplateAndSave")
        void create_withTemplate_shouldAssociateTemplateAndSave() {
            Offer newOffer = new Offer();
            newOffer.setTitle("Offer with Template");
            newOffer.setPrice(7900);

            when(templateRepository.findById(1L)).thenReturn(Optional.of(testTemplate));
            when(offerRepository.save(any(Offer.class))).thenAnswer(invocation -> {
                Offer saved = invocation.getArgument(0);
                saved.setId(4L);
                return saved;
            });

            Offer result = offerService.create(newOffer, 1L);

            assertThat(result.getMealPlanTemplate()).isEqualTo(testTemplate);
            verify(offerRepository).save(newOffer);
        }

        @Test
        @DisplayName("create_withNonExistentTemplate_shouldThrowResourceNotFoundException")
        void create_withNonExistentTemplate_shouldThrowResourceNotFoundException() {
            Offer newOffer = new Offer();
            newOffer.setTitle("Offer with Template");

            when(templateRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> offerService.create(newOffer, 999L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("MealPlanTemplate");
        }
    }

    @Nested
    @DisplayName("update")
    class UpdateTests {

        @Test
        @DisplayName("update_whenOfferExists_shouldUpdateAndSave")
        void update_whenOfferExists_shouldUpdateAndSave() {
            Offer updatedOffer = new Offer();
            updatedOffer.setTitle("Updated Offer");
            updatedOffer.setPrice(12900);

            when(offerRepository.findById(1L)).thenReturn(Optional.of(testOffer));
            doNothing().when(offerMapper).updateFromEntity(updatedOffer, testOffer);
            when(offerRepository.save(any(Offer.class))).thenReturn(testOffer);

            Offer result = offerService.update(1L, updatedOffer);

            assertThat(result).isNotNull();
            verify(offerMapper).updateFromEntity(updatedOffer, testOffer);
            verify(offerRepository).save(testOffer);
        }

        @Test
        @DisplayName("update_withTemplate_shouldUpdateTemplateAndSave")
        void update_withTemplate_shouldUpdateTemplateAndSave() {
            Offer updatedOffer = new Offer();
            updatedOffer.setTitle("Updated with Template");

            MealPlanTemplate newTemplate = MealPlanTemplate.builder()
                    .id(2L)
                    .name("Premium Template")
                    .build();

            when(offerRepository.findById(1L)).thenReturn(Optional.of(testOffer));
            doNothing().when(offerMapper).updateFromEntity(updatedOffer, testOffer);
            when(templateRepository.findById(2L)).thenReturn(Optional.of(newTemplate));
            when(offerRepository.save(any(Offer.class))).thenReturn(testOffer);

            Offer result = offerService.update(1L, updatedOffer, 2L);

            assertThat(result.getMealPlanTemplate()).isEqualTo(newTemplate);
            verify(offerRepository).save(testOffer);
        }

        @Test
        @DisplayName("update_whenOfferNotExists_shouldThrowResourceNotFoundException")
        void update_whenOfferNotExists_shouldThrowResourceNotFoundException() {
            Offer updatedOffer = new Offer();
            updatedOffer.setTitle("Updated");

            when(offerRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> offerService.update(999L, updatedOffer))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Offer");
        }

        @Test
        @DisplayName("update_withNonExistentTemplate_shouldThrowResourceNotFoundException")
        void update_withNonExistentTemplate_shouldThrowResourceNotFoundException() {
            Offer updatedOffer = new Offer();

            when(offerRepository.findById(1L)).thenReturn(Optional.of(testOffer));
            doNothing().when(offerMapper).updateFromEntity(updatedOffer, testOffer);
            when(templateRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> offerService.update(1L, updatedOffer, 999L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("MealPlanTemplate");
        }
    }

    @Nested
    @DisplayName("deleteById")
    class DeleteByIdTests {

        @Test
        @DisplayName("deleteById_whenOfferExists_shouldDelete")
        void deleteById_whenOfferExists_shouldDelete() {
            when(offerRepository.existsById(1L)).thenReturn(true);
            doNothing().when(offerRepository).deleteById(1L);

            offerService.deleteById(1L);

            verify(offerRepository).deleteById(1L);
        }

        @Test
        @DisplayName("deleteById_whenOfferNotExists_shouldThrowResourceNotFoundException")
        void deleteById_whenOfferNotExists_shouldThrowResourceNotFoundException() {
            when(offerRepository.existsById(999L)).thenReturn(false);

            assertThatThrownBy(() -> offerService.deleteById(999L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Offer");
        }
    }
}
