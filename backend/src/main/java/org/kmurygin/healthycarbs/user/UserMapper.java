package org.kmurygin.healthycarbs.user;

import org.kmurygin.healthycarbs.auth.RegisterRequest;
import org.kmurygin.healthycarbs.user.dto.UserDTO;
import org.springframework.security.crypto.password.PasswordEncoder;

public class UserMapper {
    public static UserDTO toDto(User user) {
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getFirstname(),
                user.getLastname(),
                user.getEmail(),
                user.getRole().name()
        );
    }

    public static User fromRegisterRequest(RegisterRequest request, PasswordEncoder encoder) {
        return User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(encoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();
    }
}
