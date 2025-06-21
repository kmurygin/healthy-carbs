package org.kmurygin.healthycarbs.mealplan.controller;

import org.kmurygin.healthycarbs.mealplan.dto.IngredientDTO;
import org.kmurygin.healthycarbs.mealplan.service.IngredientService;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<IngredientDTO> getById(@PathVariable Long id) {
        IngredientDTO ingredient = ingredientService.findById(id);
        return ResponseEntity.ok(ingredient);
    }

    @PostMapping
    public ResponseEntity<IngredientDTO>create(@RequestBody IngredientDTO ingredientDTO) {
        IngredientDTO ingredient = ingredientService.save(ingredientDTO);
        return ResponseEntity.ok(ingredient);
    }

    @PutMapping("/{id}")
    public ResponseEntity<IngredientDTO> update(@PathVariable Long id, @RequestBody IngredientDTO ingredientDTO) {
        ingredientDTO.setId(id);
        IngredientDTO ingredient = ingredientService.save(ingredientDTO);
        return ResponseEntity.ok(ingredient);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        ingredientService.deleteById(id);
    }
}
