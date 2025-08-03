package org.kmurygin.healthycarbs.mealplan.genetic_algorithm.selection;

import org.kmurygin.healthycarbs.mealplan.genetic_algorithm.core.Genome;

import java.util.List;

public interface Selection {
    Genome select(List<Genome> population);
}
