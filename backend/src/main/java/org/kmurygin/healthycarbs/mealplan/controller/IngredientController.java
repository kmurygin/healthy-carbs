package org.kmurygin.healthycarbs.mealplan.controller;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.dto.IngredientDTO;
import org.kmurygin.healthycarbs.mealplan.mapper.IngredientMapper;
import org.kmurygin.healthycarbs.mealplan.model.Ingredient;
import org.kmurygin.healthycarbs.mealplan.service.IngredientService;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.kmurygin.healthycarbs.util.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/v1/ingredients")
public class IngredientController {

    private final IngredientService ingredientService;
    private final IngredientMapper ingredientMapper;


    @GetMapping
    public ResponseEntity<ApiResponse<List<IngredientDTO>>> getAll() {
        List<IngredientDTO> ingredients = ingredientService.findAll().stream()
                .map(ingredientMapper::toDTO)
                .toList();
        return ApiResponses.success(ingredients);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<IngredientDTO>> getById(@PathVariable Long id) {
        Ingredient ingredient = ingredientService.findById(id);
        return ApiResponses.success(ingredientMapper.toDTO(ingredient));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<IngredientDTO>> create(
            @Valid @RequestBody IngredientDTO ingredientDTO
    ) {
        Ingredient ingredient = ingredientService.create(
                ingredientMapper.toEntity(ingredientDTO)
        );
        return ApiResponses.success(HttpStatus.CREATED,
                ingredientMapper.toDTO(ingredient), "Ingredient created successfully");
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<IngredientDTO>> update(
            @PathVariable Long id,
            @RequestBody IngredientDTO ingredientDTO
    ) {
        ingredientDTO.setId(id);
        Ingredient ingredient = ingredientService.update(
                id,
                ingredientMapper.toEntity(ingredientDTO)
        );
        return ApiResponses.success(ingredientMapper.toDTO(ingredient));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        ingredientService.deleteById(id);
        return ApiResponses.success(HttpStatus.NO_CONTENT, null, "Ingredient deleted successfully");
    }
}
