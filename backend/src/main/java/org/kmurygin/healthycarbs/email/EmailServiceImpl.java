package org.kmurygin.healthycarbs.email;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Service
public class EmailServiceImpl implements EmailService {

    @Autowired private JavaMailSender javaMailSender;

    @Value("${spring.mail.username}") private String sender;
    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);

    public String sendMail(EmailDetails details)
    {
        try {
            SimpleMailMessage mailMessage
                    = new SimpleMailMessage();
            mailMessage.setFrom(sender);
            mailMessage.setTo(details.getRecipient());
            mailMessage.setText(details.getMsgBody());
            mailMessage.setSubject(details.getSubject());

            javaMailSender.send(mailMessage);
            logger.info("Email successfully sent to: {}", details.getRecipient());
            return "Mail Sent Successfully...";
        }

        catch (Exception e) {
            logger.error("Error occurred while sending email to: {}. Exception: {}", details.getRecipient(), e.getMessage(), e);
            return "Error while Sending Mail";
        }
    }
}
