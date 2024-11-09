package org.kmurygin.healthycarbs.auth;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.config.JwtService;
import org.kmurygin.healthycarbs.email.EmailDetails;
import org.kmurygin.healthycarbs.email.EmailService;
import org.kmurygin.healthycarbs.user.UserRepository;
import org.kmurygin.healthycarbs.user.User;
import org.kmurygin.healthycarbs.user.Role;
import org.kmurygin.healthycarbs.user.UserService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final EmailService emailService;

    public AuthenticationResponse register(RegisterRequest request) {
        var user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();
        try {
            userService.saveUser(user);
        } catch (IllegalArgumentException e) {
            return AuthenticationResponse.builder()
                    .error(e.getMessage())
                    .build();
        }

        String message = "Thank you for registering " + user.getUsername() + " <3";
        EmailDetails emailDetails = new EmailDetails(user.getEmail(), message, "HealthyCarbs registration");
        emailService.sendMail(emailDetails);

        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder().token(jwtToken).build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        var user = new User();
        try {
            user = repository.findByUsername(request.getUsername())
                    .orElseThrow();
        }
        catch (Exception e) {
            return AuthenticationResponse.builder()
                    .error(e.getMessage())
                    .build();
        }
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder().token(jwtToken).build();
    }
}
