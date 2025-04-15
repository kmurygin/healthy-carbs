package org.kmurygin.healthycarbs.mealplan.controller;

import org.kmurygin.healthycarbs.mealplan.dto.RecipeDTO;
import org.kmurygin.healthycarbs.mealplan.dto.RecipeIngredientDTO;
import org.kmurygin.healthycarbs.mealplan.service.RecipeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/v1/recipes")
public class RecipeController {

    private final RecipeService recipeService;

    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    @GetMapping
    public List<RecipeDTO> getAll() {
        return recipeService.findAll();
    }

    @GetMapping("/{id}")
    public RecipeDTO getById(@PathVariable Long id) {
        return recipeService.findById(id);
    }

    @PostMapping
    public RecipeDTO create(@RequestBody RecipeDTO recipeDTO) {
        return recipeService.save(recipeDTO);
    }

    @PutMapping("/{id}")
    public RecipeDTO update(@PathVariable Long id, @RequestBody RecipeDTO recipeDTO) {
        recipeDTO.setId(id);
        return recipeService.save(recipeDTO);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        recipeService.deleteById(id);
    }

    @GetMapping("{id}/ingredients")
    public List<RecipeIngredientDTO> findAllIngredients(@PathVariable Long id) {
        return recipeService.findAllIngredients(id);
    }

    @PostMapping("/{recipeId}/ingredients/{ingredientId}")
    public RecipeDTO addIngredient(@PathVariable Long recipeId,
                                   @PathVariable Long ingredientId,
                                   @RequestParam Double quantity) {
        return recipeService.addIngredient(recipeId, ingredientId, quantity);
    }

    @DeleteMapping("/{recipeId}/ingredients/{ingredientId}")
    public RecipeDTO removeIngredient(@PathVariable Long recipeId, @PathVariable Long ingredientId) {
        return recipeService.removeIngredient(recipeId, ingredientId);
    }
}

