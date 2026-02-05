package org.kmurygin.healthycarbs.dietitian.collaboration;

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
public class CollaborationEmailListener {

    private final EmailService emailService;
    private final SpringTemplateEngine templateEngine;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onCollaborationEstablished(CollaborationEstablishedEvent event) {
        Context context = new Context();
        context.setVariable("clientUsername", event.clientUsername());
        String htmlContent = templateEngine.process("collaboration-request", context);

        try {
            emailService.sendMail(new EmailDetails(
                    event.dietitianEmail(),
                    htmlContent,
                    "Collaboration request"
            ));
        } catch (Exception ex) {
            log.error("Failed to send collaboration email for collaborationId={}", event.collaborationId(), ex);
        }
    }
}
