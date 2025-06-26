package org.kmurygin.healthycarbs.user.dto;

import lombok.Data;

@Data
public class CreateUserRequest {
    private String username;
    private String firstname;
    private String lastname;
    private String email;
    private String password;
    private String role;
}