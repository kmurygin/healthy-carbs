package org.kmurygin.healthycarbs.mealplan.controller;

import org.kmurygin.healthycarbs.mealplan.dto.MealPlanDTO;
import org.kmurygin.healthycarbs.mealplan.mapper.MealPlanMapper;
import org.kmurygin.healthycarbs.mealplan.model.MealPlan;
import org.kmurygin.healthycarbs.mealplan.service.MealPlanService;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.kmurygin.healthycarbs.util.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @PostMapping("")
    public ResponseEntity<ApiResponse<MealPlanDTO>> generateMealPlan() {
        MealPlan mealPlan = mealPlanService.generateMealPlan();
        MealPlanDTO dto = mealPlanMapper.toDTO(mealPlan);
        return ApiResponses.success(HttpStatus.CREATED, dto, "Meal plan generated successfully");
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<MealPlanDTO>>> findAllMealPlans() {
        return ApiResponses.success(
                mealPlanService.getMealPlansHistory().stream()
                        .map(mealPlanMapper::toDTO)
                        .toList()
        );
    }

}