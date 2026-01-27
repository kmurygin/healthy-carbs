package org.kmurygin.healthycarbs.user.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.kmurygin.healthycarbs.user.Role;

@Data
public class ChangeRoleRequest {
    @NotNull(message = "Role must not be null")
    private Role role;
}
