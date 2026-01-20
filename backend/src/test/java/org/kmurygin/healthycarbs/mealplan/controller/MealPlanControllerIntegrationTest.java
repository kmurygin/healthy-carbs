package org.kmurygin.healthycarbs.mealplan.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.kmurygin.healthycarbs.config.JwtService;
import org.kmurygin.healthycarbs.exception.ForbiddenException;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.dto.CreateMealPlanRequest;
import org.kmurygin.healthycarbs.mealplan.dto.ManualMealPlanDayDTO;
import org.kmurygin.healthycarbs.mealplan.dto.MealPlanDTO;
import org.kmurygin.healthycarbs.mealplan.mapper.MealPlanMapper;
import org.kmurygin.healthycarbs.mealplan.model.MealPlan;
import org.kmurygin.healthycarbs.mealplan.service.MealPlanPdfService;
import org.kmurygin.healthycarbs.mealplan.service.MealPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MealPlanController.class)
@AutoConfigureMockMvc(addFilters = false)
class MealPlanControllerIntegrationTest {

    private static final String BASE_URL = "/api/v1/mealplan";

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private MealPlanService mealPlanService;
    @MockitoBean
    private MealPlanMapper mealPlanMapper;
    @MockitoBean
    private MealPlanPdfService mealPlanPdfService;
    @MockitoBean
    private JwtService jwtService;

    @Test
    void shouldGenerateMealPlan_WhenValidRequest() throws Exception {
        when(mealPlanService.generateMealPlan()).thenReturn(new MealPlan());
        when(mealPlanMapper.toDTO(any())).thenReturn(MealPlanDTO.builder().id(1L).build());

        mockMvc.perform(post(BASE_URL))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id").value(1L));
    }

    @Test
    void shouldReturnMealPlan_WhenIdExists() throws Exception {
        Long id = 1L;
        when(mealPlanService.findById(id)).thenReturn(new MealPlan());
        when(mealPlanMapper.toDTO(any())).thenReturn(MealPlanDTO.builder().id(id).build());

        mockMvc.perform(get(BASE_URL + "/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(id));
    }

    @Test
    void shouldReturnHistory_WhenRequested() throws Exception {
        when(mealPlanService.getMealPlansHistory()).thenReturn(List.of(new MealPlan()));
        when(mealPlanMapper.toDTO(any())).thenReturn(MealPlanDTO.builder().id(1L).build());

        mockMvc.perform(get(BASE_URL + "/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void shouldDownloadPdf_WhenIdExists() throws Exception {
        Long id = 1L;
        byte[] pdfContent = "PDF_CONTENT".getBytes();
        when(mealPlanPdfService.generateMealPlanPdf(id)).thenReturn(pdfContent);

        mockMvc.perform(get(BASE_URL + "/{id}/download", id))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().string(
                        "Content-Disposition", "form-data; name=\"attachment\"; filename=\"meal-plan-1.pdf\""));
    }

    @Test
    void shouldCreateManualMealPlan_WhenValidRequest() throws Exception {
        ManualMealPlanDayDTO dayDTO = new ManualMealPlanDayDTO(0, List.of(10L));
        CreateMealPlanRequest request = new CreateMealPlanRequest(
                1L,
                java.time.LocalDate.now(),
                List.of(dayDTO));

        when(mealPlanService.createManualMealPlan(any())).thenReturn(new MealPlan());
        when(mealPlanMapper.toDTO(any())).thenReturn(MealPlanDTO.builder().id(1L).build());

        mockMvc.perform(post(BASE_URL + "/manual")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id").value(1L));
    }

    @Test
    void shouldReturnBadRequest_WhenInvalidRequest() throws Exception {
        CreateMealPlanRequest request = new CreateMealPlanRequest(1L, null, List.of());

        mockMvc.perform(post(BASE_URL + "/manual")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldReturnNotFound_WhenMealPlanNotFound() throws Exception {
        Long id = 999L;
        when(mealPlanService.findById(id)).thenThrow(new ResourceNotFoundException("MealPlan", "id", id));

        mockMvc.perform(get(BASE_URL + "/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturnForbidden_WhenNotOwner() throws Exception {
        Long id = 1L;
        when(mealPlanService.findById(id)).thenThrow(new ForbiddenException("Access denied"));

        mockMvc.perform(get(BASE_URL + "/{id}", id))
                .andExpect(status().isForbidden());
    }
}
