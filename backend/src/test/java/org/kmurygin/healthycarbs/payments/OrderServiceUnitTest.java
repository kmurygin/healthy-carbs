package org.kmurygin.healthycarbs.payments;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kmurygin.healthycarbs.offers.offer.Offer;
import org.kmurygin.healthycarbs.offers.offer.OfferService;
import org.kmurygin.healthycarbs.payments.config.PayuProperties;
import org.kmurygin.healthycarbs.payments.dto.InitPaymentRequest;
import org.kmurygin.healthycarbs.payments.dto.OrderResponse;
import org.kmurygin.healthycarbs.payments.dto.PaymentStatus;
import org.kmurygin.healthycarbs.payments.model.Order;
import org.kmurygin.healthycarbs.payments.repository.OrderRepository;
import org.kmurygin.healthycarbs.payments.service.OrderService;
import org.kmurygin.healthycarbs.user.UserTestUtils;
import org.kmurygin.healthycarbs.user.model.User;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("OrderService Unit Tests")
class OrderServiceUnitTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OfferService offerService;

    private OrderService orderService;
    private PayuProperties payuProperties;
    private User testUser;

    @BeforeEach
    void setUp() {
        payuProperties = new PayuProperties(
                "http://localhost", "123", "123", "secret", "key",
                "http://localhost", "http://localhost", "PLN"
        );
        orderService = new OrderService(orderRepository, payuProperties, offerService);
        testUser = UserTestUtils.createTestUser(1L, "testuser");
    }

    @Nested
    @DisplayName("processPaymentRequest")
    class ProcessPaymentRequestTests {

        private String encodeLocalOrderId(long offerId) {
            return Base64.getEncoder().encodeToString(
                    ("healthy-carbs-" + offerId + "-" + System.currentTimeMillis()).getBytes(StandardCharsets.UTF_8));
        }

        @Test
        @DisplayName("processPaymentRequest_whenOrderExists_shouldUpdateExisting")
        void processPaymentRequest_whenOrderExists_shouldUpdateExisting() {
            String localOrderId = encodeLocalOrderId(1L);

            Order existingOrder = Order.builder()
                    .id(1L)
                    .localOrderId(localOrderId)
                    .description("Old description")
                    .totalAmount(5000)
                    .currency("PLN")
                    .user(testUser)
                    .build();

            Offer offer = new Offer();
            offer.setId(1L);
            offer.setPrice(99);

            InitPaymentRequest request = new InitPaymentRequest(
                    localOrderId, "New description", 9900, 1L, List.of()
            );

            when(offerService.findById(1L)).thenReturn(offer);
            when(orderRepository.findByLocalOrderId(localOrderId)).thenReturn(Optional.of(existingOrder));
            when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

            Order result = orderService.processPaymentRequest(request, testUser);

            assertThat(result.getDescription()).isEqualTo("New description");
            assertThat(result.getTotalAmount()).isEqualTo(9900);
            assertThat(result.getCurrency()).isEqualTo("PLN");
            verify(orderRepository).save(existingOrder);
        }

        @Test
        @DisplayName("processPaymentRequest_whenOrderNotExists_shouldCreateNew")
        void processPaymentRequest_whenOrderNotExists_shouldCreateNew() {
            String localOrderId = encodeLocalOrderId(2L);

            Offer offer = new Offer();
            offer.setId(2L);
            offer.setPrice(50);

            InitPaymentRequest request = new InitPaymentRequest(
                    localOrderId, "Test order", 5000, 2L, List.of()
            );

            when(offerService.findById(2L)).thenReturn(offer);
            when(orderRepository.findByLocalOrderId(localOrderId)).thenReturn(Optional.empty());
            when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
                Order saved = inv.getArgument(0);
                saved.setId(2L);
                return saved;
            });

            Order result = orderService.processPaymentRequest(request, testUser);

            verify(orderRepository).save(argThat(order -> {
                assertThat(order.getLocalOrderId()).isEqualTo(localOrderId);
                assertThat(order.getDescription()).isEqualTo("Test order");
                assertThat(order.getTotalAmount()).isEqualTo(5000);
                assertThat(order.getUser()).isEqualTo(testUser);
                return true;
            }));
        }
    }

    @Nested
    @DisplayName("getByLocalOrderId")
    class GetByLocalOrderIdTests {

        @Test
        @DisplayName("getByLocalOrderId_whenExists_shouldReturnOrderResponse")
        void getByLocalOrderId_whenExists_shouldReturnOrderResponse() {
            OffsetDateTime now = OffsetDateTime.now();
            Order order = Order.builder()
                    .id(1L)
                    .localOrderId("ORDER-123")
                    .description("Test")
                    .totalAmount(9900)
                    .currency("PLN")
                    .createdAt(now)
                    .user(testUser)
                    .build();

            when(orderRepository.findByLocalOrderId("ORDER-123")).thenReturn(Optional.of(order));

            OrderResponse result = orderService.getByLocalOrderId("ORDER-123", PaymentStatus.COMPLETED, testUser);

            assertThat(result.localOrderId()).isEqualTo("ORDER-123");
            assertThat(result.description()).isEqualTo("Test");
            assertThat(result.totalAmount()).isEqualTo(9900);
            assertThat(result.currency()).isEqualTo("PLN");
            assertThat(result.paymentStatus()).isEqualTo(PaymentStatus.COMPLETED);
        }

        @Test
        @DisplayName("getByLocalOrderId_whenNotExists_shouldThrowException")
        void getByLocalOrderId_whenNotExists_shouldThrowException() {
            when(orderRepository.findByLocalOrderId("INVALID")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> orderService.getByLocalOrderId("INVALID", PaymentStatus.PENDING, testUser))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Order not found");
        }
    }
}
