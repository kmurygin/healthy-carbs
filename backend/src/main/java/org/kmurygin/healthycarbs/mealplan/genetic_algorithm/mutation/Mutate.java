package org.kmurygin.healthycarbs.mealplan.genetic_algorithm.mutation;

import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.core.Genome;

public interface Mutate {
    void mutate(Genome plan, DietType dietType);
}
