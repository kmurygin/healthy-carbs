package org.kmurygin.healthycarbs.mealplan.controller;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.dto.MealPlanDTO;
import org.kmurygin.healthycarbs.mealplan.mapper.MealPlanMapper;
import org.kmurygin.healthycarbs.mealplan.model.MealPlan;
import org.kmurygin.healthycarbs.mealplan.service.MealPlanPdfService;
import org.kmurygin.healthycarbs.mealplan.service.MealPlanService;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.kmurygin.healthycarbs.util.ApiResponses;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mealplan")
@RequiredArgsConstructor
public class MealPlanController {
    private final MealPlanService mealPlanService;
    private final MealPlanMapper mealPlanMapper;
    private final MealPlanPdfService mealPlanPdfService;

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

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadMealPlanPdf(@PathVariable Long id) {
        byte[] pdfBytes = mealPlanPdfService.generateMealPlanPdf(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        String filename = "meal-plan-" + id + ".pdf";
        headers.setContentDispositionFormData("attachment", filename);
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

}