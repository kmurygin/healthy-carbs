package org.kmurygin.healthycarbs.mealplan.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.kmurygin.healthycarbs.mealplan.dto.IngredientDTO;
import org.kmurygin.healthycarbs.mealplan.model.Ingredient;
import org.kmurygin.healthycarbs.mealplan.repository.IngredientRepository;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class IngredientServiceTest {

    @Mock
    private IngredientRepository ingredientRepository;

    @InjectMocks
    private IngredientService ingredientService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void shouldFindAllIngredients() {
        Ingredient ingredient = Ingredient.builder()
                .id(1L).name("Oats").unit("grams")
                .caloriesPerUnit(389).carbsPerUnit(66)
                .proteinPerUnit(17).fatPerUnit(7)
                .build();

        when(ingredientRepository.findAll()).thenReturn(List.of(ingredient));

        List<IngredientDTO> result = ingredientService.findAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Oats");
    }

    @Test
    void shouldFindIngredientById() {
        Ingredient ingredient = Ingredient.builder().id(1L).name("Oats").build();
        when(ingredientRepository.findById(1L)).thenReturn(Optional.of(ingredient));

        IngredientDTO result = ingredientService.findById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Oats");
    }

    @Test
    void shouldThrowIfIngredientNotFound() {
        when(ingredientRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ingredientService.findById(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void shouldSaveIngredient() {
        Ingredient ingredient = Ingredient.builder().id(1L).name("Oats").build();
        when(ingredientRepository.save(any())).thenReturn(ingredient);

        IngredientDTO dto = new IngredientDTO(1L, "Oats", "grams", 100, 50, 10, 5);
        IngredientDTO saved = ingredientService.save(dto);

        assertThat(saved.getId()).isEqualTo(1L);
        verify(ingredientRepository).save(any());
    }

    @Test
    void shouldDeleteIngredientById() {
        ingredientService.deleteById(1L);
        verify(ingredientRepository).deleteById(1L);
    }
}