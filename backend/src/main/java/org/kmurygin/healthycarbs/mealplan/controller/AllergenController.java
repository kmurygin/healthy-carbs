package org.kmurygin.healthycarbs.mealplan.controller;

import org.kmurygin.healthycarbs.mealplan.model.Allergen;
import org.kmurygin.healthycarbs.mealplan.service.AllergenService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/allergens")
public class AllergenController {

    private final AllergenService allergenService;

    public AllergenController(AllergenService allergenService) {
        this.allergenService = allergenService;
    }

    @GetMapping
    public List<Allergen> getAll() {
        return allergenService.findAll();
    }

    @GetMapping("/{id}")
    public Allergen getById(@PathVariable Long id) {
        return allergenService.findById(id);
    }

    @PostMapping
    public Allergen create(@RequestBody Allergen allergen) {
        return allergenService.save(allergen);
    }

    @PutMapping("/{id}")
    public Allergen update(@PathVariable Long id, @RequestBody Allergen allergen) {
        allergen.setId(id);
        return allergenService.save(allergen);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        allergenService.deleteById(id);
    }
}
