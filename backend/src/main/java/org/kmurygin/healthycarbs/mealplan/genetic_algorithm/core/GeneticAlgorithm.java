package org.kmurygin.healthycarbs.mealplan.genetic_algorithm.core;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.config.GeneticAlgorithmConfig;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.*;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.crossover.Crossover;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.fitness.Fitness;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.mutation.Mutate;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.selection.Selection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Supplier;

@Component
@RequiredArgsConstructor
public class GeneticAlgorithm {

    private static final Logger logger = LoggerFactory.getLogger(GeneticAlgorithm.class);
    private final Crossover crossover;
    private final Mutate mutate;
    private final Selection selection;
    private final GeneticAlgorithmConfig config;
    private final PopulationInitializer initializer;
    private final PopulationEvaluator evaluator;
    private final BestGenomeSelector bestGenomeSelector;
    private final GenerationProducer generationProducer;

    public Genome run(Supplier<Genome> genomeSupplier, Fitness fitness, DietType dietType) {
        List<Genome> population = initializer.generateInitialPopulation(genomeSupplier, config.getPopulationSize());
        Genome bestGenome = null;

        for (int generation = 0; generation < config.getMaxGenerations(); generation++) {
            logger.info("Generation: {}", generation);
            logger.info("Best genome fitness: {}", bestGenome != null ? bestGenome.getFitness() : "n/a");

            evaluator.evaluate(population, fitness);
            bestGenome = bestGenomeSelector.findBestGenome(population, bestGenome);

            if (bestGenome.getFitness() >= config.getTargetFitness()) break;

            population = generationProducer.createNextGeneration(
                    population, fitness, dietType, config, crossover, mutate, selection);
        }

        return bestGenome;
    }
}

