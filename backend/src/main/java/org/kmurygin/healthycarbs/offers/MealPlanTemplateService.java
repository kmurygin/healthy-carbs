package org.kmurygin.healthycarbs.offers;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.exception.BadRequestException;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.model.MealPlan;
import org.kmurygin.healthycarbs.mealplan.service.MealPlanService;
import org.kmurygin.healthycarbs.payments.model.Order;
import org.kmurygin.healthycarbs.user.Role;
import org.kmurygin.healthycarbs.user.User;
import org.kmurygin.healthycarbs.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@RequiredArgsConstructor
@Service
public class MealPlanTemplateService {
    private final MealPlanTemplateRepository mealPlanTemplateRepository;
    private final MealPlanService mealPlanService;
    private final OfferService offerService;
    private final UserService userService;

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
        entity.setAuthor(userService.getCurrentUser());
        return mealPlanTemplateRepository.save(entity);
    }

    @Transactional
    public MealPlanTemplate update(Long id, MealPlanTemplate entity) {
        MealPlanTemplate mealPlanTemplate = findById(id);
        User currentUser = userService.getCurrentUser();

        if (!mealPlanTemplate.getAuthor().getId().equals(currentUser.getId()) &&
                currentUser.getRole() != Role.ADMIN
        ) {
            throw new SecurityException("You are not authorized to update this MealPlanTemplate.");
        }

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
        MealPlanTemplate mealPlanTemplate = mealPlanTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MealPlanTemplate", "id", id));
        User currentUser = userService.getCurrentUser();

        if (!mealPlanTemplate.getAuthor().getId().equals(currentUser.getId()) &&
                currentUser.getRole() != Role.ADMIN
        ) {
            throw new SecurityException("You are not authorized to delete this MealPlanTemplate.");
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
