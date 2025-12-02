package org.kmurygin.healthycarbs.mealplan.service;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.exception.BadRequestException;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.model.Ingredient;
import org.kmurygin.healthycarbs.mealplan.repository.IngredientRepository;
import org.kmurygin.healthycarbs.mealplan.repository.RecipeIngredientRepository;
import org.kmurygin.healthycarbs.user.Role;
import org.kmurygin.healthycarbs.user.User;
import org.kmurygin.healthycarbs.user.UserService;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class IngredientService {

    private final IngredientRepository ingredientRepository;
    private final UserService userService;
    private final RecipeIngredientRepository recipeIngredientRepository;

    public List<Ingredient> findAll() {
        return ingredientRepository.findAll();
    }

    public Ingredient findById(Long id) {
        return ingredientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient", "id", id));
    }

    public Ingredient create(Ingredient ingredient) {
        ingredient.setAuthor(userService.getCurrentUser());
        return ingredientRepository.save(ingredient);
    }

    public Ingredient update(Long id, Ingredient updatedIngredient) {
        Ingredient ingredient = ingredientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient", "id", id));
        User currentUser = userService.getCurrentUser();

        if (!ingredient.getAuthor().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
            throw new SecurityException("You are not authorized to update this ingredient.");
        }

        return ingredientRepository.save(ingredient);
    }

    public void deleteById(Long id) {
        Ingredient ingredient = findById(id);
        User currentUser = userService.getCurrentUser();

        if (!ingredient.getAuthor().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
            throw new SecurityException("You are not authorized to delete this ingredient.");
        }
        if (recipeIngredientRepository.existsByIngredientId(id)) {
            throw new BadRequestException("Cannot delete ingredient because it is used in one or more recipes.");
        }
        ingredientRepository.delete(ingredient);
    }
}
