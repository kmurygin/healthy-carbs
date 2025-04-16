package org.kmurygin.healthycarbs.auth;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.config.JwtService;
import org.kmurygin.healthycarbs.email.EmailDetails;
import org.kmurygin.healthycarbs.email.EmailService;
import org.kmurygin.healthycarbs.user.*;
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
        User user = UserMapper.fromRegisterRequest(request, passwordEncoder);

        try {
            userService.saveUser(user);
        } catch (IllegalArgumentException e) {
            return AuthenticationResponse.builder().error(e.getMessage()).build();
        }

        emailService.sendMail(new EmailDetails(
                user.getEmail(),
                String.format("Thank you for registering, %s!", user.getUsername()),
                "HealthyCarbs registration"
        ));

        String jwtToken = jwtService.generateToken(user);
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
