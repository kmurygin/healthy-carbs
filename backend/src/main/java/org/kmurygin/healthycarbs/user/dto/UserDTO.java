package org.kmurygin.healthycarbs.user.dto;

import lombok.*;
import org.kmurygin.healthycarbs.user.model.Role;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private Role role;
    private Long profileImageId;
    private Instant createdAt;
    private Instant lastLoginAt;
    private Boolean isActive;
}
