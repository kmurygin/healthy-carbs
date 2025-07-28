package org.kmurygin.healthycarbs.mealplan.genetic_algorithm;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.config.GeneticAlgorithmConfig;
import org.kmurygin.healthycarbs.mealplan.model.DietaryProfile;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Supplier;
import java.util.stream.Stream;

@RequiredArgsConstructor
@Component
public class GeneticAlgorithm {

    private final Crossover crossover;
    private final Mutate mutate;
    private final Selection selection;
    private final GeneticAlgorithmConfig config;
    private CalorieFitness fitness;
    private DietType dietType;

    public Genome run(Supplier<Genome> genomeSupplier, DietaryProfile dietaryProfile) {
        fitness = new CalorieFitness(dietaryProfile);
        dietType = dietaryProfile.getDietType();
        List<Genome> population = generateInitialPopulation(genomeSupplier);
        Genome bestGenome = null;

        for (int generation = 0; generation < config.getMaxGenerations(); generation++) {
            evaluatePopulation(population);
            bestGenome = findBestGenome(population, bestGenome);
            if (bestGenome.getFitness() >= config.getTargetFitness()) {
                break;
            }
            population = generateNextGeneration(population);
        }

        return bestGenome;
    }

    private List<Genome> generateInitialPopulation(Supplier<Genome> supplier) {
        return Stream.generate(supplier).limit(config.getPopulationSize()).toList();
    }

    private List<Genome> generateNextGeneration(List<Genome> currentPopulation) {
        List<Genome> nextGeneration = new ArrayList<>(config.getPopulationSize());

        while (nextGeneration.size() < config.getPopulationSize()) {
            Genome genomeParent1 = selection.select(currentPopulation);
            Genome genomeParent2 = selection.select(currentPopulation);
            Genome genomeChild = crossover.crossover(genomeParent1, genomeParent2);

            if (ThreadLocalRandom.current().nextDouble() < config.getMutationRate()) {
                mutate.mutate(genomeChild, dietType);
            }

            nextGeneration.add(genomeChild);
        }

        return nextGeneration;
    }

    private void evaluatePopulation(List<Genome> population) {
        population.parallelStream().
                forEach(genome -> genome.setFitness(fitness.evaluate(genome)));
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
