package org.kmurygin.healthycarbs.mealplan.controller;

import jakarta.validation.Valid;
import org.kmurygin.healthycarbs.mealplan.dto.DietaryProfileDTO;
import org.kmurygin.healthycarbs.mealplan.dto.DietaryProfilePayload;
import org.kmurygin.healthycarbs.mealplan.mapper.DietaryProfileMapper;
import org.kmurygin.healthycarbs.mealplan.model.DietaryProfile;
import org.kmurygin.healthycarbs.mealplan.service.DietaryProfileService;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.kmurygin.healthycarbs.util.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dietary-profiles")
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

    @GetMapping
    public ResponseEntity<ApiResponse<DietaryProfileDTO>> getCurrentUserProfile() {
        DietaryProfile dietaryProfile = dietaryProfileService.findCurrentUserProfile();
        if (dietaryProfile == null) {
            return ApiResponses.success(HttpStatus.NO_CONTENT, null, "Dietary profile not created yet");
        }
        return ApiResponses.success(HttpStatus.OK, dietaryProfileMapper.toDTO(dietaryProfile), "Dietary profile exists");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DietaryProfileDTO>> save(@Valid @RequestBody DietaryProfilePayload payload) {
        DietaryProfile dietaryProfile = dietaryProfileService.save(payload);
        return ApiResponses.success(HttpStatus.CREATED,
                dietaryProfileMapper.toDTO(dietaryProfile), "Dietary profile saved successfully");
    }
}
