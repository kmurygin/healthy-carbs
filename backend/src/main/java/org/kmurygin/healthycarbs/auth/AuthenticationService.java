package org.kmurygin.healthycarbs.auth;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.config.JwtService;
import org.kmurygin.healthycarbs.email.EmailDetails;
import org.kmurygin.healthycarbs.email.EmailService;
import org.kmurygin.healthycarbs.exception.UnauthorizedException;
import org.kmurygin.healthycarbs.user.Role;
import org.kmurygin.healthycarbs.user.User;
import org.kmurygin.healthycarbs.user.UserRepository;
import org.kmurygin.healthycarbs.user.UserService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof User user) {
            return user;
        }
        return null;
    }

    public AuthenticationResponse register(RegisterRequest request) {
//        User user = UserMapper.fromRegisterRequest(request, passwordEncoder);
        User user = User.builder()
                .firstName(request.getFirstname())
                .lastName(request.getLastname())
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

        String jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder().token(jwtToken).build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
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

        User user = repository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        String jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder().token(jwtToken).build();
    }
}
