package org.kmurygin.healthycarbs.mealplan.service;

import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.model.Allergen;
import org.kmurygin.healthycarbs.mealplan.repository.AllergenRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AllergenService {

    private final AllergenRepository allergenRepository;

    public AllergenService(AllergenRepository allergenRepository) {
        this.allergenRepository = allergenRepository;
    }

    public List<Allergen> findAll() {
        return allergenRepository.findAll();
    }

    public Allergen findById(Long id) {
        return allergenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Allergen", "id", id));
    }

    public Allergen save(Allergen allergen) {
        return allergenRepository.save(allergen);
    }

    public void deleteById(Long id) {
        allergenRepository.deleteById(id);
    }

}
