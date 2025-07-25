package org.kmurygin.healthycarbs.mealplan.genetic_algorithm;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
public class TournamentSelection implements Selection {

    private static final int TOURNAMENT_SIZE = 2;

    @Override
    public Genome select(List<Genome> population) {
        List<Genome> shuffled = new ArrayList<>(population);
        Collections.shuffle(shuffled);

        Genome best = shuffled.getFirst();
        for (int i = 1; i < TOURNAMENT_SIZE && i < shuffled.size(); i++) {
            if (shuffled.get(i).fitness > best.fitness) {
                best = shuffled.get(i);
            }
        }

        return best;
    }
}
