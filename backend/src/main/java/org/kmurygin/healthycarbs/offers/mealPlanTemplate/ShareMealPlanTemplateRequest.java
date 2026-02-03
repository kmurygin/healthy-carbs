package org.kmurygin.healthycarbs.offers.mealPlanTemplate;

import jakarta.validation.constraints.NotNull;

public record ShareMealPlanTemplateRequest(@NotNull Long clientId) {
}
