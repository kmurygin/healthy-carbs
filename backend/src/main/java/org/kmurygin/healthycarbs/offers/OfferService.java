package org.kmurygin.healthycarbs.offers;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class OfferService {

    private final OfferRepository offerRepository;
    private final OfferMapper offerMapper;
    private final MealPlanTemplateRepository templateRepository;

    public List<Offer> findAll() {
        return offerRepository.findAll();
    }

    public Offer findById(Long id) {
        return offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer", "id", id));
    }

    @Transactional
    public Offer create(Offer offer) {
        return offerRepository.save(offer);
    }

    @Transactional
    public Offer create(Offer offer, Long mealPlanTemplateId) {
        MealPlanTemplate template = templateRepository.findById(mealPlanTemplateId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "MealPlanTemplate", "id", mealPlanTemplateId)
                );
        offer.setMealPlanTemplate(template);
        return offerRepository.save(offer);
    }

    @Transactional
    public Offer update(Long id, Offer updatedOffer) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer", "id", id));

        offerMapper.updateFromEntity(updatedOffer, offer);
        return offerRepository.save(offer);
    }

    @Transactional
    public Offer update(Long id, Offer updatedOffer, Long mealPlanTemplateId) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer", "id", id));

        offerMapper.updateFromEntity(updatedOffer, offer);
        MealPlanTemplate template = templateRepository.findById(mealPlanTemplateId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "MealPlanTemplate", "id", mealPlanTemplateId)
                );
        offer.setMealPlanTemplate(template);

        return offerRepository.save(offer);
    }

    @Transactional
    public void deleteById(Long id) {
        if (!offerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Offer", "id", id);
        }
        offerRepository.deleteById(id);
    }
}
