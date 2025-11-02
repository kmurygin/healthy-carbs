package org.kmurygin.healthycarbs.payments.service;

import lombok.AllArgsConstructor;
import org.kmurygin.healthycarbs.payments.config.PayuProperties;
import org.kmurygin.healthycarbs.payments.dto.InitPaymentRequest;
import org.kmurygin.healthycarbs.payments.dto.OrderResponse;
import org.kmurygin.healthycarbs.payments.model.Order;
import org.kmurygin.healthycarbs.payments.repository.PaymentOrderRepository;
import org.springframework.stereotype.Service;

@AllArgsConstructor
@Service
public class OrderService {

    private final PaymentOrderRepository orderRepository;
    private final PayuProperties props;

    public Order upsertFromInit(InitPaymentRequest init) {
        String localOrderId = init.localOrderId();
        return orderRepository.findByLocalOrderId(localOrderId)
                .map(existing -> {
                    existing.setDescription(init.description());
                    existing.setTotalAmount(init.totalAmount());
                    existing.setCurrency(props.currency());
                    return orderRepository.save(existing);
                })
                .orElseGet(() -> orderRepository.save(
                        Order.builder()
                                .localOrderId(localOrderId)
                                .description(init.description())
                                .totalAmount(init.totalAmount())
                                .currency(props.currency())
                                .build()
                ));
    }

    public OrderResponse getByLocalOrderId(String localOrderId, String paymentStatus) {
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

