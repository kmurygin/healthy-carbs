package org.kmurygin.healthycarbs.mealplan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.kmurygin.healthycarbs.user.dto.UserDTO;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class AllergenDTO {
    private Long id;
    private String name;
    private UserDTO author;
}
