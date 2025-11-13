package org.kmurygin.healthycarbs.offers;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OfferDTO {
    private Long id;
    private String title;
    private String description;
    private int price;
    private String currency;
    private Set<String> features;
    private int durationInDays;
    private Long mealPlanTemplateId;
    private String mealPlanTemplateName;
}
