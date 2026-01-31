package org.kmurygin.healthycarbs.mealplan;

import org.kmurygin.healthycarbs.mealplan.model.MealPlan;
import org.kmurygin.healthycarbs.user.UserTestUtils;
import org.kmurygin.healthycarbs.user.model.User;

import java.util.concurrent.ThreadLocalRandom;

public final class MealPlanTestUtils {
    private MealPlanTestUtils() {
    }

    public static User createUser(String prefix) {
        User user = UserTestUtils.createTestUser();
        user.setId(null);
        String suffix = String.valueOf(ThreadLocalRandom.current().nextLong(1_000_000_000L));
        user.setUsername(prefix + "_" + suffix);
        user.setEmail(prefix + "_" + suffix + "@test.com");
        return user;
    }

    public static MealPlan createMealPlan(User user, MealPlanSource source) {
        MealPlan plan = new MealPlan();
        plan.setUser(user);
        plan.setSource(source);
        return plan;
    }
}
