package org.kmurygin.healthycarbs.payments.service;

import lombok.AllArgsConstructor;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.payments.dto.PaymentStatusResponse;
import org.kmurygin.healthycarbs.payments.model.Order;
import org.kmurygin.healthycarbs.payments.model.Payment;
import org.kmurygin.healthycarbs.payments.repository.PaymentRepository;
import org.springframework.stereotype.Service;

@AllArgsConstructor
@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public void setStatus(String localOrderId, String status) {
        if (localOrderId == null || localOrderId.isBlank()) return;
        String newStatus = (status == null || status.isBlank()) ? "PENDING" : status;
        paymentRepository.findByLocalOrderId(localOrderId)
                .map(existing -> {
                    existing.setStatus(newStatus);
                    return paymentRepository.save(existing);
                })
                .orElseGet(() -> paymentRepository.save(
                        Payment.builder()
                                .localOrderId(localOrderId)
                                .status(newStatus)
                                .build()
                ));
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
                                .localOrderId(localOrderId)
                                .status("PENDING")
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
