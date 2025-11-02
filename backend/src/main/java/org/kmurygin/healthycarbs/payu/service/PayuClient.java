package org.kmurygin.healthycarbs.payu.service;

import lombok.AllArgsConstructor;
import org.kmurygin.healthycarbs.auth.AuthenticationService;
import org.kmurygin.healthycarbs.payu.config.PayuProperties;
import org.kmurygin.healthycarbs.payu.dto.*;
import org.kmurygin.healthycarbs.user.User;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;


@AllArgsConstructor
@Component
public class PayuClient {

    private final WebClient webClient;
    private final PayuTokenService tokenService;
    private final AuthenticationService authenticationService;
    private final PayuProperties props;

    public CreateOrderResponse createOrder(InitPaymentRequest initPaymentRequest, String clientIp) {
        CreateOrderRequest payload = createOrderRequest(initPaymentRequest, clientIp);

        return webClient.post()
                .uri("/api/v2_1/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .headers(h -> h.setBearerAuth(tokenService.getAccessToken()))
                .bodyValue(payload)
                .retrieve()
                .onStatus(HttpStatusCode::isError, resp ->
                        resp.bodyToMono(String.class).flatMap(body ->
                                Mono.error(new IllegalStateException(
                                        "PayU create order error %s: %s".formatted(resp.statusCode(), body)))))
                .bodyToMono(CreateOrderResponse.class)
                .block();
    }

    private CreateOrderRequest createOrderRequest(InitPaymentRequest init, String clientIp) {
        String ip = (clientIp == null || clientIp.isBlank()) ? "127.0.0.1" : clientIp;
        List<Product> products = init.products();

        return new CreateOrderRequest(
                props.continueUrl(),
                props.notifyUrl(),
                ip,
                props.posId(),
                init.description(),
                props.currency(),
                init.localOrderId(),
                String.valueOf(init.totalAmount()),
                getBuyerFromSecurityContext(),
                products
        );
    }

    private Buyer getBuyerFromSecurityContext() {
        User user = authenticationService.getCurrentUser();
        if (user == null) {
            return new Buyer(
                    null,
                    null,
                    null,
                    "en"
            );
        }
        return new Buyer(
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                "en"
        );
    }

}
