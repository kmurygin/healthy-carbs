package org.kmurygin.healthycarbs.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String sender;

    @Autowired
    public EmailServiceImpl(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    @Async
    @Override
    public void sendMail(EmailDetails details) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(mimeMessage, "utf-8");

            helper.setFrom(sender);
            helper.setTo(details.getRecipient());
            helper.setSubject("[HealthyCarbs] " + details.getSubject());

            helper.setText(details.getMsgBody(), true);

            javaMailSender.send(mimeMessage);

        } catch (MessagingException e) {
            log.error(
                    "Error occurred while sending email to: {}. Exception: {}",
                    details.getRecipient(),
                    e.getMessage(),
                    e
            );
        }
    }
}
