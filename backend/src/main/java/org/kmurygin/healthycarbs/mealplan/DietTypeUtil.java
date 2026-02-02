package org.kmurygin.healthycarbs.mealplan;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.repository.DietTypeRepository;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DietTypeUtil {

    private final DietTypeRepository dietTypeRepository;

    public Set<DietType> getCompatibleDietTypes(DietType dietType) {
        Objects.requireNonNull(dietType, "DietType cannot be null");
        return new HashSet<>(dietTypeRepository.findByCompatibilityLevelLessThanEqual(dietType.getCompatibilityLevel()));
    }
}
