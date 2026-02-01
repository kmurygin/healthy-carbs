package org.kmurygin.healthycarbs.payments;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kmurygin.healthycarbs.payments.config.PayuProperties;
import org.kmurygin.healthycarbs.payments.dto.AccessTokenResponse;
import org.kmurygin.healthycarbs.payments.service.PayuTokenService;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PayuTokenService Unit Tests")
class PayuTokenServiceUnitTest {

    @Mock
    private WebClient webClient;

    @Mock
    private WebClient.RequestBodyUriSpec requestBodyUriSpec;

    @Mock
    private WebClient.RequestBodySpec requestBodySpec;

    @Mock
    private WebClient.RequestHeadersSpec requestHeadersSpec;

    @Mock
    private WebClient.ResponseSpec responseSpec;

    private PayuTokenService payuTokenService;

    @BeforeEach
    void setUp() {
        PayuProperties props = new PayuProperties(
                "http://localhost", "123", "123", "secret", "key",
                "http://localhost", "http://localhost", "PLN"
        );
        payuTokenService = new PayuTokenService(webClient, props);
    }

    @Test
    @DisplayName("getAccessToken_shouldFetchNewToken")
    void getAccessToken_shouldFetchNewToken() {
        AccessTokenResponse tokenResponse = new AccessTokenResponse("new-token", "bearer", 3600L, "client_credentials");

        when(webClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.contentType(any())).thenReturn(requestBodySpec);
        when(requestBodySpec.body(any())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(AccessTokenResponse.class)).thenReturn(Mono.just(tokenResponse));

        String token = payuTokenService.getAccessToken();

        assertThat(token).isEqualTo("new-token");
    }

    @Test
    @DisplayName("getAccessToken_whenCachedTokenValid_shouldReturnCached")
    void getAccessToken_whenCachedTokenValid_shouldReturnCached() {
        AccessTokenResponse tokenResponse = new AccessTokenResponse("cached-token", "bearer", 3600L, "client_credentials");

        when(webClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.contentType(any())).thenReturn(requestBodySpec);
        when(requestBodySpec.body(any())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(AccessTokenResponse.class)).thenReturn(Mono.just(tokenResponse));

        String firstCall = payuTokenService.getAccessToken();
        String secondCall = payuTokenService.getAccessToken();

        assertThat(firstCall).isEqualTo("cached-token");
        assertThat(secondCall).isEqualTo("cached-token");
        verify(webClient, times(1)).post();
    }
}
