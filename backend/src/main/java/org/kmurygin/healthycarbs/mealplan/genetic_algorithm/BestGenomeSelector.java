package org.kmurygin.healthycarbs.mealplan.genetic_algorithm;

import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.core.Genome;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class BestGenomeSelector {
    public Genome findBestGenome(List<Genome> population, Genome currentBest) {
        Genome bestGenome = currentBest;
        for (Genome genome : population) {
            if (bestGenome == null || genome.getFitness() > bestGenome.getFitness()) {
                bestGenome = new Genome(genome);
            }
        }
        return bestGenome;
    }
}
