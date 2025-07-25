package org.kmurygin.healthycarbs.mealplan.controller;

import org.kmurygin.healthycarbs.mealplan.dto.MealPlanDTO;
import org.kmurygin.healthycarbs.mealplan.mapper.MealPlanMapper;
import org.kmurygin.healthycarbs.mealplan.model.MealPlan;
import org.kmurygin.healthycarbs.mealplan.service.MealPlanService;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/v1/mealplan")
public class MealPlanController {
    private final MealPlanService mealPlanService;
    private final MealPlanMapper mealPlanMapper;

    public MealPlanController(MealPlanService mealPlanService, MealPlanMapper mealPlanMapper) {
        this.mealPlanService = mealPlanService;
        this.mealPlanMapper = mealPlanMapper;
    }

    @GetMapping("")
    public MealPlanDTO generateMealPlan() {
        MealPlan mealPlan = mealPlanService.generateMealPlan();
        return mealPlanMapper.toDTO(mealPlan);
    }

}