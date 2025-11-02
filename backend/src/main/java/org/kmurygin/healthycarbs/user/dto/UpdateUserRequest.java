package org.kmurygin.healthycarbs.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateUserRequest {
    @NotBlank(message = "First name must not be blank")
    private String firstName;

    private String lastName;

    @Email(message = "Email should be valid")
    @NotBlank(message = "Email must not be blank")
    private String email;
}
