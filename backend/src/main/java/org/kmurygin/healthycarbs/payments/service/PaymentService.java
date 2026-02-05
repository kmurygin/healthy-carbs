package org.kmurygin.healthycarbs.payments.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kmurygin.healthycarbs.dietitian.collaboration.CollaborationService;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.offers.mealPlanTemplate.MealPlanTemplateService;
import org.kmurygin.healthycarbs.offers.mealPlanTemplate.MealPlanTemplateUtil;
import org.kmurygin.healthycarbs.offers.offer.Offer;
import org.kmurygin.healthycarbs.offers.offer.OfferService;
import org.kmurygin.healthycarbs.payments.PaymentCompletedEvent;
import org.kmurygin.healthycarbs.payments.dto.PaymentStatus;
import org.kmurygin.healthycarbs.payments.dto.PaymentStatusResponse;
import org.kmurygin.healthycarbs.payments.model.Order;
import org.kmurygin.healthycarbs.payments.model.Payment;
import org.kmurygin.healthycarbs.payments.repository.OrderRepository;
import org.kmurygin.healthycarbs.payments.repository.PaymentRepository;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.service.UserService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Slf4j
@RequiredArgsConstructor
@Service
public class PaymentService {

    private static final String COLLABORATION_ORDER_PREFIX = "healthy-carbs-collab-";

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final MealPlanTemplateService mealPlanTemplateService;
    private final CollaborationService collaborationService;
    private final UserService userService;
    private final ApplicationEventPublisher eventPublisher;
    private final OfferService offerService;

    @Transactional
    public void updatePaymentStatus(String localOrderId, PaymentStatus newStatus) {
        Payment payment = paymentRepository.findByLocalOrderId(localOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "localOrderId", localOrderId));

        PaymentStatus oldStatus = payment.getStatus();

        if (oldStatus != PaymentStatus.COMPLETED && newStatus == PaymentStatus.COMPLETED) {
            Order order = orderRepository.findByLocalOrderId(localOrderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Order", "localOrderId", localOrderId));

            if (isCollaborationOrder(localOrderId)) {
                Long dietitianId = parseCollaborationDietitianId(localOrderId);
                collaborationService.establishCollaboration(dietitianId, order.getUser().getId());
            } else {
                mealPlanTemplateService.activateMealPlanForOrder(order);
                publishPaymentCompletedEvent(order);
            }
        }

        payment.setStatus(newStatus);
        paymentRepository.save(payment);
    }

    public void attachOrder(String localOrderId, Order order) {
        if (localOrderId == null || localOrderId.isBlank() || order == null) return;
        paymentRepository.findByLocalOrderId(localOrderId)
                .map(existing -> {
                    existing.setOrder(order);
                    return paymentRepository.save(existing);
                })
                .orElseGet(() -> paymentRepository.save(
                        Payment.builder()
                                .user(userService.getCurrentUser())
                                .localOrderId(localOrderId)
                                .status(PaymentStatus.PENDING)
                                .order(order)
                                .build()
                ));
    }

    public PaymentStatusResponse getStatus(String localOrderId) {
        return paymentRepository.findByLocalOrderId(localOrderId)
                .map(payment -> new PaymentStatusResponse(localOrderId, payment.getStatus()))
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "localOrderId", localOrderId));
    }

    private boolean isCollaborationOrder(String localOrderId) {
        try {
            String decoded = new String(Base64.getDecoder().decode(localOrderId), StandardCharsets.UTF_8);
            return decoded.startsWith(COLLABORATION_ORDER_PREFIX);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private Long parseCollaborationDietitianId(String localOrderId) {
        String decoded = new String(Base64.getDecoder().decode(localOrderId), StandardCharsets.UTF_8);
        String[] parts = decoded.split("-");
        return Long.parseLong(parts[3]);
    }

    private void publishPaymentCompletedEvent(Order order) {
        try {
            Long offerId = MealPlanTemplateUtil.decodeLocalOrderId(order.getLocalOrderId());
            Offer offer = offerService.findById(offerId);

            if (offer.getMealPlanTemplate() != null && offer.getMealPlanTemplate().getAuthor() != null) {
                User dietitian = offer.getMealPlanTemplate().getAuthor();
                User client = order.getUser();

                eventPublisher.publishEvent(new PaymentCompletedEvent(
                        order.getLocalOrderId(),
                        offerId,
                        dietitian.getEmail(),
                        dietitian.getFirstName() + " " + dietitian.getLastName(),
                        client.getFirstName() + " " + client.getLastName(),
                        client.getEmail()
                ));
            }
        } catch (Exception e) {
            log.warn("Failed to publish payment completed event for order {}: {}", order.getLocalOrderId(), e.getMessage());
        }
    }
}
