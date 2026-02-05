package org.kmurygin.healthycarbs.mealplan.service;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.exception.BadRequestException;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.repository.DietTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DietTypeService {

    private final DietTypeRepository dietTypeRepository;

    public List<DietType> findAll() {
        return dietTypeRepository.findAll();
    }

    public DietType findById(Long id) {
        return dietTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DietType", "id", id));
    }

    public DietType findByName(String name) {
        return dietTypeRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("DietType", "name", name));
    }

    @Transactional
    public DietType create(DietType dietType) {
        if (dietTypeRepository.findByName(dietType.getName()).isPresent()) {
            throw new BadRequestException("Diet type with name '%s' already exists.".formatted(dietType.getName()));
        }
        return dietTypeRepository.save(dietType);
    }

    @Transactional
    public void deleteById(Long id) {
        if (!dietTypeRepository.existsById(id)) {
            throw new ResourceNotFoundException("DietType", "id", id);
        }
        dietTypeRepository.deleteById(id);
    }

    public List<DietType> findCompatibleTypes(DietType dietType) {
        return dietTypeRepository.findByCompatibilityLevelLessThanEqual(dietType.getCompatibilityLevel());
    }
}
