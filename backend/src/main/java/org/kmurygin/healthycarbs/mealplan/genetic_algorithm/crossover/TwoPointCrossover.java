package org.kmurygin.healthycarbs.mealplan.genetic_algorithm.crossover;

import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.core.Genome;
import org.springframework.stereotype.Component;

import java.util.concurrent.ThreadLocalRandom;

@Component
public class TwoPointCrossover implements Crossover {

    @Override
    public Genome crossover(Genome firstGenome, Genome secondGenome) {
        if (firstGenome.getGenes().size() != secondGenome.getGenes().size()) {
            throw new IllegalArgumentException("Genomes must have the same number of genes");
        }

        int size = firstGenome.getGenes().size();
        int firstPoint, secondPoint;

        do {
            firstPoint = ThreadLocalRandom.current().nextInt(size);
            secondPoint = ThreadLocalRandom.current().nextInt(size);
        }
        while (firstPoint == secondPoint);

        if (firstPoint > secondPoint) {
            int tmp = firstPoint;
            firstPoint = secondPoint;
            secondPoint = tmp;
        }

        Genome child = new Genome();
        for (int i = 0; i < size; i++) {
            if (i < firstPoint || i >= secondPoint) {
                child.getGenes().add(firstGenome.getGenes().get(i));
            } else {
                child.getGenes().add(secondGenome.getGenes().get(i));
            }
        }

        return child;
    }
}