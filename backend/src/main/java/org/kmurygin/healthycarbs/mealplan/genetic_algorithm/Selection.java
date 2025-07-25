package org.kmurygin.healthycarbs.mealplan.genetic_algorithm;

import java.util.List;

public interface Selection {
    Genome select(List<Genome> population);
}
