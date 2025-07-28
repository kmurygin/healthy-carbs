package org.kmurygin.healthycarbs.mealplan.genetic_algorithm;

import org.kmurygin.healthycarbs.mealplan.DietType;

public interface Mutate {
    void mutate(Genome plan, DietType dietType);
}
