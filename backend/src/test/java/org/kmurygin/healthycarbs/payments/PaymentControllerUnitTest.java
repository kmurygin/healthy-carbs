package org.kmurygin.healthycarbs.payments;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kmurygin.healthycarbs.payments.controller.PaymentController;
import org.kmurygin.healthycarbs.payments.dto.PaymentSummaryDTO;
import org.kmurygin.healthycarbs.payments.service.PaymentSummaryService;
import org.kmurygin.healthycarbs.user.UserTestUtils;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.service.UserService;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.OffsetDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentController Unit Tests")
class PaymentControllerUnitTest {

    @Mock
    private PaymentSummaryService paymentSummaryService;

    @Mock
    private UserService userService;

    private PaymentController paymentController;

    private User testUser;

    @BeforeEach
    void setUp() {
        paymentController = new PaymentController(paymentSummaryService, userService);
        testUser = UserTestUtils.createTestUser(1L, "testuser");
    }

    @Test
    @DisplayName("getPaymentSummaries_shouldReturnUserPayments")
    void getPaymentSummaries_shouldReturnUserPayments() {
        List<PaymentSummaryDTO> summaries = List.of(
                new PaymentSummaryDTO(1L, "PayU", "Plan A", "ORD-1", 9900, "PLN", "COMPLETED", OffsetDateTime.now())
        );

        when(userService.getCurrentUser()).thenReturn(testUser);
        when(paymentSummaryService.getPaymentSummariesByUserId(1L)).thenReturn(summaries);

        ResponseEntity<ApiResponse<List<PaymentSummaryDTO>>> response = paymentController.getPaymentSummariesByUserId();

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData()).hasSize(1);
        verify(paymentSummaryService).getPaymentSummariesByUserId(1L);
    }

    @Test
    @DisplayName("getPaymentSummaries_whenEmpty_shouldReturnEmptyList")
    void getPaymentSummaries_whenEmpty_shouldReturnEmptyList() {
        when(userService.getCurrentUser()).thenReturn(testUser);
        when(paymentSummaryService.getPaymentSummariesByUserId(1L)).thenReturn(List.of());

        ResponseEntity<ApiResponse<List<PaymentSummaryDTO>>> response = paymentController.getPaymentSummariesByUserId();

        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData()).isEmpty();
    }
}
