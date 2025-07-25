package org.kmurygin.healthycarbs.mealplan.genetic_algorithm;


public interface Fitness {
    double evaluate(Genome plan);
}