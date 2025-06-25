package org.kmurygin.healthycarbs.mealplan.service;

import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.dto.IngredientDTO;
import org.kmurygin.healthycarbs.mealplan.mapper.IngredientMapper;
import org.kmurygin.healthycarbs.mealplan.model.Ingredient;
import org.kmurygin.healthycarbs.mealplan.repository.IngredientRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IngredientService {

    private final IngredientRepository ingredientRepository;
    private final IngredientMapper ingredientMapper;

    public IngredientService(IngredientRepository ingredientRepository, IngredientMapper ingredientMapper) {
        this.ingredientRepository = ingredientRepository;
        this.ingredientMapper = ingredientMapper;
    }

    public List<IngredientDTO> findAll() {
        return ingredientRepository.findAll()
                .stream()
                .map(ingredientMapper::toDTO)
                .toList();
    }

    public IngredientDTO findById(Long id) {
        return ingredientRepository.findById(id)
                .map(ingredientMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient", "id", id));
    }

    public IngredientDTO save(IngredientDTO ingredientDTO) {
        Ingredient saved = ingredientRepository.save(ingredientMapper.toEntity(ingredientDTO));
        return ingredientMapper.toDTO(saved);
    }

    public void deleteById(Long id) {
        ingredientRepository.deleteById(id);
    }
}
