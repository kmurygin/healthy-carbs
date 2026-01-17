package org.kmurygin.healthycarbs.payments.service;

import lombok.AllArgsConstructor;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.offers.mealPlanTemplate.MealPlanTemplateService;
import org.kmurygin.healthycarbs.payments.dto.PaymentStatus;
import org.kmurygin.healthycarbs.payments.dto.PaymentStatusResponse;
import org.kmurygin.healthycarbs.payments.model.Order;
import org.kmurygin.healthycarbs.payments.model.Payment;
import org.kmurygin.healthycarbs.payments.repository.OrderRepository;
import org.kmurygin.healthycarbs.payments.repository.PaymentRepository;
import org.kmurygin.healthycarbs.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@AllArgsConstructor
@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final MealPlanTemplateService mealPlanTemplateService;
    private final UserService userService;

    @Transactional
    public void updatePaymentStatus(String localOrderId, PaymentStatus newStatus) {
        Payment payment = paymentRepository.findByLocalOrderId(localOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "localOrderId", localOrderId));

        PaymentStatus oldStatus = payment.getStatus();

        if (oldStatus != PaymentStatus.COMPLETED && newStatus == PaymentStatus.COMPLETED) {
            Order order = orderRepository.findByLocalOrderId(localOrderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Order", "localOrderId", localOrderId));
            mealPlanTemplateService.activateMealPlanForOrder(order);
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
}
