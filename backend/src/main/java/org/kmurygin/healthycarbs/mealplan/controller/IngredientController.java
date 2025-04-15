package org.kmurygin.healthycarbs.mealplan.controller;

import org.kmurygin.healthycarbs.mealplan.dto.IngredientDTO;
import org.kmurygin.healthycarbs.mealplan.service.IngredientService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/v1/ingredients")
public class IngredientController {

    private final IngredientService ingredientService;

    public IngredientController(IngredientService ingredientService) {
        this.ingredientService = ingredientService;
    }

    @GetMapping
    public List<IngredientDTO> getAll() {
        return ingredientService.findAll();
    }

    @GetMapping("/{id}")
    public IngredientDTO getById(@PathVariable Long id) {
        return ingredientService.findById(id);
    }

    @PostMapping
    public IngredientDTO create(@RequestBody IngredientDTO ingredientDTO) {
        return ingredientService.save(ingredientDTO);
    }

    @PutMapping("/{id}")
    public IngredientDTO update(@PathVariable Long id, @RequestBody IngredientDTO ingredientDTO) {
        ingredientDTO.setId(id);
        return ingredientService.save(ingredientDTO);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        ingredientService.deleteById(id);
    }
}
