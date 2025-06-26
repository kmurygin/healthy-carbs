package org.kmurygin.healthycarbs.user.dto;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String firstname;
    private String lastname;
    private String email;
}