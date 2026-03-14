package org.kmurygin.healthycarbs.payments.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kmurygin.healthycarbs.payments.dto.PaymentSummaryDTO;
import org.kmurygin.healthycarbs.payments.service.PaymentSummaryService;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.kmurygin.healthycarbs.util.ApiResponses;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentSummaryService paymentSummaryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentSummaryDTO>>> getPaymentSummariesByUserId(
            @AuthenticationPrincipal User currentUser) {
        List<PaymentSummaryDTO> paymentSummaries = paymentSummaryService.getPaymentSummariesByUserId(
                currentUser.getId()
        );
        log.info(paymentSummaries.toString());
        return ApiResponses.success(paymentSummaries);
    }
}
