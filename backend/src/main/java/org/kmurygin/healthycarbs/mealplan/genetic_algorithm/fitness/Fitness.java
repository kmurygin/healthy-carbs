package org.kmurygin.healthycarbs.mealplan.genetic_algorithm.fitness;


import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.core.Genome;

public interface Fitness {
    double evaluate(Genome plan);
}