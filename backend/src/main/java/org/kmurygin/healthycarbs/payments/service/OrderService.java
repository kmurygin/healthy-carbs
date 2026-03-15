package org.kmurygin.healthycarbs.payments.service;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.exception.BadRequestException;
import org.kmurygin.healthycarbs.exception.ForbiddenException;
import org.kmurygin.healthycarbs.offers.mealPlanTemplate.MealPlanTemplateUtil;
import org.kmurygin.healthycarbs.offers.offer.Offer;
import org.kmurygin.healthycarbs.offers.offer.OfferService;
import org.kmurygin.healthycarbs.payments.config.PayuProperties;
import org.kmurygin.healthycarbs.payments.dto.InitPaymentRequest;
import org.kmurygin.healthycarbs.payments.dto.OrderResponse;
import org.kmurygin.healthycarbs.payments.dto.PaymentStatus;
import org.kmurygin.healthycarbs.payments.model.Order;
import org.kmurygin.healthycarbs.payments.repository.OrderRepository;
import org.kmurygin.healthycarbs.user.model.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class OrderService {

    private static final int COLLABORATION_PRICE = 5000;

    private final OrderRepository orderRepository;
    private final PayuProperties payuProperties;
    private final OfferService offerService;

    @Transactional
    public Order processPaymentRequest(InitPaymentRequest init, User user) {
        validatePaymentAmount(init);
        String localOrderId = init.localOrderId();
        return orderRepository.findByLocalOrderId(localOrderId)
                .map(existing -> {
                    existing.setDescription(init.description());
                    existing.setTotalAmount(init.totalAmount());
                    existing.setCurrency(payuProperties.currency());
                    return orderRepository.save(existing);
                })
                .orElseGet(() -> orderRepository.save(
                        Order.builder()
                                .user(user)
                                .localOrderId(localOrderId)
                                .description(init.description())
                                .totalAmount(init.totalAmount())
                                .currency(payuProperties.currency())
                                .build()
                ));
    }

    public OrderResponse getByLocalOrderId(String localOrderId, PaymentStatus paymentStatus, User currentUser) {
        Order order = orderRepository.findByLocalOrderId(localOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + localOrderId));

        if (!order.getUser().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You are not authorized to view this order.");
        }

        return new OrderResponse(
                order.getLocalOrderId(),
                order.getDescription(),
                order.getTotalAmount(),
                order.getCurrency(),
                order.getCreatedAt(),
                paymentStatus
        );
    }

    private void validatePaymentAmount(InitPaymentRequest init) {
        String localOrderId = init.localOrderId();
        int clientAmount = init.totalAmount();

        if (CollaborationOrderUtil.isCollaborationOrder(localOrderId)) {
            if (clientAmount != COLLABORATION_PRICE) {
                throw new BadRequestException("Invalid payment amount for collaboration order.");
            }
        } else {
            Long offerId = MealPlanTemplateUtil.decodeLocalOrderId(localOrderId);
            Offer offer = offerService.findById(offerId);
            int expectedAmount = offer.getPrice() * 100;
            if (clientAmount != expectedAmount) {
                throw new BadRequestException("Invalid payment amount. Expected: " + expectedAmount);
            }
        }
    }
}

