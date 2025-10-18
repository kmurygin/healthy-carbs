package org.kmurygin.healthycarbs.mealplan.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class ShoppingListItemDTO {
    private String name;
    private Double totalQuantity;
    private String unit;

    @JsonInclude(JsonInclude.Include.ALWAYS)
    private Boolean isBought;
}
