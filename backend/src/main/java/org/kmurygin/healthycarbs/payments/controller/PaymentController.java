package org.kmurygin.healthycarbs.payments.controller;

import lombok.AllArgsConstructor;
import org.kmurygin.healthycarbs.payments.dto.PaymentSummaryDTO;
import org.kmurygin.healthycarbs.payments.service.PaymentSummaryService;
import org.kmurygin.healthycarbs.user.UserService;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.kmurygin.healthycarbs.util.ApiResponses;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);
    private final PaymentSummaryService paymentSummaryService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentSummaryDTO>>> getPaymentSummariesByUserId() {
        List<PaymentSummaryDTO> paymentSummaries = paymentSummaryService.getPaymentSummariesByUserId(
                userService.getCurrentUser().getId()
        );
        logger.info(paymentSummaries.toString());
        return ApiResponses.success(paymentSummaries);
    }
}
