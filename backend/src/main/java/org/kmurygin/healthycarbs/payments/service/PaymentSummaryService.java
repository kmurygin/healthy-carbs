package org.kmurygin.healthycarbs.payments.service;

import lombok.AllArgsConstructor;
import org.kmurygin.healthycarbs.payments.dto.PaymentSummaryDTO;
import org.kmurygin.healthycarbs.payments.mapper.PaymentSummaryMapper;
import org.kmurygin.healthycarbs.payments.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
public class PaymentSummaryService {
    private final PaymentRepository paymentRepository;
    private final PaymentSummaryMapper paymentSummaryMapper;

    public List<PaymentSummaryDTO> getPaymentSummariesByUserId(Long userId) {
        return paymentSummaryMapper.toListDTO(paymentRepository.findByUserId(userId));
    }
}
