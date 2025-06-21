package org.kmurygin.healthycarbs.mealplan.service;

import jakarta.transaction.Transactional;
import org.kmurygin.healthycarbs.mealplan.model.Ingredient;
import org.kmurygin.healthycarbs.mealplan.model.Recipe;
import org.kmurygin.healthycarbs.mealplan.model.RecipeIngredient;
import org.kmurygin.healthycarbs.mealplan.model.UserProfile;
import org.kmurygin.healthycarbs.mealplan.repository.IngredientRepository;
import org.kmurygin.healthycarbs.mealplan.repository.RecipeIngredientRepository;
import org.kmurygin.healthycarbs.mealplan.repository.RecipeRepository;
import org.kmurygin.healthycarbs.mealplan.dto.RecipeDTO;
import org.kmurygin.healthycarbs.mealplan.dto.RecipeIngredientDTO;
import org.kmurygin.healthycarbs.mealplan.repository.UserProfileRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;
    private final RecipeIngredientRepository recipeIngredientRepository;
//    private final UserProfileRepository userProfileRepository;

    private UserProfile userProfile;

    public RecipeService(RecipeRepository recipeRepository, IngredientRepository ingredientRepository, RecipeIngredientRepository recipeIngredientRepository, UserProfileRepository userProfileRepository) {
        this.recipeRepository = recipeRepository;
        this.ingredientRepository = ingredientRepository;
        this.recipeIngredientRepository = recipeIngredientRepository;
//        this.userProfileRepository = userProfileRepository;

//        this.userProfile = userProfileRepository.findByUserId();
    }

    public RecipeDTO toDTO(Recipe recipe) {
        if (recipe == null) return null;
        List<RecipeIngredientDTO> ingredients = recipe.getIngredients()
                .stream()
                .map(this::toDTO)
                .toList();

       // List<Long> allergenIds = recipe.getAllergens() == null ? List.of() :
         //       recipe.getAllergens().stream().map(allergen -> allergen.getId()).toList();

        return new RecipeDTO(
                recipe.getId(),
                recipe.getName(),
                recipe.getDescription(),
                recipe.getCalories(),
                recipe.getCarbs(),
                recipe.getProtein(),
                recipe.getFat(),
                ingredients
                // allergenIds
        );
    }

    public RecipeIngredientDTO toDTO(RecipeIngredient recipeIngredient) {
        if (recipeIngredient == null) return null;
        return new RecipeIngredientDTO(
                recipeIngredient.getId(),
                recipeIngredient.getIngredient().getId(),
                recipeIngredient.getIngredient().getName(),
                recipeIngredient.getIngredient().getUnit(),
                recipeIngredient.getQuantity()
        );
    }

    public Recipe toEntity(RecipeDTO recipeDTO) {
        Recipe recipe = new Recipe();
        recipe.setId(recipeDTO.getId());
        recipe.setName(recipeDTO.getName());
        recipe.setDescription(recipeDTO.getDescription());
        recipe.setCalories(recipeDTO.getCalories());
        recipe.setCarbs(recipeDTO.getCarbs());
        recipe.setProtein(recipeDTO.getProtein());
        recipe.setFat(recipeDTO.getFat());

        List<RecipeIngredient> recipeIngredients = new ArrayList<>();
        for (RecipeIngredientDTO ingredientDTO : recipeDTO.getIngredients()) {
            Ingredient ingredient = ingredientRepository.findById(ingredientDTO.getIngredientId())
                    .orElseThrow(() -> new RuntimeException("Ingredient not found"));
            RecipeIngredient recipeIngredient = new RecipeIngredient();
            recipeIngredient.setIngredient(ingredient);
            recipeIngredient.setQuantity(ingredientDTO.getQuantity());
            recipeIngredients.add(recipeIngredient);
        }

        recipe.setIngredients(recipeIngredients);
        return recipe;
    }

    public RecipeIngredient toEntity(RecipeIngredientDTO recipeIngredientDTO) {
        RecipeIngredient recipeIngredient = new RecipeIngredient();
        Ingredient ingredient = ingredientRepository.findById(recipeIngredientDTO.getIngredientId())
                .orElseThrow(() -> new RuntimeException("Ingredient not found"));
        recipeIngredient.setIngredient(ingredient);
        recipeIngredient.setQuantity(recipeIngredientDTO.getQuantity());
        return recipeIngredient;
    }

    public List<RecipeDTO> findAll() {
        return recipeRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public RecipeDTO findById(Long id) {
        Recipe recipe = recipeRepository.findById(id).orElse(null);
        return toDTO(recipe);
    }

    public RecipeDTO save(RecipeDTO recipeDTO) {
        Recipe recipe = toEntity(recipeDTO);
        Recipe savedRecipe = recipeRepository.save(recipe);
        return toDTO(savedRecipe);
    }

    public void deleteById(Long id) {
        recipeRepository.deleteById(id);
    }

    @Transactional
    public RecipeDTO addIngredient(Long recipeId, Long ingredientId, double quantity) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));
        Ingredient ingredient = ingredientRepository.findById(ingredientId)
                .orElseThrow(() -> new RuntimeException("Ingredient not found"));

        RecipeIngredient recipeIngredient = new RecipeIngredient();
        recipeIngredient.setIngredient(ingredient);
        recipeIngredient.setQuantity(quantity);

        recipe.addIngredient(recipeIngredient);
        Recipe savedRecipe = recipeRepository.save(recipe);
        return toDTO(savedRecipe);
    }

    @Transactional
    public RecipeDTO removeIngredient(Long recipeId, Long ingredientId) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));

        RecipeIngredient recipeIngredient = recipe.getIngredients().stream()
                .filter(ri -> ri.getIngredient().getId().equals(ingredientId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Ingredient not found"));

        recipe.removeIngredient(recipeIngredient);
        recipeIngredientRepository.delete(recipeIngredient);

        Recipe savedRecipe = recipeRepository.save(recipe);
        return toDTO(savedRecipe);
    }

    public List<RecipeIngredientDTO> findAllIngredients(Long recipeId) {
        Recipe recipe = recipeRepository.findById(recipeId).orElse(null);
        if (recipe == null) return new ArrayList<>();
        return recipe.getIngredients().stream()
                .map(this::toDTO)
                .toList();
    }
}
