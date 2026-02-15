package org.kmurygin.healthycarbs.payments.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.payments.config.PayuProperties;
import org.kmurygin.healthycarbs.payments.dto.*;
import org.kmurygin.healthycarbs.payments.model.Order;
import org.kmurygin.healthycarbs.payments.service.OrderService;
import org.kmurygin.healthycarbs.payments.service.PaymentService;
import org.kmurygin.healthycarbs.payments.service.PayuClient;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.service.UserService;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.kmurygin.healthycarbs.util.ApiResponses;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/payments/payu")
@SuppressWarnings({"UnknownHttpHeader", "HttpUrlsUsage"}) // OpenPayu-Signature is a valid PayU custom header
public class PayuController {

    private static final Logger logger = LoggerFactory.getLogger(PayuController.class);
    private static final String SIGNATURE_HEADER = "OpenPayu-Signature";
    private static final Set<String> ALLOWED_HASH_ALGORITHMS = Set.of("MD5", "SHA-256", "SHA256");

    private final ObjectMapper objectMapper;
    private final PaymentService paymentService;
    private final OrderService orderService;
    private final PayuClient payuClient;
    private final UserService userService;
    private final PayuProperties payuProperties;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<InitPaymentResponse>> create(
            @Valid @RequestBody InitPaymentRequest initPaymentRequest,
            HttpServletRequest httpServletRequest
    ) {
        String ip = httpServletRequest.getRemoteAddr();
        User currentUser = userService.getCurrentUser();
        Order order = orderService.processPaymentRequest(initPaymentRequest, currentUser);
        paymentService.attachOrder(initPaymentRequest.localOrderId(), order);

        CreateOrderResponse response = payuClient.createOrder(initPaymentRequest, ip);
        paymentService.updatePaymentStatus(initPaymentRequest.localOrderId(), PaymentStatus.PENDING);

        InitPaymentResponse data = new InitPaymentResponse(response.orderId(), response.redirectUri());
        return ApiResponses.success(
                HttpStatus.CREATED,
                data,
                ""
        );
    }

    @PostMapping("/notify")
    public ResponseEntity<ApiResponse<Void>> notify(
            @RequestHeader HttpHeaders headers,
            @RequestBody String rawBody
    ) {
        verifySignature(headers, rawBody);

        try {
            JsonNode orderNode = objectMapper.readTree(rawBody).get("order");
            if (orderNode == null) {
                return ApiResponses.success(HttpStatus.OK, null, "OK");
            }

            String extOrderId = orderNode.path("extOrderId").asText(null);
            PaymentStatus status = PaymentStatus.valueOf(
                    orderNode.path("status").asText(String.valueOf(PaymentStatus.PENDING)));

            logger.info("[PayU] Payment notification — extOrderId: {}, status: {}", extOrderId, status);

            if (extOrderId != null) {
                paymentService.updatePaymentStatus(extOrderId, status);
            }
        } catch (JsonProcessingException e) {
            logger.error("[PayU] Failed to parse notification body", e);
            return ApiResponses.success(HttpStatus.BAD_REQUEST, null, "Invalid body");
        }
        return ApiResponses.success(HttpStatus.OK, null, "OK");
    }

    private void verifySignature(HttpHeaders headers, String body) {
        String signatureHeader = headers.getFirst(SIGNATURE_HEADER);
        if (signatureHeader == null || signatureHeader.isBlank()) {
            throw new SecurityException("Missing PayU signature header");
        }

        Map<String, String> params = parseSignatureHeader(signatureHeader);
        String incomingSignature = params.get("signature");
        String algorithm = params.getOrDefault("algorithm", "MD5").toUpperCase();

        if (incomingSignature == null) {
            throw new SecurityException("Invalid PayU signature header format");
        }

        if (!ALLOWED_HASH_ALGORITHMS.contains(algorithm)) {
            throw new SecurityException("Unsupported PayU signature algorithm: " + algorithm);
        }

        String expectedSignature = computeHash(body + payuProperties.secondKey(), algorithm);

        if (!MessageDigest.isEqual(
                expectedSignature.getBytes(StandardCharsets.UTF_8),
                incomingSignature.getBytes(StandardCharsets.UTF_8))) {
            logger.warn("[PayU] Signature mismatch for notification");
            throw new SecurityException("PayU signature verification failed");
        }
        logger.info("[PayU] Signature verified successfully");
    }

    private Map<String, String> parseSignatureHeader(String header) {
        return java.util.Arrays.stream(header.split(";"))
                .map(part -> part.split("=", 2))
                .filter(kv -> kv.length == 2)
                .collect(Collectors.toMap(kv -> kv[0].trim(), kv -> kv[1].trim()));
    }

    private String computeHash(String input, String algorithm) {
        try {
            byte[] digest = MessageDigest.getInstance(algorithm)
                    .digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Unsupported hash algorithm: " + algorithm, e);
        }
    }

    @GetMapping("/status/{localOrderId}")
    public ResponseEntity<ApiResponse<PaymentStatusResponse>> status(@PathVariable String localOrderId) {
        User currentUser = userService.getCurrentUser();
        PaymentStatusResponse data = paymentService.getStatus(localOrderId, currentUser);
        return ApiResponses.success(HttpStatus.OK, data, "OK");
    }

    @GetMapping("/order/{localOrderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> order(@PathVariable String localOrderId) {
        User currentUser = userService.getCurrentUser();
        PaymentStatus status = paymentService.getStatus(localOrderId, currentUser).status();
        OrderResponse data = orderService.getByLocalOrderId(localOrderId, status, currentUser);
        return ApiResponses.success(HttpStatus.OK, data, "OK");
    }
}
