package org.kmurygin.healthycarbs.mealplan.controller;

import jakarta.validation.Valid;
import org.kmurygin.healthycarbs.mealplan.dto.DietaryProfileDTO;
import org.kmurygin.healthycarbs.mealplan.mapper.DietaryProfileMapper;
import org.kmurygin.healthycarbs.mealplan.model.DietaryProfile;
import org.kmurygin.healthycarbs.mealplan.service.DietaryProfileService;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.kmurygin.healthycarbs.util.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/v1/user-profiles")
public class DietaryProfileController {

    private final DietaryProfileService dietaryProfileService;
    private final DietaryProfileMapper dietaryProfileMapper;

    public DietaryProfileController(DietaryProfileService dietaryProfileService, DietaryProfileMapper dietaryProfileMapper) {
        this.dietaryProfileService = dietaryProfileService;
        this.dietaryProfileMapper = dietaryProfileMapper;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DietaryProfileDTO>> getById(@PathVariable Long id) {
        DietaryProfile dietaryProfile = dietaryProfileService.findById(id);
        return ApiResponses.success(dietaryProfileMapper.toDTO(dietaryProfile));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DietaryProfileDTO>> save(@Valid @RequestBody DietaryProfileDTO dietaryProfileDTO) {
        DietaryProfile dietaryProfile = dietaryProfileService.save(
                dietaryProfileMapper.toEntity(dietaryProfileDTO)
        );
        return ApiResponses.success(HttpStatus.CREATED,
                dietaryProfileMapper.toDTO(dietaryProfile), "Dietary profile saved successfully");
    }
}
