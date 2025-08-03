package org.kmurygin.healthycarbs.mealplan.genetic_algorithm.crossover;

import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.core.Genome;

public interface Crossover {
    Genome crossover(
            Genome a,
            Genome b
    );
}
