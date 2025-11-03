package org.kmurygin.healthycarbs.payments.controller;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.payments.dto.*;
import org.kmurygin.healthycarbs.payments.model.Order;
import org.kmurygin.healthycarbs.payments.service.OrderService;
import org.kmurygin.healthycarbs.payments.service.PaymentService;
import org.kmurygin.healthycarbs.payments.service.PayuClient;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.kmurygin.healthycarbs.util.ApiResponses;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/payments/payu")
public class PayuController {

    private final PaymentService paymentService;
    private final OrderService orderService;
    private final PayuClient payuClient;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<InitPaymentResponse>> create(
            @RequestBody InitPaymentRequest initPaymentRequest,
            HttpServletRequest httpServletRequest
    ) {
        String ip = httpServletRequest.getRemoteAddr();

        Order order = orderService.upsertFromInit(initPaymentRequest);
        paymentService.attachOrder(initPaymentRequest.localOrderId(), order);

        CreateOrderResponse response = payuClient.createOrder(initPaymentRequest, ip);
        paymentService.setStatus(initPaymentRequest.localOrderId(), "PENDING");

        var data = new InitPaymentResponse(response.orderId(), response.redirectUri());
        return ApiResponses.success(
                HttpStatus.CREATED,
                data,
                ""
        );
    }

    @PostMapping("/notify")
    public ResponseEntity<ApiResponse<Void>> notify(
            @RequestHeader HttpHeaders headers,
            @RequestBody JsonNode body
    ) {
        JsonNode orderNode = body.get("order");
        if (orderNode != null) {
            String extOrderId = orderNode.path("extOrderId").asText(null);
            String status = orderNode.path("status").asText("PENDING");
            if (extOrderId != null) {
                paymentService.setStatus(extOrderId, status);
            }
        }
        return ApiResponses.success(HttpStatus.OK, null, "OK");
    }

    @GetMapping("/status/{localOrderId}")
    public ResponseEntity<ApiResponse<PaymentStatusResponse>> status(@PathVariable String localOrderId) {
        var data = paymentService.getStatus(localOrderId);
        return ApiResponses.success(HttpStatus.OK, data, "OK");
    }

    @GetMapping("/order/{localOrderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> order(@PathVariable String localOrderId) {
        String status = paymentService.getStatus(localOrderId).status();
        var data = orderService.getByLocalOrderId(localOrderId, status);
        return ApiResponses.success(HttpStatus.OK, data, "OK");
    }
}
