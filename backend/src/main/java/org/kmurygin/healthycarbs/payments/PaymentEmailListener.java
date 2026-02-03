package org.kmurygin.healthycarbs.payments;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kmurygin.healthycarbs.email.EmailDetails;
import org.kmurygin.healthycarbs.email.EmailService;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentEmailListener {

    private final EmailService emailService;
    private final SpringTemplateEngine templateEngine;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onPaymentCompleted(PaymentCompletedEvent event) {
        log.info("Sending payment notification email to dietitian: {}", event.dietitianEmail());

        Context emailContext = new Context();
        emailContext.setVariable("dietitianName", event.dietitianName());
        emailContext.setVariable("clientName", event.clientName());
        emailContext.setVariable("localOrderId", event.localOrderId());
        String dietitianHtml = templateEngine.process("payment-dietitian-notification", emailContext);

        emailService.sendMail(new EmailDetails(event.dietitianEmail(), dietitianHtml, "New order received"));

        Context clientCtx = new Context();
        clientCtx.setVariable("clientName", event.clientName());
        clientCtx.setVariable("localOrderId", event.localOrderId());
        String clientHtml = templateEngine.process("payment-client-confirmation", clientCtx);

        log.info("Sending meal plan ready email to client: {}", event.clientEmail());
        emailService.sendMail(new EmailDetails(event.clientEmail(), clientHtml, "Your meal plan is ready"));
    }
}
