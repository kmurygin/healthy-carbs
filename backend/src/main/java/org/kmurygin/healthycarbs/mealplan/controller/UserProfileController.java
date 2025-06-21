package org.kmurygin.healthycarbs.mealplan.controller;


import org.kmurygin.healthycarbs.mealplan.dto.UserProfileCreateDTO;
import org.kmurygin.healthycarbs.mealplan.dto.UserProfileDTO;
import org.kmurygin.healthycarbs.mealplan.model.UserProfileRequest;
import org.kmurygin.healthycarbs.mealplan.service.UserProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/v1/user-profiles")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping
    public List<UserProfileDTO> getAll() {
        return userProfileService.findAll();
    }

    @GetMapping("/{id}")
    public UserProfileDTO getById(@PathVariable Long id) {
        return userProfileService.findById(id);
    }

    @PostMapping
    public UserProfileDTO create(@RequestBody UserProfileDTO userProfileDTO) {
        return userProfileService.save(userProfileDTO);
    }

    @PostMapping("/calculate")
    public ResponseEntity<UserProfileDTO> calcUserProfile(@RequestBody UserProfileCreateDTO userProfile) {
        UserProfileDTO calculatedProfile = userProfileService.calculateUserProfile(userProfile);
        return ResponseEntity.ok(calculatedProfile);
    }


}
