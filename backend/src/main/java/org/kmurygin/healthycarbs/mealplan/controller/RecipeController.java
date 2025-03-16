package org.kmurygin.healthycarbs.mealplan.controller;

import org.kmurygin.healthycarbs.mealplan.model.Recipe;
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
    public List<Recipe> getAll() {
        return recipeService.findAll();
    }

    @GetMapping("/{id}")
    public Recipe getById(@PathVariable Long id) {
        return recipeService.findById(id);
    }

    @PostMapping
    public Recipe create(@RequestBody Recipe recipe) {
        return recipeService.save(recipe);
    }

    @PutMapping("/{id}")
    public Recipe update(@PathVariable Long id, @RequestBody Recipe recipe) {
        recipe.setId(id);
        return recipeService.save(recipe);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        recipeService.deleteById(id);
    }

}
