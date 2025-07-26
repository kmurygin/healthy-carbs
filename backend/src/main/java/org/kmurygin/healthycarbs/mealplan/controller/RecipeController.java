package org.kmurygin.healthycarbs.mealplan.controller;

import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.MealType;
import org.kmurygin.healthycarbs.mealplan.dto.RecipeDTO;
import org.kmurygin.healthycarbs.mealplan.dto.RecipeIngredientDTO;
import org.kmurygin.healthycarbs.mealplan.mapper.RecipeMapper;
import org.kmurygin.healthycarbs.mealplan.model.Recipe;
import org.kmurygin.healthycarbs.mealplan.service.RecipeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/v1/recipes")
public class RecipeController {

    private final RecipeService recipeService;
    private final RecipeMapper recipeMapper;

    public RecipeController(RecipeService recipeService, RecipeMapper recipeMapper) {
        this.recipeService = recipeService;
        this.recipeMapper = recipeMapper;
    }

    @GetMapping
    public List<RecipeDTO> getAll() {
        List<Recipe> recipes = recipeService.findAll();
        return recipes.stream()
                .map(recipeMapper::toDTO)
                .toList();
    }

    @GetMapping("/{id}")
    public RecipeDTO getById(@PathVariable Long id) {
        Recipe recipe = recipeService.findById(id);
        return recipeMapper.toDTO(recipe);
    }

    @PostMapping
    public RecipeDTO create(@RequestBody RecipeDTO recipeDTO) {
        Recipe recipe = recipeService.save(recipeMapper.toEntity(recipeDTO));
        return recipeMapper.toDTO(recipe);
    }

    @PutMapping("/{id}")
    public RecipeDTO update(@PathVariable Long id, @RequestBody RecipeDTO recipeDTO) {
        recipeDTO.setId(id);
        Recipe recipe = recipeService.save(recipeMapper.toEntity(recipeDTO));
        return recipeMapper.toDTO(recipe);
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

    @GetMapping("/random")
    public RecipeDTO getRandomRecipe(@RequestParam String mealType, @RequestParam String dietType) {
        Recipe recipe = recipeService.findRandom(
                MealType.valueOf(mealType.toUpperCase()),
                DietType.valueOf(dietType.toUpperCase()));
        return recipeMapper.toDTO(recipe);
    }
}
