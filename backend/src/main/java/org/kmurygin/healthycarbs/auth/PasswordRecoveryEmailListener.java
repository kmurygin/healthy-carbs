package org.kmurygin.healthycarbs.auth;

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
public class PasswordRecoveryEmailListener {

    private final EmailService emailService;
    private final SpringTemplateEngine templateEngine;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOtpGenerated(OtpGeneratedEvent event) {
        Context context = new Context();
        context.setVariable("username", event.username());
        context.setVariable("otp", event.otp());

        String htmlContent = templateEngine.process("password-recovery", context);

        emailService.sendMail(new EmailDetails(
                event.clientEmail(),
                htmlContent,
                "Password Recovery"
        ));
    }
}
