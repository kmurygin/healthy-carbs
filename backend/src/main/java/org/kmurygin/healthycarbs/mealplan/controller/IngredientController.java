package org.kmurygin.healthycarbs.mealplan.controller;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.IngredientCategory;
import org.kmurygin.healthycarbs.mealplan.dto.IngredientDTO;
import org.kmurygin.healthycarbs.mealplan.mapper.IngredientMapper;
import org.kmurygin.healthycarbs.mealplan.model.Ingredient;
import org.kmurygin.healthycarbs.mealplan.service.IngredientService;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.kmurygin.healthycarbs.util.ApiResponses;
import org.kmurygin.healthycarbs.util.PaginatedResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/v1/ingredients")
public class IngredientController {

    private final IngredientService ingredientService;
    private final IngredientMapper ingredientMapper;
    private static final Logger logger = LoggerFactory.getLogger(IngredientController.class);


    @GetMapping
    public ResponseEntity<ApiResponse<List<IngredientDTO>>> getAll() {
        List<IngredientDTO> ingredients = ingredientService.findAll().stream()
                .map(ingredientMapper::toDTO)
                .toList();
        return ApiResponses.success(ingredients);
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PaginatedResponse<IngredientDTO>>> getAll(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) IngredientCategory category,
            @RequestParam(required = false) Boolean onlyMine,
            Pageable pageable
    ) {
        logger.info("Params: name={}, category={}, onlyMine={}", name, category, onlyMine);

        Page<Ingredient> page = ingredientService.findAllPage(name, category, onlyMine, pageable);
        Page<IngredientDTO> dtoPage = page.map(ingredientMapper::toDTO);

        return ApiResponses.success(toPaginatedResponse(dtoPage));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<IngredientDTO>> getById(@PathVariable Long id) {
        Ingredient ingredient = ingredientService.findById(id);
        return ApiResponses.success(ingredientMapper.toDTO(ingredient));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DIETITIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<IngredientDTO>> create(
            @Valid @RequestBody IngredientDTO ingredientDTO
    ) {
        Ingredient ingredient = ingredientService.create(
                ingredientMapper.toEntity(ingredientDTO)
        );
        return ApiResponses.success(HttpStatus.CREATED,
                ingredientMapper.toDTO(ingredient), "Ingredient created successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DIETITIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<IngredientDTO>> update(
            @PathVariable Long id,
            @RequestBody IngredientDTO ingredientDTO
    ) {
        ingredientDTO.setId(id);
        Ingredient ingredient = ingredientService.update(
                id,
                ingredientMapper.toEntity(ingredientDTO)
        );
        return ApiResponses.success(ingredientMapper.toDTO(ingredient));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DIETITIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        ingredientService.deleteById(id);
        return ApiResponses.success(HttpStatus.NO_CONTENT, null, "Ingredient deleted successfully");
    }

    private PaginatedResponse<IngredientDTO> toPaginatedResponse(Page<IngredientDTO> page) {
        return new PaginatedResponse<>(
                page.getContent(),
                page.getTotalPages(),
                page.getTotalElements(),
                page.getSize(),
                page.getNumber(),
                page.isFirst(),
                page.isLast(),
                page.isEmpty()
        );
    }
}
