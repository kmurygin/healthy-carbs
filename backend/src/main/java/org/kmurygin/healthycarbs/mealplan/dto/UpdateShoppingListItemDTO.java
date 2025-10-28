package org.kmurygin.healthycarbs.mealplan.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class UpdateShoppingListItemDTO {
    private String ingredientName;

    @JsonProperty("isBought")
    private boolean isBought;
}
