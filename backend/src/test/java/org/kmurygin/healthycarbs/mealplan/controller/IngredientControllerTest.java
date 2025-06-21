package org.kmurygin.healthycarbs.mealplan.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.kmurygin.healthycarbs.mealplan.dto.IngredientDTO;
import org.kmurygin.healthycarbs.mealplan.service.IngredientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class IngredientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IngredientService ingredientService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldGetAllIngredients() throws Exception {
        IngredientDTO dto = new IngredientDTO(1L, "Oats", "grams", 100, 50, 10, 5);
        when(ingredientService.findAll()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/v1/ingredients"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Oats"));
    }

    @Test
    void shouldGetIngredientById() throws Exception {
        IngredientDTO dto = new IngredientDTO(1L, "Oats", "grams", 100, 50, 10, 5);
        when(ingredientService.findById(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/v1/ingredients/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Oats"));
    }

    @Test
    void shouldCreateIngredient() throws Exception {
        IngredientDTO dto = new IngredientDTO(null, "Oats", "grams", 100, 50, 10, 5);
        IngredientDTO saved = new IngredientDTO(1L, "Oats", "grams", 100, 50, 10, 5);
        when(ingredientService.save(any())).thenReturn(saved);

        mockMvc.perform(post("/api/v1/ingredients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void shouldUpdateIngredient() throws Exception {
        IngredientDTO dto = new IngredientDTO(1L, "Oats", "grams", 100, 50, 10, 5);
        when(ingredientService.save(any())).thenReturn(dto);

        mockMvc.perform(put("/api/v1/ingredients/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Oats"));
    }

    @Test
    void shouldDeleteIngredient() throws Exception {
        doNothing().when(ingredientService).deleteById(1L);

        mockMvc.perform(delete("/api/v1/ingredients/1"))
                .andExpect(status().isOk());
    }
}