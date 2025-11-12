package org.kmurygin.healthycarbs.offers;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.repository.MealPlanDayRepository;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.kmurygin.healthycarbs.util.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mealplan-templates")
@AllArgsConstructor
public class MealPlanTemplateController {

    private final MealPlanTemplateService mealPlanTemplateService;
    private final MealPlanTemplateMapper mealPlanTemplateMapper;
    private final MealPlanDayRepository mealPlanDayRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MealPlanTemplateDTO>>> findAll() {
        List<MealPlanTemplateDTO> templates = mealPlanTemplateService.findAll().stream()
                .map(mealPlanTemplateMapper::toDTO)
                .toList();
        return ApiResponses.success(templates);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MealPlanTemplateDTO>> findById(
            @PathVariable Long id
    ) {
        MealPlanTemplate entity = mealPlanTemplateService.findById(id);
        return ApiResponses.success(mealPlanTemplateMapper.toDTO(entity));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MealPlanTemplateDTO>> create(
            @Valid @RequestBody MealPlanTemplateDTO dto
    ) {
        MealPlanTemplate entity = mealPlanTemplateMapper.toEntity(dto, mealPlanDayRepository);
        MealPlanTemplate saved = mealPlanTemplateService.create(entity);
        return ApiResponses.success(HttpStatus.CREATED, mealPlanTemplateMapper.toDTO(saved),
                "Meal plan template has been created successfully");
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MealPlanTemplateDTO>> update(
            @PathVariable Long id,
            @Valid @RequestBody MealPlanTemplateDTO dto
    ) {
        MealPlanTemplate current = mealPlanTemplateService.findById(id);
        mealPlanTemplateMapper.updateFromDTO(current, dto, mealPlanDayRepository);
        MealPlanTemplate updated = mealPlanTemplateService.update(id, current);
        return ApiResponses.success(mealPlanTemplateMapper.toDTO(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        mealPlanTemplateService.deleteById(id);
        return ApiResponses.success(HttpStatus.NO_CONTENT, null,
                "Meal plan template has been deleted successfully");
    }
}
