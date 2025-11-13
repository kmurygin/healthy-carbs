package org.kmurygin.healthycarbs.offers;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.exception.BadRequestException;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.model.MealPlan;
import org.kmurygin.healthycarbs.mealplan.service.MealPlanService;
import org.kmurygin.healthycarbs.payments.model.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@RequiredArgsConstructor
@Service
public class MealPlanTemplateService {
    private final MealPlanTemplateRepository mealPlanTemplateRepository;
    private final MealPlanService mealPlanService;
    private final OfferService offerService;

    @Transactional(readOnly = true)
    public List<MealPlanTemplate> findAll() {
        return mealPlanTemplateRepository.findAll();
    }

    @Transactional(readOnly = true)
    public MealPlanTemplate findById(Long id) {
        return mealPlanTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MealPlanTemplate", "id", id));
    }

    @Transactional
    public MealPlanTemplate create(MealPlanTemplate entity) {
        return mealPlanTemplateRepository.save(entity);
    }

    @Transactional
    public MealPlanTemplate update(Long id, MealPlanTemplate entity) {
        MealPlanTemplate mealPlanTemplate = findById(id);

        MealPlanTemplate updatedMealPlanTemplate = mealPlanTemplate.toBuilder()
                .name(entity.getName())
                .description(entity.getDescription())
                .totalCalories(entity.getTotalCalories())
                .totalCarbs(entity.getTotalCarbs())
                .totalProtein(entity.getTotalProtein())
                .totalFat(entity.getTotalFat())
                .days(entity.getDays())
                .build();

        return mealPlanTemplateRepository.save(updatedMealPlanTemplate);
    }

    @Transactional
    public void deleteById(Long id) {
        if (!mealPlanTemplateRepository.existsById(id)) {
            throw new ResourceNotFoundException("MealPlanTemplate", "id", id);
        }
        mealPlanTemplateRepository.deleteById(id);
    }

    @Transactional
    public void activateMealPlanForOrder(Order order) {
        MealPlanTemplateUtil.validateOrder(order);

        Long offerId = MealPlanTemplateUtil.decodeLocalOrderId(order.getLocalOrderId());
        Offer offer = offerService.findById(offerId);

        MealPlanTemplate template = offer.getMealPlanTemplate();
        if (template == null) {
            throw new BadRequestException("Offer %d has no MealPlanTemplate.".formatted(offerId));
        }

        MealPlan mealPlan = MealPlanTemplateUtil.createMealPlanFromTemplate(template, order);
        mealPlanService.savePlanAndGenerateShoppingList(mealPlan);
    }
}
