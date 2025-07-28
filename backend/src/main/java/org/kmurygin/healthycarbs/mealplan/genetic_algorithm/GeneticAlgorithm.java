package org.kmurygin.healthycarbs.mealplan.genetic_algorithm;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.config.GeneticAlgorithmConfig;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Supplier;
import java.util.stream.Stream;

@Component
@RequiredArgsConstructor
public class GeneticAlgorithm {

    private final Crossover crossover;
    private final Mutate mutate;
    private final Selection selection;
    private final GeneticAlgorithmConfig config;

    public Genome run(Supplier<Genome> genomeSupplier, Fitness fitness, DietType dietType) {
        List<Genome> population = generateInitialPopulation(genomeSupplier);
        Genome bestGenome = null;

        for (int generation = 0; generation < config.getMaxGenerations(); generation++) {
            evaluatePopulation(population, fitness);
            bestGenome = findBestGenome(population, bestGenome);

            if (bestGenome.getFitness() >= config.getTargetFitness()) break;

            population = generateNextGeneration(population, fitness, dietType);
        }

        return bestGenome;
    }

    private List<Genome> generateInitialPopulation(Supplier<Genome> supplier) {
        return Stream.generate(supplier)
                .limit(config.getPopulationSize())
                .toList();
    }

    private List<Genome> generateNextGeneration(List<Genome> currentPopulation, Fitness fitness, DietType dietType) {
        List<Genome> nextGeneration = new ArrayList<>(config.getPopulationSize());

        while (nextGeneration.size() < config.getPopulationSize()) {
            Genome parent1 = selection.select(currentPopulation);
            Genome parent2 = selection.select(currentPopulation);
            Genome child = crossover.crossover(parent1, parent2);

            if (ThreadLocalRandom.current().nextDouble() < config.getMutationRate()) {
                mutate.mutate(child, dietType);
            }

            child.setFitness(fitness.evaluate(child));
            nextGeneration.add(child);
        }

        return nextGeneration;
    }

    private void evaluatePopulation(List<Genome> population, Fitness fitness) {
        population.parallelStream()
                .forEach(genome -> genome.setFitness(fitness.evaluate(genome)));
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
