package org.kmurygin.healthycarbs.email;

import jakarta.validation.Valid;
import org.kmurygin.healthycarbs.auth.service.AuthenticationService;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.service.UserService;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.kmurygin.healthycarbs.util.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.HtmlUtils;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@RestController
@RequestMapping("/api/v1/mails")
public class EmailController {

    private final EmailService emailService;
    private final UserService userService;
    private final AuthenticationService authenticationService;
    private final SpringTemplateEngine templateEngine;

    public EmailController(
            EmailService emailService,
            UserService userService,
            AuthenticationService authenticationService,
            SpringTemplateEngine templateEngine
    ) {
        this.emailService = emailService;
        this.userService = userService;
        this.authenticationService = authenticationService;
        this.templateEngine = templateEngine;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public String sendMail(@RequestBody EmailDetails details) {
        emailService.sendMail(details);
        return "";
    }

    @PostMapping("/contact")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> sendContactEmail(@RequestBody @Valid ContactEmailRequest request) {
        User sender = authenticationService.getCurrentUser();
        User recipient = userService.getUserById(request.recipientUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.recipientUserId()));

        String escapedMessage = HtmlUtils.htmlEscape(request.message()).replace("\n", "<br/>");

        Context context = new Context();
        context.setVariable("senderName", sender.getFirstName() + " " + sender.getLastName());
        context.setVariable("senderEmail", sender.getEmail());
        context.setVariable("messageBody", escapedMessage);
        String htmlContent = templateEngine.process("contact-message", context);

        emailService.sendMail(new EmailDetails(recipient.getEmail(), htmlContent, request.subject()));

        return ApiResponses.success(HttpStatus.OK, null, "Message sent successfully");
    }
}
