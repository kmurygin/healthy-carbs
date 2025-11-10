package org.kmurygin.healthycarbs.mealplan.service;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.DietType;
import org.kmurygin.healthycarbs.mealplan.DietTypeUtil;
import org.kmurygin.healthycarbs.mealplan.MealType;
import org.kmurygin.healthycarbs.mealplan.dto.RecipeIngredientDTO;
import org.kmurygin.healthycarbs.mealplan.mapper.RecipeIngredientMapper;
import org.kmurygin.healthycarbs.mealplan.mapper.RecipeMapper;
import org.kmurygin.healthycarbs.mealplan.model.Ingredient;
import org.kmurygin.healthycarbs.mealplan.model.Recipe;
import org.kmurygin.healthycarbs.mealplan.model.RecipeIngredient;
import org.kmurygin.healthycarbs.mealplan.repository.IngredientRepository;
import org.kmurygin.healthycarbs.mealplan.repository.RecipeRepository;
import org.kmurygin.healthycarbs.mealplan.repository.RecipeSpecification;
import org.kmurygin.healthycarbs.user.User;
import org.kmurygin.healthycarbs.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;

@RequiredArgsConstructor
@Service
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;
    private final RecipeIngredientMapper recipeIngredientMapper;
    private final RecipeMapper recipeMapper;
    private final UserRepository userRepository;

    public Page<Recipe> findAll(
            String name,
            String ingredient,
            DietType dietType,
            MealType mealType,
            Long userId,
            Pageable pageable
    ) {
        List<Specification<Recipe>> recipeSpecifications = new ArrayList<>();

        if (name != null && !name.trim().isEmpty()) {
            recipeSpecifications.add(RecipeSpecification.hasName(name));
        }
        if (ingredient != null && !ingredient.trim().isEmpty()) {
            recipeSpecifications.add(RecipeSpecification.hasIngredient(ingredient));
        }
        if (dietType != null) {
            recipeSpecifications.add(RecipeSpecification.hasDietType(dietType));
        }
        if (mealType != null) {
            recipeSpecifications.add(RecipeSpecification.hasMealType(mealType));
        }
        if (userId != null) {
            recipeSpecifications.add(RecipeSpecification.isFavourite(userId));
        }
        Specification<Recipe> finalSpec = Specification.allOf(recipeSpecifications);

        return recipeRepository.findAll(finalSpec, pageable);
    }

    public List<Recipe> findAll() {
        return recipeRepository.findAll();
    }

    public Recipe findById(Long id) {
        return recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", id));
    }

    public Recipe create(Recipe recipe) {
        return recipeRepository.save(recipe);
    }

    @Transactional
    public Recipe update(Long id, Recipe updatedRecipe) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", id));

        recipeMapper.updateFromEntity(updatedRecipe, recipe);
        return recipeRepository.save(recipe);
    }

    public void deleteById(Long id) {
        recipeRepository.deleteById(id);
    }

    @Transactional
    public Recipe addIngredient(Long recipeId, Long ingredientId, double quantity) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", recipeId));
        Ingredient ingredient = ingredientRepository.findById(ingredientId)
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient", "id", ingredientId));

        RecipeIngredient recipeIngredient = new RecipeIngredient();
        recipeIngredient.setIngredient(ingredient);
        recipeIngredient.setQuantity(quantity);

        recipe.addIngredient(recipeIngredient);
        return recipeRepository.save(recipe);
    }

    @Transactional
    public Recipe removeIngredient(Long recipeId, Long ingredientId) {
        Recipe recipe = findById(recipeId);

        RecipeIngredient recipeIngredient = recipe.getIngredients().stream()
                .filter(ri -> ri.getIngredient().getId().equals(ingredientId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient", "id", ingredientId));

        recipe.removeIngredient(recipeIngredient);

        return recipeRepository.save(recipe);
    }

    public List<RecipeIngredientDTO> findAllIngredients(Long recipeId) {
        Recipe recipe = this.findById(recipeId);
        return recipe.getIngredients().stream()
                .map(recipeIngredientMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public Recipe findRandomForMealPlan(MealType mealType, DietType dietType) {
        Set<DietType> compatibleDietTypes = DietTypeUtil.getCompatibleDietTypes(dietType);
        List<Long> recipeIds = recipeRepository.findIdsByMealTypeAndDietTypes(mealType, compatibleDietTypes);
        if (recipeIds.isEmpty()) {
            throw new ResourceNotFoundException(
                    "Recipe not found for mealType: " + mealType + " and dietType: " + dietType
            );
        }
        Long randomId = recipeIds.get(ThreadLocalRandom.current().nextInt(recipeIds.size()));
        return recipeRepository.findByIdWithIngredients(randomId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", randomId));
    }

    @Transactional(readOnly = true)
    public Recipe findRandom(MealType mealType, DietType dietType) {
        List<Long> recipeIds = recipeRepository.findIdsByMealTypeAndDietType(mealType, dietType);
        if (recipeIds.isEmpty()) {
            throw new ResourceNotFoundException(
                    "Recipe not found for mealType: " + mealType + " and dietType: " + dietType
            );
        }
        Long randomId = recipeIds.get(ThreadLocalRandom.current().nextInt(recipeIds.size()));
        return recipeRepository.findByIdWithIngredients(randomId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", randomId));
    }

    @Transactional
    public void addFavourite(Long recipeId, Long userId) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", recipeId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.addFavouriteRecipe(recipe);
        userRepository.save(user);
    }

    @Transactional
    public void removeFavourite(Long recipeId, Long userId) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", recipeId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.removeFavouriteRecipe(recipe);
        userRepository.save(user);
    }
}
