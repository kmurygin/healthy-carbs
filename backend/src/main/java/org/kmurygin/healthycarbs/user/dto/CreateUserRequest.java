package org.kmurygin.healthycarbs.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateUserRequest {
    @NotBlank(message = "Username must not be blank")
    private String username;

    private String firstName;
    private String lastName;

    @NotBlank(message = "Email must not be blank")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password must not be blank")
    @Size(min = 12, max = 100, message = "Password must be between 12 and 100 characters")
    private String password;

    @NotBlank(message = "Role must not be blank")
    private String role;
}
