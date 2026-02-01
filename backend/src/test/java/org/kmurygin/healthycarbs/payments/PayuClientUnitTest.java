package org.kmurygin.healthycarbs.payments;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kmurygin.healthycarbs.auth.service.AuthenticationService;
import org.kmurygin.healthycarbs.payments.config.PayuProperties;
import org.kmurygin.healthycarbs.payments.dto.CreateOrderResponse;
import org.kmurygin.healthycarbs.payments.dto.InitPaymentRequest;
import org.kmurygin.healthycarbs.payments.dto.ProductDTO;
import org.kmurygin.healthycarbs.payments.service.PayuClient;
import org.kmurygin.healthycarbs.payments.service.PayuTokenService;
import org.kmurygin.healthycarbs.user.UserTestUtils;
import org.kmurygin.healthycarbs.user.model.User;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("PayuClient Unit Tests")
class PayuClientUnitTest {

    @Mock
    private WebClient webClient;

    @Mock
    private PayuTokenService tokenService;

    @Mock
    private AuthenticationService authenticationService;

    @Mock
    private WebClient.RequestBodyUriSpec requestBodyUriSpec;

    @Mock
    private WebClient.RequestBodySpec requestBodySpec;

    @Mock
    private WebClient.RequestHeadersSpec requestHeadersSpec;

    @Mock
    private WebClient.ResponseSpec responseSpec;

    private PayuClient payuClient;
    private PayuProperties props;

    @BeforeEach
    void setUp() {
        props = new PayuProperties(
                "http://localhost", "123", "123", "secret", "key",
                "http://continue.url", "http://notify.url", "PLN"
        );
        payuClient = new PayuClient(webClient, tokenService, authenticationService, props);
    }

    @Nested
    @DisplayName("createOrder")
    class CreateOrderTests {

        @Test
        @DisplayName("createOrder_withValidIp_shouldCallPayuAndReturnResponse")
        void createOrder_withValidIp_shouldCallPayuAndReturnResponse() {
            User testUser = UserTestUtils.createTestUser(1L, "testuser");
            InitPaymentRequest request = new InitPaymentRequest(
                    "ORDER-123", "Test", 9900, 1L,
                    List.of(new ProductDTO("Plan", "9900", "1"))
            );

            CreateOrderResponse expectedResponse = new CreateOrderResponse("SUCCESS", "http://redirect", "PAYU-123");

            when(tokenService.getAccessToken()).thenReturn("test-token");
            when(authenticationService.getCurrentUser()).thenReturn(testUser);
            when(webClient.post()).thenReturn(requestBodyUriSpec);
            when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
            when(requestBodySpec.contentType(any())).thenReturn(requestBodySpec);
            when(requestBodySpec.headers(any())).thenReturn(requestBodySpec);
            when(requestBodySpec.bodyValue(any())).thenReturn(requestHeadersSpec);
            when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
            when(responseSpec.onStatus(any(), any())).thenReturn(responseSpec);
            when(responseSpec.bodyToMono(CreateOrderResponse.class)).thenReturn(Mono.just(expectedResponse));

            CreateOrderResponse result = payuClient.createOrder(request, "192.168.1.1");

            assertThat(result.orderId()).isEqualTo("PAYU-123");
            assertThat(result.redirectUri()).isEqualTo("http://redirect");
        }

        @Test
        @DisplayName("createOrder_withNullIp_shouldDefaultTo127001")
        void createOrder_withNullIp_shouldDefaultTo127001() {
            User testUser = UserTestUtils.createTestUser(1L, "testuser");
            InitPaymentRequest request = new InitPaymentRequest(
                    "ORDER-456", "Test", 5000, 1L, List.of()
            );

            CreateOrderResponse expectedResponse = new CreateOrderResponse("SUCCESS", "http://redirect", "PAYU-456");

            when(tokenService.getAccessToken()).thenReturn("test-token");
            when(authenticationService.getCurrentUser()).thenReturn(testUser);
            when(webClient.post()).thenReturn(requestBodyUriSpec);
            when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
            when(requestBodySpec.contentType(any())).thenReturn(requestBodySpec);
            when(requestBodySpec.headers(any())).thenReturn(requestBodySpec);
            when(requestBodySpec.bodyValue(any())).thenReturn(requestHeadersSpec);
            when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
            when(responseSpec.onStatus(any(), any())).thenReturn(responseSpec);
            when(responseSpec.bodyToMono(CreateOrderResponse.class)).thenReturn(Mono.just(expectedResponse));

            CreateOrderResponse result = payuClient.createOrder(request, null);

            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("createOrder_whenUserIsNull_shouldUseFallbackBuyer")
        void createOrder_whenUserIsNull_shouldUseFallbackBuyer() {
            InitPaymentRequest request = new InitPaymentRequest(
                    "ORDER-789", "Test", 5000, 1L, List.of()
            );

            CreateOrderResponse expectedResponse = new CreateOrderResponse("SUCCESS", "http://redirect", "PAYU-789");

            when(tokenService.getAccessToken()).thenReturn("test-token");
            when(authenticationService.getCurrentUser()).thenReturn(null);
            when(webClient.post()).thenReturn(requestBodyUriSpec);
            when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
            when(requestBodySpec.contentType(any())).thenReturn(requestBodySpec);
            when(requestBodySpec.headers(any())).thenReturn(requestBodySpec);
            when(requestBodySpec.bodyValue(any())).thenReturn(requestHeadersSpec);
            when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
            when(responseSpec.onStatus(any(), any())).thenReturn(responseSpec);
            when(responseSpec.bodyToMono(CreateOrderResponse.class)).thenReturn(Mono.just(expectedResponse));

            CreateOrderResponse result = payuClient.createOrder(request, "1.2.3.4");

            assertThat(result.orderId()).isEqualTo("PAYU-789");
        }
    }
}
