package org.kmurygin.healthycarbs.mealplan.service;

import org.kmurygin.healthycarbs.mealplan.dto.IngredientDTO;
import org.kmurygin.healthycarbs.mealplan.model.Ingredient;
import org.kmurygin.healthycarbs.mealplan.repository.IngredientRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IngredientService {

    private final IngredientRepository ingredientRepository;

    public IngredientService(IngredientRepository ingredientRepository) {
        this.ingredientRepository = ingredientRepository;
    }

    public List<IngredientDTO> findAll() {
        return ingredientRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public IngredientDTO findById(Long id) {
        return ingredientRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Ingredient with id " + id + " not found."));
    }

    public IngredientDTO save(IngredientDTO ingredientDTO) {
        Ingredient saved = ingredientRepository.save(toEntity(ingredientDTO));
        return toDTO(saved);
    }

    public void deleteById(Long id) {
        ingredientRepository.deleteById(id);
    }


    private IngredientDTO toDTO(Ingredient ingredient) {
        return new IngredientDTO(
                ingredient.getId(),
                ingredient.getName(),
                ingredient.getUnit(),
                ingredient.getCaloriesPerUnit(),
                ingredient.getCarbsPerUnit(),
                ingredient.getProteinPerUnit(),
                ingredient.getFatPerUnit()
        );
    }

    private Ingredient toEntity(IngredientDTO dto) {
        return Ingredient.builder()
                .id(dto.getId())
                .name(dto.getName())
                .unit(dto.getUnit())
                .caloriesPerUnit(dto.getCaloriesPerUnit())
                .carbsPerUnit(dto.getCarbsPerUnit())
                .proteinPerUnit(dto.getProteinPerUnit())
                .fatPerUnit(dto.getFatPerUnit())
                .build();
    }

}
