package org.kmurygin.healthycarbs.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.kmurygin.healthycarbs.user.User;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MeResponse {
    private User data;
}
