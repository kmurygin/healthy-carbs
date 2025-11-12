package org.kmurygin.healthycarbs.payments.service;

import lombok.AllArgsConstructor;
import org.kmurygin.healthycarbs.payments.config.PayuProperties;
import org.kmurygin.healthycarbs.payments.dto.InitPaymentRequest;
import org.kmurygin.healthycarbs.payments.dto.OrderResponse;
import org.kmurygin.healthycarbs.payments.dto.PaymentStatus;
import org.kmurygin.healthycarbs.payments.model.Order;
import org.kmurygin.healthycarbs.payments.repository.OrderRepository;
import org.kmurygin.healthycarbs.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@AllArgsConstructor
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final PayuProperties payuProperties;

    @Transactional
    public Order processPaymentRequest(InitPaymentRequest init, User user) {
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

    public OrderResponse getByLocalOrderId(String localOrderId, PaymentStatus paymentStatus) {
        Order order = orderRepository.findByLocalOrderId(localOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + localOrderId));
        return new OrderResponse(
                order.getLocalOrderId(),
                order.getDescription(),
                order.getTotalAmount(),
                order.getCurrency(),
                order.getCreatedAt(),
                paymentStatus
        );
    }
}

