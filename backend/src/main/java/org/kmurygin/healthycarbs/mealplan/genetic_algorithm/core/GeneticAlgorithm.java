package org.kmurygin.healthycarbs.mealplan.genetic_algorithm.core;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.config.GeneticAlgorithmConfig;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.BestGenomeSelector;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.GenerationProducer;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.PopulationEvaluator;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.PopulationInitializer;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.crossover.Crossover;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.fitness.Fitness;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.mutation.Mutate;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.selection.Selection;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Supplier;

@Slf4j
@Component
@RequiredArgsConstructor
public class GeneticAlgorithm {
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

        log.info("[GA-START] populationSize={}, maxGenerations={}, mutationRate={}, targetFitness={}, eliteCount={}",
                config.getPopulationSize(), config.getMaxGenerations(), config.getMutationRate(),
                config.getTargetFitness(), config.getEliteCount());

        for (int generation = 0; generation < config.getMaxGenerations(); generation++) {
            evaluator.evaluate(population, fitness);
            bestGenome = bestGenomeSelector.findBestGenome(population, bestGenome);

            if (log.isInfoEnabled()) {
                double avgFitness = population.stream().mapToDouble(Genome::getFitness).average().orElse(0);
                log.info("[GA-GEN] gen={} | bestFitness={} | avgFitness={} | cal={} carb={} prot={} fat={}",
                        generation, String.format("%.4f", bestGenome.getFitness()),
                        String.format("%.4f", avgFitness),
                        String.format("%.0f", bestGenome.getTotalCalories()),
                        String.format("%.0f", bestGenome.getTotalCarbs()),
                        String.format("%.0f", bestGenome.getTotalProtein()),
                        String.format("%.0f", bestGenome.getTotalFat()));
            }

            if (bestGenome.getFitness() >= config.getTargetFitness()) {
                log.info("[GA-CONVERGED] Reached target fitness at generation {}", generation);
                break;
            }

            population = generationProducer.createNextGeneration(
                    population, fitness, dietType, config, crossover, mutate, selection);
        }
        return bestGenome;
    }
}

