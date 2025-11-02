package org.kmurygin.healthycarbs.payments.service;


import org.kmurygin.healthycarbs.payments.config.PayuProperties;
import org.kmurygin.healthycarbs.payments.dto.AccessTokenResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Instant;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class PayuTokenService {

    private final WebClient webClient;
    private final PayuProperties payuProperties;
    private final AtomicReference<String> authToken = new AtomicReference<>(null);
    private volatile Instant tokenExpiry = Instant.EPOCH;

    public PayuTokenService(WebClient webClient, PayuProperties payuProperties) {
        this.webClient = webClient;
        this.payuProperties = payuProperties;
    }

    public String getAccessToken() {
        if (Instant.now().isBefore(
                tokenExpiry.minusSeconds(30))
                && authToken.get() != null) {
            return authToken.get();
        }
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "client_credentials");
        form.add("client_id", payuProperties.clientId());
        form.add("client_secret", payuProperties.clientSecret());

        AccessTokenResponse res = webClient.post()
                .uri("/pl/standard/user/oauth/authorize")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData(form))
                .retrieve()
                .bodyToMono(AccessTokenResponse.class)
                .block();

        assert res != null;
        String t = res.accessToken();
        authToken.set(t);
        tokenExpiry = Instant.now().plusSeconds(res.expiresIn());
        return t;
    }
}
