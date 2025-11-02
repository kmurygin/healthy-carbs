package org.kmurygin.healthycarbs.mealplan.service;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.auth.AuthenticationService;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.MealPlanGeneratedEvent;
import org.kmurygin.healthycarbs.mealplan.dto.UpdateShoppingListItemDTO;
import org.kmurygin.healthycarbs.mealplan.model.*;
import org.kmurygin.healthycarbs.mealplan.repository.MealPlanRepository;
import org.kmurygin.healthycarbs.mealplan.repository.ShoppingListRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ShoppingListService {

    private static final Logger logger = LoggerFactory.getLogger(ShoppingListService.class);
    private final ShoppingListRepository shoppingListRepository;
    private final MealPlanRepository mealPlanRepository;
    private final AuthenticationService authenticationService;

    @Transactional
    public ShoppingList getShoppingList(Long mealPlanId) {
        mealPlanRepository.findByIdAndUser(mealPlanId, authenticationService.getCurrentUser())
                .orElseThrow(() -> new ResourceNotFoundException("MealPlan", "id", mealPlanId));

        return shoppingListRepository.findByMealPlanIdWithItems(mealPlanId)
                .orElseThrow(() -> new ResourceNotFoundException("ShoppingList", "mealPlanId", mealPlanId));
    }

    @Transactional
    public void updateShoppingListItemStatus(Long mealPlanId, UpdateShoppingListItemDTO dto) {
        ShoppingList shoppingList = shoppingListRepository.findByMealPlanIdWithItems(mealPlanId)
                .orElseThrow(() -> new ResourceNotFoundException("ShoppingList", "mealPlanId", mealPlanId));

        ShoppingListItem itemToUpdate = shoppingList.getItems().stream()
                .filter(item -> item.getIngredient().getName().equalsIgnoreCase(dto.getIngredientName()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("ShoppingListItem", "ingredientName", dto.getIngredientName()));

        itemToUpdate.setBought(dto.isBought());

        shoppingListRepository.save(shoppingList);
    }

    public void createAndSaveShoppingList(MealPlan mealPlan) {
        Map<Ingredient, Double> aggregatedIngredients = new HashMap<>();

        for (MealPlanDay day : mealPlan.getDays()) {
            for (MealPlanRecipe mealPlanRecipe : day.getRecipes()) {
                for (RecipeIngredient recipeIngredient : mealPlanRecipe.getRecipe().getIngredients()) {
                    aggregatedIngredients.merge(recipeIngredient.getIngredient(), recipeIngredient.getQuantity(), Double::sum);
                }
            }
        }

        ShoppingList shoppingList = ShoppingList.builder().mealPlan(mealPlan).build();

        List<ShoppingListItem> items = aggregatedIngredients.entrySet().stream()
                .map(entry -> ShoppingListItem.builder()
                        .ingredient(entry.getKey())
                        .totalQuantity(entry.getValue())
                        .isBought(false)
                        .build())
                .toList();

        items.forEach(shoppingList::addItem);

        shoppingListRepository.save(shoppingList);
    }

    @Transactional
    @EventListener
    public void handleMealPlanGeneratedEvent(MealPlanGeneratedEvent event) {
        logger.info("Meal plan generated event received: {}", event);
        createAndSaveShoppingList(event.mealPlan());
    }
}
