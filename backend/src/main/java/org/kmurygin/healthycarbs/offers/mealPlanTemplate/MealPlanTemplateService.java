package org.kmurygin.healthycarbs.offers.mealPlanTemplate;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.email.EmailDetails;
import org.kmurygin.healthycarbs.email.EmailService;
import org.kmurygin.healthycarbs.exception.BadRequestException;
import org.kmurygin.healthycarbs.exception.ForbiddenException;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.model.MealPlan;
import org.kmurygin.healthycarbs.mealplan.service.MealPlanService;
import org.kmurygin.healthycarbs.offers.offer.Offer;
import org.kmurygin.healthycarbs.offers.offer.OfferService;
import org.kmurygin.healthycarbs.payments.model.Order;
import org.kmurygin.healthycarbs.user.model.Role;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.util.List;


@RequiredArgsConstructor
@Service
public class MealPlanTemplateService {
    private final MealPlanTemplateRepository mealPlanTemplateRepository;
    private final MealPlanService mealPlanService;
    private final OfferService offerService;
    private final UserService userService;
    private final EmailService emailService;
    private final SpringTemplateEngine templateEngine;

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
            throw new ForbiddenException("You are not authorized to update this MealPlanTemplate.");
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
            throw new ForbiddenException("You are not authorized to delete this MealPlanTemplate.");
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

    @Transactional
    public void shareMealPlanWithClient(Long templateId, Long clientId) {
        MealPlanTemplate template = findById(templateId);
        User currentUser = userService.getCurrentUser();

        if (!template.getAuthor().getId().equals(currentUser.getId()) &&
                currentUser.getRole() != Role.ADMIN
        ) {
            throw new ForbiddenException("You are not authorized to share this MealPlanTemplate.");
        }

        User client = userService.getUserById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", clientId));

        MealPlan mealPlan = MealPlanTemplateUtil.createMealPlanFromTemplate(template, client, currentUser);
        mealPlanService.savePlanAndGenerateShoppingList(mealPlan);

        Context context = new Context();
        context.setVariable("clientName", client.getFirstName());
        context.setVariable("templateName", template.getName());
        String htmlContent = templateEngine.process("meal-plan-shared", context);

        emailService.sendMail(new EmailDetails(
                client.getEmail(), htmlContent, "A new meal plan has been shared with you"
        ));
    }
}
