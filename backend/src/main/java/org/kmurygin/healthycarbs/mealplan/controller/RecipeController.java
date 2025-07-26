package org.kmurygin.healthycarbs.mealplan.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.MealType;
import org.kmurygin.healthycarbs.mealplan.dto.RecipeDTO;
import org.kmurygin.healthycarbs.mealplan.dto.RecipeIngredientDTO;
import org.kmurygin.healthycarbs.mealplan.mapper.RecipeMapper;
import org.kmurygin.healthycarbs.mealplan.model.Recipe;
import org.kmurygin.healthycarbs.mealplan.service.RecipeService;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.kmurygin.healthycarbs.util.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/v1/recipes")
public class RecipeController {

    private final RecipeService recipeService;
    private final RecipeMapper recipeMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RecipeDTO>>> getAll() {
        List<RecipeDTO> recipes = recipeService.findAll().stream()
                .map(recipeMapper::toDTO)
                .toList();
        return ApiResponses.success(recipes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RecipeDTO>> getById(@PathVariable Long id) {
        Recipe recipe = recipeService.findById(id);
        return ApiResponses.success(recipeMapper.toDTO(recipe));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RecipeDTO>> create(@Valid @RequestBody RecipeDTO recipeDTO) {
        Recipe recipe = recipeService.save(recipeMapper.toEntity(recipeDTO));
        return ApiResponses.success(HttpStatus.CREATED, recipeMapper.toDTO(recipe), "Recipe created successfully");
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RecipeDTO>> update(@PathVariable Long id, @RequestBody RecipeDTO recipeDTO) {
        recipeDTO.setId(id);
        Recipe recipe = recipeService.save(recipeMapper.toEntity(recipeDTO));
        return ApiResponses.success(recipeMapper.toDTO(recipe));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        recipeService.deleteById(id);
        return ApiResponses.success(HttpStatus.NO_CONTENT, null, "Recipe deleted successfully");
    }

    @GetMapping("/{id}/ingredients")
    public ResponseEntity<ApiResponse<List<RecipeIngredientDTO>>> findAllIngredients(@PathVariable Long id) {
        return ApiResponses.success(recipeService.findAllIngredients(id));
    }

    @PostMapping("/{recipeId}/ingredients/{ingredientId}")
    public ResponseEntity<ApiResponse<RecipeDTO>> addIngredient(@PathVariable Long recipeId,
                                                                @PathVariable Long ingredientId,
                                                                @RequestParam Double quantity) {
        RecipeDTO updated = recipeService.addIngredient(recipeId, ingredientId, quantity);
        return ApiResponses.success(updated);
    }

    @DeleteMapping("/{recipeId}/ingredients/{ingredientId}")
    public ResponseEntity<ApiResponse<RecipeDTO>> removeIngredient(@PathVariable Long recipeId,
                                                                   @PathVariable Long ingredientId) {
        RecipeDTO updated = recipeService.removeIngredient(recipeId, ingredientId);
        return ApiResponses.success(updated);
    }

    @GetMapping("/random")
    public ResponseEntity<ApiResponse<RecipeDTO>> getRandomRecipe(@RequestParam String mealType,
                                                                  @RequestParam String dietType) {
        Recipe recipe = recipeService.findRandom(
                MealType.valueOf(mealType.toUpperCase()),
                DietType.valueOf(dietType.toUpperCase()));
        return ApiResponses.success(recipeMapper.toDTO(recipe));
    }
}
