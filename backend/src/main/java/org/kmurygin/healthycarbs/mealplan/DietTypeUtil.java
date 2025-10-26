package org.kmurygin.healthycarbs.mealplan;

import java.util.Collections;
import java.util.EnumSet;
import java.util.Objects;
import java.util.Set;

public final class DietTypeUtil {

    private static final Set<DietType> veganDietTypes =
            Collections.unmodifiableSet(
                    EnumSet.of(DietType.VEGAN)
            );

    private static final Set<DietType> noMeatDietTypes =
            Collections.unmodifiableSet(
                    EnumSet.of(DietType.VEGETARIAN, DietType.VEGAN)
            );

    private static final Set<DietType> allDietTypes =
            Collections.unmodifiableSet(
                    EnumSet.allOf(DietType.class)
            );

    private DietTypeUtil() {
    }

    public static Set<DietType> getCompatibleDietTypes(DietType dietType) {
        Objects.requireNonNull(dietType, "DietType cannot be a null");
        return switch (dietType) {
            case VEGAN -> veganDietTypes;
            case VEGETARIAN -> noMeatDietTypes;
            case STANDARD -> allDietTypes;
        };
    }
}
