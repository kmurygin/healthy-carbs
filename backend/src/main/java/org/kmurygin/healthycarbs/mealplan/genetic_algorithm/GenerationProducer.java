package org.kmurygin.healthycarbs.mealplan.genetic_algorithm;

import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.config.GeneticAlgorithmConfig;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.core.Genome;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.crossover.Crossover;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.fitness.Fitness;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.mutation.Mutate;
import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.selection.Selection;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
public class GenerationProducer {

    public List<Genome> createNextGeneration(
            List<Genome> currentPopulation,
            Fitness fitness,
            DietType dietType,
            GeneticAlgorithmConfig config,
            Crossover crossover,
            Mutate mutate,
            Selection selection) {

        List<Genome> nextGen = selectElite(currentPopulation, config.getEliteCount(), config.getPopulationSize());

        while (nextGen.size() < config.getPopulationSize()) {
            Genome child = createOffspring(currentPopulation, crossover, mutate, selection, dietType, fitness);
            nextGen.add(child);
        }

        return nextGen;
    }

    private List<Genome> selectElite(List<Genome> population, int eliteCount, int populationSize) {
        return population.stream()
                .sorted(Comparator.comparingDouble(Genome::getFitness).reversed())
                .limit(Math.min(eliteCount, population.size()))
                .map(Genome::new)
                .collect(Collectors.toCollection(() -> new ArrayList<>(populationSize)));
    }

    private Genome createOffspring(
            List<Genome> population,
            Crossover crossover,
            Mutate mutate,
            Selection selection,
            DietType dietType,
            Fitness fitness) {

        Genome parent1 = selection.select(population);
        Genome parent2 = selection.select(population);
        Genome child = crossover.crossover(parent1, parent2);

        log.debug("Created child from parents with fitness: {} and {}", parent1.getFitness(), parent2.getFitness());

        mutate.mutate(child, dietType);

        return evaluateChild(child, fitness);
    }

    private Genome evaluateChild(Genome child, Fitness fitness) {
        child.setFitness(fitness.evaluate(child));
        return child;
    }
}