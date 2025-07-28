package org.kmurygin.healthycarbs.mealplan.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "genetic-algorithm")
public class GeneticAlgorithmConfig {
    private int populationSize = 100;
    private int maxGenerations = 100_000;
    private double mutationRate = 0.6;
    private double targetFitness = 0.999;
}
