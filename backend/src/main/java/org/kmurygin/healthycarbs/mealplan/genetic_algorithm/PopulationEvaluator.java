package org.kmurygin.healthycarbs.mealplan.genetic_algorithm;

import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.core.Genome;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.fitness.Fitness;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PopulationEvaluator {
    public void evaluate(List<Genome> population, Fitness fitness) {
        population
                .forEach(genome -> genome.setFitness(fitness.evaluate(genome)));
    }
}
