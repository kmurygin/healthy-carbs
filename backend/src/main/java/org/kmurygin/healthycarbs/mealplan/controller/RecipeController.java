package org.kmurygin.healthycarbs.mealplan.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.auth.AuthenticationService;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.MealType;
import org.kmurygin.healthycarbs.mealplan.dto.RecipeDTO;
import org.kmurygin.healthycarbs.mealplan.dto.RecipeIngredientDTO;
import org.kmurygin.healthycarbs.mealplan.mapper.RecipeMapper;
import org.kmurygin.healthycarbs.mealplan.model.Recipe;
import org.kmurygin.healthycarbs.mealplan.service.RecipeService;
import org.kmurygin.healthycarbs.user.User;
import org.kmurygin.healthycarbs.user.UserService;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.kmurygin.healthycarbs.util.ApiResponses;
import org.kmurygin.healthycarbs.util.PaginatedResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/recipes")
public class RecipeController {
    private final RecipeService recipeService;
    private final RecipeMapper recipeMapper;
    private final UserService userService;
    private final AuthenticationService authenticationService;

    @GetMapping
    ResponseEntity<ApiResponse<PaginatedResponse<RecipeDTO>>> findAll(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String ingredient,
            @RequestParam(required = false) DietType diet,
            @RequestParam(required = false) MealType meal,
            @RequestParam(required = false) Boolean onlyFavourites,
            Pageable pageable
    ) {
        Set<Long> favouriteIds = userService.getFavouriteRecipesIds();
        Long userId = null;
        if (onlyFavourites != null) {
            userId = authenticationService.getCurrentUser().getId();
        }

        Page<Recipe> page = recipeService.findAll(name, ingredient, diet, meal, userId, pageable);
        Page<RecipeDTO> recipeDtoPage = page.map(recipe -> recipeMapper.toDTO(recipe, favouriteIds));

        PaginatedResponse<RecipeDTO> paginatedResponse = this.toPaginatedResponse(recipeDtoPage);
        return ApiResponses.success(paginatedResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RecipeDTO>> getById(@PathVariable Long id) {
        Set<Long> favouriteIds = userService.getFavouriteRecipesIds();
        Recipe recipe = recipeService.findById(id);
        return ApiResponses.success(recipeMapper.toDTO(recipe, favouriteIds));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DIETITIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<RecipeDTO>> create(
            @Valid @RequestBody RecipeDTO recipeDTO
    ) {
        Recipe recipe = recipeService.create(recipeMapper.toEntity(recipeDTO));
        return ApiResponses.success(
                HttpStatus.CREATED,
                recipeMapper.toDTO(recipe),
                "Recipe created successfully"
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DIETITIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<RecipeDTO>> update(
            @PathVariable Long id,
            @RequestBody RecipeDTO recipeDTO
    ) {
        recipeDTO.setId(id);
        Recipe recipe = recipeService.update(id, recipeMapper.toEntity(recipeDTO));
        return ApiResponses.success(recipeMapper.toDTO(recipe));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DIETITIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        recipeService.deleteById(id);
        return ApiResponses.success(
                HttpStatus.NO_CONTENT,
                null,
                "Recipe deleted successfully"
        );
    }

    @GetMapping("/{id}/ingredients")
    public ResponseEntity<ApiResponse<List<RecipeIngredientDTO>>> findAllIngredients(
            @PathVariable Long id
    ) {
        return ApiResponses.success(recipeService.findAllIngredients(id));
    }

    @PostMapping("/{recipeId}/ingredients/{ingredientId}")
    @PreAuthorize("hasAnyRole('DIETITIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<RecipeDTO>> addIngredient(
            @PathVariable Long recipeId,
            @PathVariable Long ingredientId,
            @RequestParam Double quantity
    ) {
        Set<Long> favouriteIds = userService.getFavouriteRecipesIds();
        Recipe updatedRecipe = recipeService.addIngredient(recipeId, ingredientId, quantity);
        return ApiResponses.success(recipeMapper.toDTO(updatedRecipe, favouriteIds));
    }

    @DeleteMapping("/{recipeId}/ingredients/{ingredientId}")
    public ResponseEntity<ApiResponse<RecipeDTO>> removeIngredient(
            @PathVariable Long recipeId,
            @PathVariable Long ingredientId
    ) {
        Set<Long> favouriteIds = userService.getFavouriteRecipesIds();
        Recipe updatedRecipe = recipeService.removeIngredient(recipeId, ingredientId);
        return ApiResponses.success(recipeMapper.toDTO(updatedRecipe, favouriteIds));
    }

    @GetMapping("/random")
    public ResponseEntity<ApiResponse<RecipeDTO>> getRandom(
            @RequestParam MealType mealType,
            @RequestParam DietType dietType
    ) {
        Set<Long> favouriteIds = userService.getFavouriteRecipesIds();
        Recipe recipe = recipeService.findRandom(mealType, dietType);
        return ApiResponses.success(recipeMapper.toDTO(recipe, favouriteIds));
    }

    private PaginatedResponse<RecipeDTO> toPaginatedResponse(Page<RecipeDTO> recipeDtoPage) {
        return new PaginatedResponse<>(
                recipeDtoPage.getContent(),
                recipeDtoPage.getTotalPages(),
                recipeDtoPage.getTotalElements(),
                recipeDtoPage.getSize(),
                recipeDtoPage.getNumber(),
                recipeDtoPage.isFirst(),
                recipeDtoPage.isLast(),
                recipeDtoPage.isEmpty()
        );
    }

    @PostMapping("/{id}/favourite")
    public ResponseEntity<ApiResponse<Void>> addFavourite(@PathVariable Long id) {
        User user = authenticationService.getCurrentUser();
        recipeService.addFavourite(id, user.getId());
        return ApiResponses.success(
                HttpStatus.NO_CONTENT,
                null,
                "Recipe added to favourites"
        );
    }

    @DeleteMapping("/{id}/favourite")
    public ResponseEntity<ApiResponse<Void>> removeFavourite(@PathVariable Long id) {
        User user = authenticationService.getCurrentUser();
        recipeService.removeFavourite(id, user.getId());
        return ApiResponses.success(
                HttpStatus.NO_CONTENT,
                null,
                "Recipe removed from favourites"
        );
    }
}
