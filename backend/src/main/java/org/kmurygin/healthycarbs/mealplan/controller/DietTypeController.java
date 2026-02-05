package org.kmurygin.healthycarbs.mealplan.controller;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.service.DietTypeService;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.kmurygin.healthycarbs.util.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/diet-types")
@RequiredArgsConstructor
public class DietTypeController {

    private final DietTypeService dietTypeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DietType>>> getAll() {
        return ApiResponses.success(dietTypeService.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DietType>> create(@RequestBody DietType dietType) {
        DietType created = dietTypeService.create(dietType);
        return ApiResponses.success(HttpStatus.CREATED, created, "Diet type created successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        dietTypeService.deleteById(id);
        return ApiResponses.success(HttpStatus.NO_CONTENT, null, "Diet type deleted successfully");
    }
}
