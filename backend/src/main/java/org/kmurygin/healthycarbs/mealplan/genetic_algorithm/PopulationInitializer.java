package org.kmurygin.healthycarbs.mealplan.genetic_algorithm;

import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.core.Genome;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Stream;

@Component
public class PopulationInitializer {
    public List<Genome> generateInitialPopulation(Supplier<Genome> supplier, int populationSize) {
        return Stream.generate(supplier)
                .limit(populationSize)
                .toList();
    }
}
