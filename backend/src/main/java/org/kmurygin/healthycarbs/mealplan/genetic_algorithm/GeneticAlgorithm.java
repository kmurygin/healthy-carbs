package org.kmurygin.healthycarbs.mealplan.genetic_algorithm;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Supplier;
import java.util.stream.Stream;

@RequiredArgsConstructor
@Component
public class GeneticAlgorithm {

    private final Fitness fitness;
    private final Mutate mutate;
    private final Crossover crossover;
    private final Selection selection;

    private static final int POPULATION_SIZE = 20;
    private static final int MAX_GENERATIONS = 1_000;
    private static final double MUTATION_RATE = 0.2;
    private static final double TARGET_FITNESS = 0.999;

    public Genome run(Supplier<Genome> genomeSupplier) {
        List<Genome> population = generateInitialPopulation(genomeSupplier);
        Genome bestGenome = null;

        for (int generation = 0; generation < MAX_GENERATIONS; generation++) {
            evaluatePopulation(population);
            bestGenome = findBestGenome(population, bestGenome);
            if (bestGenome.getFitness() >= TARGET_FITNESS) {
                break;
            }
            population = generateNextGeneration(population);
        }

        return bestGenome;
    }

    private List<Genome> generateInitialPopulation(Supplier<Genome> supplier) {
        return Stream.generate(supplier).limit(POPULATION_SIZE).toList();
    }

    private List<Genome> generateNextGeneration(List<Genome> currentPopulation) {
        List<Genome> nextGeneration = new ArrayList<>(POPULATION_SIZE);

        while (nextGeneration.size() < POPULATION_SIZE) {
            Genome genomeParent1 = selection.select(currentPopulation);
            Genome genomeParent2 = selection.select(currentPopulation);
            Genome genomeChild = crossover.crossover(genomeParent1, genomeParent2);

            if (ThreadLocalRandom.current().nextDouble() < MUTATION_RATE) {
                mutate.mutate(genomeChild);
            }

            nextGeneration.add(genomeChild);
        }

        return nextGeneration;
    }

    private void evaluatePopulation(List<Genome> population) {
        for (Genome genome : population) {
            genome.setFitness(fitness.evaluate(genome));
        }
    }

    private Genome findBestGenome(List<Genome> population, Genome currentBest) {
        Genome best = currentBest;
        for (Genome genome : population) {
            if (best == null || genome.getFitness() > best.getFitness()) {
                best = new Genome(genome);
            }
        }
        return best;
    }
}
