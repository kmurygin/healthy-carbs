package org.kmurygin.healthycarbs.mealplan.genetic_algorithm;

public interface Crossover {
    Genome crossover(
            Genome a,
            Genome b
    );
}
