package org.kmurygin.healthycarbs.mealplan.controller;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.dto.AllergenDTO;
import org.kmurygin.healthycarbs.mealplan.mapper.AllergenMapper;
import org.kmurygin.healthycarbs.mealplan.model.Allergen;
import org.kmurygin.healthycarbs.mealplan.service.AllergenService;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.kmurygin.healthycarbs.util.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/allergens")
public class AllergenController {

    private final AllergenService allergenService;
    private final AllergenMapper allergenMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AllergenDTO>>> getAll() {
        List<AllergenDTO> allergens = allergenService.findAll().stream()
                .map(allergenMapper::toDTO)
                .toList();
        return ApiResponses.success(allergens);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AllergenDTO>> getById(@PathVariable Long id) {
        Allergen allergen = allergenService.findById(id);
        return ApiResponses.success(allergenMapper.toDTO(allergen));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DIETITIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<AllergenDTO>> create(
            @RequestBody AllergenDTO allergenDTO
    ) {
        Allergen allergen = allergenService.create(allergenMapper.toEntity(allergenDTO));
        return ApiResponses.success(
                HttpStatus.CREATED,
                allergenMapper.toDTO(allergen),
                "Allergen created successfully"
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DIETITIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<AllergenDTO>> update(
            @PathVariable Long id,
            @RequestBody AllergenDTO allergenDTO
    ) {
        allergenDTO.setId(id);
        Allergen allergen = allergenService.update(id, allergenMapper.toEntity(allergenDTO));
        return ApiResponses.success(allergenMapper.toDTO(allergen));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DIETITIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        allergenService.deleteById(id);
        return ApiResponses.success(HttpStatus.NO_CONTENT, null, "Allergen deleted successfully");
    }
}
