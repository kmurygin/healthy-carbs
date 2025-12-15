package org.kmurygin.healthycarbs.offers.mealPlanTemplate;

import org.kmurygin.healthycarbs.exception.BadRequestException;
import org.kmurygin.healthycarbs.mealplan.MealPlanSource;
import org.kmurygin.healthycarbs.mealplan.model.MealPlan;
import org.kmurygin.healthycarbs.mealplan.model.MealPlanDay;
import org.kmurygin.healthycarbs.mealplan.model.MealPlanRecipe;
import org.kmurygin.healthycarbs.payments.model.Order;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;


public final class MealPlanTemplateUtil {
    private static final String ORDER_PREFIX = "healthy-carbs-";

    private MealPlanTemplateUtil() {
    }

    public static MealPlan createMealPlanFromTemplate(MealPlanTemplate template, Order order) {
        if (template == null) {
            throw new BadRequestException("MealPlanTemplate must not be null.");
        }
        if (template.getDays() == null || template.getDays().isEmpty()) {
            throw new BadRequestException("MealPlanTemplate %d has no days.".formatted(template.getId()));
        }
        if (order == null || order.getUser() == null) {
            throw new BadRequestException("Order must have a user.");
        }

        MealPlan plan = MealPlan.builder()
                .user(order.getUser())
                .totalCalories(template.getTotalCalories())
                .totalCarbs(template.getTotalCarbs())
                .totalProtein(template.getTotalProtein())
                .totalFat(template.getTotalFat())
                .source(MealPlanSource.PURCHASED)
                .build();

        plan.setDays(cloneDays(template.getDays(), plan));
        return plan;
    }

    public static void validateOrder(Order order) {
        if (order == null) throw new BadRequestException("Order must be not null.");
        if (order.getUser() == null) {
            throw new BadRequestException("Order %d has no user.".formatted(order.getId()));
        }
        if (order.getLocalOrderId() == null || order.getLocalOrderId().isBlank()) {
            throw new BadRequestException("Order %d has no localOrderId.".formatted(order.getId()));
        }
    }

    public static Long decodeLocalOrderId(String localOrderId) {
        final String decodedLocalOrderId;
        try {
            decodedLocalOrderId = new String(
                    Base64.getDecoder().decode(localOrderId), StandardCharsets.UTF_8
            );
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid localOrderId format (Base64).");
        }
        if (!decodedLocalOrderId.startsWith(ORDER_PREFIX)) {
            throw new BadRequestException(
                    "Invalid localOrderId: missing prefix '%s'.".formatted(ORDER_PREFIX)
            );
        }

        String rest = decodedLocalOrderId.substring(ORDER_PREFIX.length());
        String[] parts = rest.split("-", 2);
        if (parts.length == 0 || parts[0].isBlank()) {
            throw new BadRequestException("Invalid localOrderId: empty offer id segment.");
        }
        try {
            return Long.parseLong(parts[0]);
        } catch (NumberFormatException e) {
            throw new BadRequestException("Invalid localOrderId: offer id is not a number.");
        }
    }

    private static List<MealPlanDay> cloneDays(List<MealPlanDay> templateDays, MealPlan parent) {
        List<MealPlanDay> clonedDays = new ArrayList<>(templateDays.size());
        for (MealPlanDay templateDay : templateDays) {
            MealPlanDay day = MealPlanDay.builder()
                    .dayOfWeek(templateDay.getDayOfWeek())
                    .totalCalories(templateDay.getTotalCalories())
                    .totalCarbs(templateDay.getTotalCarbs())
                    .totalProtein(templateDay.getTotalProtein())
                    .totalFat(templateDay.getTotalFat())
                    .build();

            day.setMealPlan(parent);

            List<MealPlanRecipe> templateRecipes = templateDay.getRecipes();
            int recipesCount = (templateRecipes != null) ? templateRecipes.size() : 0;
            List<MealPlanRecipe> clonedRecipes = new ArrayList<>(recipesCount);

            if (recipesCount > 0) {
                for (MealPlanRecipe templateRecipe : templateRecipes) {
                    clonedRecipes.add(new MealPlanRecipe(
                                    day,
                                    templateRecipe.getRecipe(),
                                    templateRecipe.getMealType()
                            )
                    );
                }
            }

            day.setRecipes(clonedRecipes);
            clonedDays.add(day);
        }
        return clonedDays;
    }
}
