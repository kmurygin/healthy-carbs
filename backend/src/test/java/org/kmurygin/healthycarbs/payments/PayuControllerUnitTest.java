package org.kmurygin.healthycarbs.payments;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kmurygin.healthycarbs.payments.config.PayuProperties;
import org.kmurygin.healthycarbs.payments.controller.PayuController;
import org.kmurygin.healthycarbs.payments.dto.*;
import org.kmurygin.healthycarbs.payments.model.Order;
import org.kmurygin.healthycarbs.payments.service.OrderService;
import org.kmurygin.healthycarbs.payments.service.PaymentService;
import org.kmurygin.healthycarbs.payments.service.PayuClient;
import org.kmurygin.healthycarbs.user.UserTestUtils;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.service.UserService;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;

import java.time.OffsetDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PayuController Unit Tests")
class PayuControllerUnitTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    @Mock
    private PaymentService paymentService;
    @Mock
    private OrderService orderService;
    @Mock
    private PayuClient payuClient;
    @Mock
    private UserService userService;
    @Mock
    private PayuProperties payuProperties;
    private PayuController payuController;
    private User testUser;

    @BeforeEach
    void setUp() {
        payuController = new PayuController(objectMapper, paymentService, orderService, payuClient, userService, payuProperties);
        testUser = UserTestUtils.createTestUser(1L, "testuser");
    }

    @Nested
    @DisplayName("create")
    class CreateTests {

        @Test
        @DisplayName("create_shouldProcessOrderAndReturnResponse")
        void create_shouldProcessOrderAndReturnResponse() {
            InitPaymentRequest request = new InitPaymentRequest(
                    "ORDER-123", "Test order", 9900, 1L,
                    List.of(new ProductDTO("Plan", "9900", "1"))
            );

            Order order = Order.builder()
                    .id(1L)
                    .localOrderId("ORDER-123")
                    .user(testUser)
                    .build();

            CreateOrderResponse payuResponse = new CreateOrderResponse("SUCCESS", "http://redirect", "PAYU-123");

            HttpServletRequest httpRequest = mock(HttpServletRequest.class);
            when(httpRequest.getRemoteAddr()).thenReturn("192.168.1.1");
            when(userService.getCurrentUser()).thenReturn(testUser);
            when(orderService.processPaymentRequest(request, testUser)).thenReturn(order);
            when(payuClient.createOrder(request, "192.168.1.1")).thenReturn(payuResponse);

            ResponseEntity<ApiResponse<InitPaymentResponse>> response = payuController.create(request, httpRequest);

            assertThat(response.getStatusCode().value()).isEqualTo(201);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getData().payuOrderId()).isEqualTo("PAYU-123");
            assertThat(response.getBody().getData().redirectUri()).isEqualTo("http://redirect");

            verify(paymentService).attachOrder("ORDER-123", order);
            verify(paymentService).updatePaymentStatus("ORDER-123", PaymentStatus.PENDING);
        }
    }

    @Nested
    @DisplayName("notify")
    class NotifyTests {

        @Test
        @DisplayName("notify_withValidOrderNode_shouldUpdatePaymentStatus")
        void notify_withValidOrderNode_shouldUpdatePaymentStatus() throws Exception {
            String body = objectMapper.writeValueAsString(
                    objectMapper.createObjectNode()
                            .set("order", objectMapper.createObjectNode()
                                    .put("extOrderId", "ORDER-123")
                                    .put("status", "COMPLETED")));

            String secondKey = "test-secret";
            when(payuProperties.secondKey()).thenReturn(secondKey);

            java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
            byte[] digest = md.digest((body + secondKey).getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            String signature = sb.toString();

            HttpHeaders headers = new HttpHeaders();
            headers.add("OpenPayu-Signature", "signature=" + signature + ";algorithm=MD5");

            ResponseEntity<ApiResponse<Void>> response = payuController.notify(headers, body);

            assertThat(response.getStatusCode().value()).isEqualTo(200);
            verify(paymentService).updatePaymentStatus("ORDER-123", PaymentStatus.COMPLETED);
        }

        @Test
        @DisplayName("notify_withNullOrderNode_shouldNotCallUpdateStatus")
        void notify_withNullOrderNode_shouldNotCallUpdateStatus() throws Exception {
            String body = objectMapper.writeValueAsString(
                    objectMapper.createObjectNode()
                            .put("someOtherField", "value"));

            String secondKey = "test-secret";
            when(payuProperties.secondKey()).thenReturn(secondKey);

            java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
            byte[] digest = md.digest((body + secondKey).getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            String signature = sb.toString();

            HttpHeaders headers = new HttpHeaders();
            headers.add("OpenPayu-Signature", "signature=" + signature + ";algorithm=MD5");

            ResponseEntity<ApiResponse<Void>> response = payuController.notify(headers, body);

            assertThat(response.getStatusCode().value()).isEqualTo(200);
            verify(paymentService, never()).updatePaymentStatus(any(), any());
        }

        @Test
        @DisplayName("notify_withNullExtOrderId_shouldNotCallUpdateStatus")
        void notify_withNullExtOrderId_shouldNotCallUpdateStatus() throws Exception {
            String body = objectMapper.writeValueAsString(
                    objectMapper.createObjectNode()
                            .set("order", objectMapper.createObjectNode()
                                    .put("status", "COMPLETED")));

            String secondKey = "test-secret";
            when(payuProperties.secondKey()).thenReturn(secondKey);

            java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
            byte[] digest = md.digest((body + secondKey).getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            String signature = sb.toString();

            HttpHeaders headers = new HttpHeaders();
            headers.add("OpenPayu-Signature", "signature=" + signature + ";algorithm=MD5");

            ResponseEntity<ApiResponse<Void>> response = payuController.notify(headers, body);

            assertThat(response.getStatusCode().value()).isEqualTo(200);
            verify(paymentService, never()).updatePaymentStatus(any(), any());
        }
    }

    @Nested
    @DisplayName("status")
    class StatusTests {

        @Test
        @DisplayName("status_shouldReturnPaymentStatus")
        void status_shouldReturnPaymentStatus() {
            PaymentStatusResponse statusResponse = new PaymentStatusResponse("ORDER-123", PaymentStatus.COMPLETED);
            when(paymentService.getStatus("ORDER-123")).thenReturn(statusResponse);

            ResponseEntity<ApiResponse<PaymentStatusResponse>> response = payuController.status("ORDER-123");

            assertThat(response.getStatusCode().value()).isEqualTo(200);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getData().status()).isEqualTo(PaymentStatus.COMPLETED);
        }
    }

    @Nested
    @DisplayName("order")
    class OrderTests {

        @Test
        @DisplayName("order_shouldReturnOrderResponse")
        void order_shouldReturnOrderResponse() {
            PaymentStatusResponse statusResponse = new PaymentStatusResponse("ORDER-123", PaymentStatus.COMPLETED);
            OrderResponse orderResponse = new OrderResponse(
                    "ORDER-123", "Test", 9900, "PLN", OffsetDateTime.now(), PaymentStatus.COMPLETED
            );

            when(paymentService.getStatus("ORDER-123")).thenReturn(statusResponse);
            when(orderService.getByLocalOrderId("ORDER-123", PaymentStatus.COMPLETED)).thenReturn(orderResponse);

            ResponseEntity<ApiResponse<OrderResponse>> response = payuController.order("ORDER-123");

            assertThat(response.getStatusCode().value()).isEqualTo(200);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getData().localOrderId()).isEqualTo("ORDER-123");
        }
    }
}
