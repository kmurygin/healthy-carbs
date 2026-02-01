package org.kmurygin.healthycarbs.payments;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kmurygin.healthycarbs.payments.dto.PaymentSummaryDTO;
import org.kmurygin.healthycarbs.payments.mapper.PaymentSummaryMapper;
import org.kmurygin.healthycarbs.payments.model.Payment;
import org.kmurygin.healthycarbs.payments.repository.PaymentRepository;
import org.kmurygin.healthycarbs.payments.service.PaymentSummaryService;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentSummaryService Unit Tests")
class PaymentSummaryServiceUnitTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private PaymentSummaryMapper paymentSummaryMapper;

    private PaymentSummaryService paymentSummaryService;

    @BeforeEach
    void setUp() {
        paymentSummaryService = new PaymentSummaryService(paymentRepository, paymentSummaryMapper);
    }

    @Test
    @DisplayName("getPaymentSummariesByUserId_shouldReturnMappedDTOs")
    void getPaymentSummariesByUserId_shouldReturnMappedDTOs() {
        List<Payment> payments = List.of(new Payment(), new Payment());
        List<PaymentSummaryDTO> expectedDTOs = List.of(
                new PaymentSummaryDTO(1L, "PayU", "Plan A", "ORD-1", 9900, "PLN", "COMPLETED", OffsetDateTime.now()),
                new PaymentSummaryDTO(2L, "PayU", "Plan B", "ORD-2", 4900, "PLN", "PENDING", OffsetDateTime.now())
        );

        when(paymentRepository.findByUserId(1L)).thenReturn(payments);
        when(paymentSummaryMapper.toListDTO(payments)).thenReturn(expectedDTOs);

        List<PaymentSummaryDTO> result = paymentSummaryService.getPaymentSummariesByUserId(1L);

        assertThat(result).hasSize(2);
        assertThat(result).isEqualTo(expectedDTOs);
        verify(paymentRepository).findByUserId(1L);
        verify(paymentSummaryMapper).toListDTO(payments);
    }

    @Test
    @DisplayName("getPaymentSummariesByUserId_whenNoPayments_shouldReturnEmptyList")
    void getPaymentSummariesByUserId_whenNoPayments_shouldReturnEmptyList() {
        when(paymentRepository.findByUserId(99L)).thenReturn(List.of());
        when(paymentSummaryMapper.toListDTO(List.of())).thenReturn(List.of());

        List<PaymentSummaryDTO> result = paymentSummaryService.getPaymentSummariesByUserId(99L);

        assertThat(result).isEmpty();
    }
}
