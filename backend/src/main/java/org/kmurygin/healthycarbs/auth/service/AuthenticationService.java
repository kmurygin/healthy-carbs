package org.kmurygin.healthycarbs.auth.service;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.auth.dto.AuthenticationRequest;
import org.kmurygin.healthycarbs.auth.dto.AuthenticationResponse;
import org.kmurygin.healthycarbs.auth.dto.RegisterRequest;
import org.kmurygin.healthycarbs.config.JwtService;
import org.kmurygin.healthycarbs.email.EmailDetails;
import org.kmurygin.healthycarbs.email.EmailService;
import org.kmurygin.healthycarbs.exception.UnauthorizedException;
import org.kmurygin.healthycarbs.user.model.Role;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.repository.UserRepository;
import org.kmurygin.healthycarbs.user.service.UserService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final EmailService emailService;

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof User user) {
            return user;
        }
        throw new UnauthorizedException("No authenticated user found");
    }

    public AuthenticationResponse register(RegisterRequest request) {
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        userService.save(user);

        emailService.sendMail(new EmailDetails(
                user.getEmail(),
                String.format("Thank you for registering, %s!", user.getUsername()),
                "HealthyCarbs registration"
        ));

        String jwtToken = jwtService.generateToken(getExtraClaims(user), user);

        return AuthenticationResponse.builder().token(jwtToken).build();
    }

    @Transactional
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        User user = repository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new UnauthorizedException("Account is deactivated. Please contact an administrator.");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            throw new UnauthorizedException("Invalid username or password");
        } catch (UsernameNotFoundException e) {
            throw new UnauthorizedException("User not found with the provided username");
        }

        user.setLastLoginAt(Instant.now());
        repository.save(user);

        String jwtToken = jwtService.generateToken(getExtraClaims(user), user);

        return AuthenticationResponse.builder().token(jwtToken).build();
    }

    private Map<String, Object> getExtraClaims(User user) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("id", user.getId());
        extraClaims.put("role", user.getRole().name());

        return extraClaims;
    }
}