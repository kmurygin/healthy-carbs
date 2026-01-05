package org.kmurygin.healthycarbs.dietitian.collaboration;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kmurygin.healthycarbs.email.EmailDetails;
import org.kmurygin.healthycarbs.email.EmailService;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class CollaborationEmailListener {

    private final EmailService emailService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onCollaborationEstablished(CollaborationEstablishedEvent event) {
        String subject = "Collaboration request";
        String body = String.format(
                "User %s has sent you a collaboration request.",
                event.clientUsername()
        );

        try {
            emailService.sendMail(new EmailDetails(
                    event.dietitianEmail(),
                    body,
                    subject
            ));
        } catch (Exception ex) {
            log.error("Failed to send collaboration email for collaborationId={}", event.collaborationId(), ex);
        }
    }
}
