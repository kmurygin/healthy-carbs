package org.kmurygin.healthycarbs.mealplan.controller;

import org.kmurygin.healthycarbs.mealplan.service.DietaryProfileService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/v1/user-profiles")
public class DietaryProfileController {

    private final DietaryProfileService dietaryProfileService;

    public DietaryProfileController(DietaryProfileService dietaryProfileService) {
        this.dietaryProfileService = dietaryProfileService;
    }

}
