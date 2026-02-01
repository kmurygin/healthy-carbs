package org.kmurygin.healthycarbs.payments;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.offers.mealPlanTemplate.MealPlanTemplateService;
import org.kmurygin.healthycarbs.payments.dto.PaymentStatus;
import org.kmurygin.healthycarbs.payments.dto.PaymentStatusResponse;
import org.kmurygin.healthycarbs.payments.model.Order;
import org.kmurygin.healthycarbs.payments.model.Payment;
import org.kmurygin.healthycarbs.payments.repository.OrderRepository;
import org.kmurygin.healthycarbs.payments.repository.PaymentRepository;
import org.kmurygin.healthycarbs.payments.service.PaymentService;
import org.kmurygin.healthycarbs.user.UserTestUtils;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.service.UserService;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentService Unit Tests")
class PaymentServiceUnitTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private MealPlanTemplateService mealPlanTemplateService;

    @Mock
    private UserService userService;

    private PaymentService paymentService;

    private User testUser;
    private Payment testPayment;
    private Order testOrder;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(
                paymentRepository,
                orderRepository,
                mealPlanTemplateService,
                userService
        );

        testUser = UserTestUtils.createTestUser(1L, "testuser");

        testOrder = Order.builder()
                .id(1L)
                .localOrderId("ORDER-12345")
                .description("Test Order")
                .totalAmount(9900)
                .currency("PLN")
                .user(testUser)
                .build();

        testPayment = Payment.builder()
                .id(1L)
                .localOrderId("ORDER-12345")
                .status(PaymentStatus.PENDING)
                .order(testOrder)
                .user(testUser)
                .build();
    }

    @Nested
    @DisplayName("updatePaymentStatus")
    class UpdatePaymentStatusTests {

        @Test
        @DisplayName("updatePaymentStatus_fromPendingToCompleted_shouldActivateMealPlan")
        void updatePaymentStatus_fromPendingToCompleted_shouldActivateMealPlan() {
            when(paymentRepository.findByLocalOrderId("ORDER-12345")).thenReturn(Optional.of(testPayment));
            when(orderRepository.findByLocalOrderId("ORDER-12345")).thenReturn(Optional.of(testOrder));
            when(paymentRepository.save(any(Payment.class))).thenReturn(testPayment);

            paymentService.updatePaymentStatus("ORDER-12345", PaymentStatus.COMPLETED);

            assertThat(testPayment.getStatus()).isEqualTo(PaymentStatus.COMPLETED);
            verify(mealPlanTemplateService).activateMealPlanForOrder(testOrder);
            verify(paymentRepository).save(testPayment);
        }

        @Test
        @DisplayName("updatePaymentStatus_fromPendingToFailed_shouldNotActivateMealPlan")
        void updatePaymentStatus_fromPendingToFailed_shouldNotActivateMealPlan() {
            when(paymentRepository.findByLocalOrderId("ORDER-12345")).thenReturn(Optional.of(testPayment));
            when(paymentRepository.save(any(Payment.class))).thenReturn(testPayment);

            paymentService.updatePaymentStatus("ORDER-12345", PaymentStatus.FAILED);

            assertThat(testPayment.getStatus()).isEqualTo(PaymentStatus.FAILED);
            verify(mealPlanTemplateService, never()).activateMealPlanForOrder(any());
        }

        @Test
        @DisplayName("updatePaymentStatus_fromCompletedToCompleted_shouldNotActivateMealPlanAgain")
        void updatePaymentStatus_fromCompletedToCompleted_shouldNotActivateMealPlanAgain() {
            testPayment.setStatus(PaymentStatus.COMPLETED);

            when(paymentRepository.findByLocalOrderId("ORDER-12345")).thenReturn(Optional.of(testPayment));
            when(paymentRepository.save(any(Payment.class))).thenReturn(testPayment);

            paymentService.updatePaymentStatus("ORDER-12345", PaymentStatus.COMPLETED);

            verify(mealPlanTemplateService, never()).activateMealPlanForOrder(any());
        }

        @Test
        @DisplayName("updatePaymentStatus_whenPaymentNotFound_shouldThrowResourceNotFoundException")
        void updatePaymentStatus_whenPaymentNotFound_shouldThrowResourceNotFoundException() {
            when(paymentRepository.findByLocalOrderId("INVALID-ORDER")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> paymentService.updatePaymentStatus("INVALID-ORDER", PaymentStatus.COMPLETED))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Payment");
        }

        @Test
        @DisplayName("updatePaymentStatus_whenOrderNotFound_shouldThrowResourceNotFoundException")
        void updatePaymentStatus_whenOrderNotFound_shouldThrowResourceNotFoundException() {
            when(paymentRepository.findByLocalOrderId("ORDER-12345")).thenReturn(Optional.of(testPayment));
            when(orderRepository.findByLocalOrderId("ORDER-12345")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> paymentService.updatePaymentStatus("ORDER-12345", PaymentStatus.COMPLETED))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Order");
        }
    }

    @Nested
    @DisplayName("attachOrder")
    class AttachOrderTests {

        @Test
        @DisplayName("attachOrder_whenPaymentExists_shouldAttachOrder")
        void attachOrder_whenPaymentExists_shouldAttachOrder() {
            Payment paymentWithoutOrder = Payment.builder()
                    .id(2L)
                    .localOrderId("ORDER-67890")
                    .status(PaymentStatus.PENDING)
                    .user(testUser)
                    .build();

            when(paymentRepository.findByLocalOrderId("ORDER-67890")).thenReturn(Optional.of(paymentWithoutOrder));
            when(paymentRepository.save(any(Payment.class))).thenReturn(paymentWithoutOrder);

            paymentService.attachOrder("ORDER-67890", testOrder);

            assertThat(paymentWithoutOrder.getOrder()).isEqualTo(testOrder);
            verify(paymentRepository).save(paymentWithoutOrder);
        }

        @Test
        @DisplayName("attachOrder_whenPaymentNotExists_shouldCreateNewPayment")
        void attachOrder_whenPaymentNotExists_shouldCreateNewPayment() {
            when(paymentRepository.findByLocalOrderId("NEW-ORDER")).thenReturn(Optional.empty());
            when(userService.getCurrentUser()).thenReturn(testUser);
            when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
                Payment saved = invocation.getArgument(0);
                saved.setId(3L);
                return saved;
            });

            paymentService.attachOrder("NEW-ORDER", testOrder);

            verify(paymentRepository).save(argThat(payment -> {
                assertThat(payment.getLocalOrderId()).isEqualTo("NEW-ORDER");
                assertThat(payment.getOrder()).isEqualTo(testOrder);
                assertThat(payment.getStatus()).isEqualTo(PaymentStatus.PENDING);
                assertThat(payment.getUser()).isEqualTo(testUser);
                return true;
            }));
        }

        @Test
        @DisplayName("attachOrder_whenLocalOrderIdIsNull_shouldDoNothing")
        void attachOrder_whenLocalOrderIdIsNull_shouldDoNothing() {
            paymentService.attachOrder(null, testOrder);

            verify(paymentRepository, never()).findByLocalOrderId(any());
            verify(paymentRepository, never()).save(any());
        }

        @Test
        @DisplayName("attachOrder_whenLocalOrderIdIsBlank_shouldDoNothing")
        void attachOrder_whenLocalOrderIdIsBlank_shouldDoNothing() {
            paymentService.attachOrder("   ", testOrder);

            verify(paymentRepository, never()).findByLocalOrderId(any());
            verify(paymentRepository, never()).save(any());
        }

        @Test
        @DisplayName("attachOrder_whenOrderIsNull_shouldDoNothing")
        void attachOrder_whenOrderIsNull_shouldDoNothing() {
            paymentService.attachOrder("ORDER-12345", null);

            verify(paymentRepository, never()).findByLocalOrderId(any());
            verify(paymentRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("getStatus")
    class GetStatusTests {

        @Test
        @DisplayName("getStatus_whenPaymentExists_shouldReturnStatusResponse")
        void getStatus_whenPaymentExists_shouldReturnStatusResponse() {
            when(paymentRepository.findByLocalOrderId("ORDER-12345")).thenReturn(Optional.of(testPayment));

            PaymentStatusResponse result = paymentService.getStatus("ORDER-12345");

            assertThat(result.localOrderId()).isEqualTo("ORDER-12345");
            assertThat(result.status()).isEqualTo(PaymentStatus.PENDING);
        }

        @Test
        @DisplayName("getStatus_whenPaymentNotExists_shouldThrowResourceNotFoundException")
        void getStatus_whenPaymentNotExists_shouldThrowResourceNotFoundException() {
            when(paymentRepository.findByLocalOrderId("INVALID")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> paymentService.getStatus("INVALID"))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Payment");
        }
    }
}
