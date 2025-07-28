package org.kmurygin.healthycarbs.mealplan.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "genetic-algorithm")
public class GeneticAlgorithmConfig {
    private int populationSize = 40;
    private int maxGenerations = 1_000;
    private double mutationRate = 0.4;
    private double targetFitness = 0.999;
    private int eliteCount = 5;
}
