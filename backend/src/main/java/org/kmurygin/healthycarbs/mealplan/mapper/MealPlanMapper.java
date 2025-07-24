package org.kmurygin.healthycarbs.mealplan.mapper;

import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.MealType;
import org.kmurygin.healthycarbs.mealplan.dto.MealPlanDTO;
import org.kmurygin.healthycarbs.mealplan.dto.MealPlanRecipeDTO;
import org.kmurygin.healthycarbs.mealplan.dto.RecipeDTO;
import org.kmurygin.healthycarbs.mealplan.model.MealPlan;
import org.kmurygin.healthycarbs.mealplan.model.MealPlanRecipe;
import org.kmurygin.healthycarbs.mealplan.model.Recipe;
import org.kmurygin.healthycarbs.mealplan.repository.RecipeRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class MealPlanMapper {

    private final RecipeMapper     recipeMapper;
    private final RecipeRepository recipeRepository;

    public MealPlanDTO toDTO(MealPlan mealPlan) {
        if (mealPlan == null) return null;

        List<MealPlanRecipeDTO> dtoLinks = mealPlan.getRecipes().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return MealPlanDTO.builder()
                .id(mealPlan.getId())
                .totalCalories(mealPlan.getTotalCalories())
                .fitness(mealPlan.getFitness())
                .recipes(dtoLinks)
                .build();
    }

    private MealPlanRecipeDTO toDTO(MealPlanRecipe link) {
        RecipeDTO recipeDTO = recipeMapper.toDTO(link.getRecipe());

        return MealPlanRecipeDTO.builder()
                .id(link.getId())
                .slot(link.getSlot())
                .recipe(recipeDTO)
                .build();
    }

    public MealPlan toEntity(MealPlanDTO mealPlanDTO) {
        if (mealPlanDTO == null) return null;

        MealPlan plan = new MealPlan();
        plan.setId(mealPlanDTO.getId());
        plan.setTotalCalories(mealPlanDTO.getTotalCalories());
        plan.setFitness(mealPlanDTO.getFitness());

        if (mealPlanDTO.getRecipes() != null) {
            List<MealPlanRecipe> links = new ArrayList<>();

            for (MealPlanRecipeDTO linkDTO : mealPlanDTO.getRecipes()) {
                Recipe recipe = recipeRepository.findById(linkDTO.getRecipe().getId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Recipe", "id", linkDTO.getRecipe().getId()));

                MealType slot = linkDTO.getSlot();
                MealPlanRecipe link = new MealPlanRecipe(
                        linkDTO.getId(),
                        plan,
                        recipe,
                        slot
                );
                links.add(link);
            }
            plan.setRecipes(links);
        }
        return plan;
    }
}