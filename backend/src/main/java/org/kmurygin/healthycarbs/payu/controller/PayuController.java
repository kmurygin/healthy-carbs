package org.kmurygin.healthycarbs.payu.controller;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.servlet.http.HttpServletRequest;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.payu.dto.*;
import org.kmurygin.healthycarbs.payu.model.Order;
import org.kmurygin.healthycarbs.payu.service.OrderService;
import org.kmurygin.healthycarbs.payu.service.PaymentService;
import org.kmurygin.healthycarbs.payu.service.PayuClient;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.kmurygin.healthycarbs.util.ApiResponses;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments/payu")
public class PayuController {

    private static final Logger logger = LoggerFactory.getLogger(PayuController.class);
    private final PaymentService paymentService;
    private final OrderService orderService;
    private final PayuClient payuClient;

    public PayuController(
            PaymentService paymentService,
            OrderService orderService,
            PayuClient payuClient
    ) {
        this.paymentService = paymentService;
        this.orderService = orderService;
        this.payuClient = payuClient;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<InitPaymentResponse>> create(
            @RequestBody InitPaymentRequest initPaymentRequest,
            HttpServletRequest httpServletRequest
    ) {
        try {
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
        } catch (IllegalStateException ex) {
            logger.warn(ex.getMessage());
            return ApiResponses.failure(HttpStatus.BAD_GATEWAY, ex.getMessage());
        } catch (Exception ex) {
            logger.error(ex.getMessage());
            return ApiResponses.failure(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
        }
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
        try {
            String status = paymentService.getStatus(localOrderId).status();
            var data = orderService.getByLocalOrderId(localOrderId, status);
            logger.info("Order found: {}", data);
            return ApiResponses.success(HttpStatus.OK, data, "OK");
        } catch (ResourceNotFoundException ex) {
            logger.warn(ex.getMessage());
            return ApiResponses.failure(HttpStatus.NOT_FOUND, ex.getMessage());
        } catch (Exception ex) {
            logger.error(ex.getMessage());
            return ApiResponses.failure(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
        }
    }
}
