package org.kmurygin.healthycarbs.mealplan.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kmurygin.healthycarbs.mealplan.dto.CreateMealPlanRequest;
import org.kmurygin.healthycarbs.mealplan.dto.MealPlanDTO;
import org.kmurygin.healthycarbs.mealplan.mapper.MealPlanMapper;
import org.kmurygin.healthycarbs.mealplan.model.MealPlan;
import org.kmurygin.healthycarbs.mealplan.service.MealPlanPdfService;
import org.kmurygin.healthycarbs.mealplan.service.MealPlanService;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MealPlanControllerUnitTest {

    @Mock
    private MealPlanService mealPlanService;
    @Mock
    private MealPlanMapper mealPlanMapper;
    @Mock
    private MealPlanPdfService mealPlanPdfService;

    private MealPlanController mealPlanController;

    @BeforeEach
    void setUp() {
        mealPlanController = new MealPlanController(
                mealPlanService,
                mealPlanMapper,
                mealPlanPdfService
        );
    }

    @Test
    void generateMealPlan_shouldReturnCreated_andMapDto() {
        MealPlan mealPlan = new MealPlan();
        MealPlanDTO dto = mock(MealPlanDTO.class);

        when(mealPlanService.generateMealPlan()).thenReturn(mealPlan);
        when(mealPlanMapper.toDTO(mealPlan)).thenReturn(dto);

        ResponseEntity<ApiResponse<MealPlanDTO>> response = mealPlanController.generateMealPlan();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();

        verify(mealPlanService).generateMealPlan();
        verify(mealPlanMapper).toDTO(mealPlan);
        verifyNoMoreInteractions(mealPlanService, mealPlanMapper, mealPlanPdfService);
    }

    @Test
    void findById_shouldReturnOk_andMapDto() {
        long id = 8L;
        MealPlan mealPlan = new MealPlan();
        MealPlanDTO dto = mock(MealPlanDTO.class);

        when(mealPlanService.findById(id)).thenReturn(mealPlan);
        when(mealPlanMapper.toDTO(mealPlan)).thenReturn(dto);

        ResponseEntity<ApiResponse<MealPlanDTO>> response = mealPlanController.findById(id);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();

        verify(mealPlanService).findById(id);
        verify(mealPlanMapper).toDTO(mealPlan);
        verifyNoMoreInteractions(mealPlanService, mealPlanMapper, mealPlanPdfService);
    }

    @Test
    void findAllMealPlans_shouldReturnOk_andMapAllPlans() {
        MealPlan mealPlan1 = new MealPlan();
        MealPlan mealPlan2 = new MealPlan();
        MealPlanDTO day1 = mock(MealPlanDTO.class);
        MealPlanDTO day2 = mock(MealPlanDTO.class);

        when(mealPlanService.getMealPlansHistory()).thenReturn(List.of(mealPlan1, mealPlan2));
        when(mealPlanMapper.toDTO(mealPlan1)).thenReturn(day1);
        when(mealPlanMapper.toDTO(mealPlan2)).thenReturn(day2);

        ResponseEntity<ApiResponse<List<MealPlanDTO>>> response = mealPlanController.findAllMealPlans();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();

        verify(mealPlanService).getMealPlansHistory();
        verify(mealPlanMapper).toDTO(mealPlan1);
        verify(mealPlanMapper).toDTO(mealPlan2);
        verifyNoMoreInteractions(mealPlanService, mealPlanMapper, mealPlanPdfService);
    }

    @Test
    void downloadMealPlanPdf_shouldReturnPdfBytes_withHeaders() {
        long id = 7L;
        byte[] pdf = new byte[]{1, 2, 3};

        when(mealPlanPdfService.generateMealPlanPdf(id)).thenReturn(pdf);

        ResponseEntity<byte[]> response = mealPlanController.downloadMealPlanPdf(id);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(pdf);

        HttpHeaders headers = response.getHeaders();
        assertThat(headers.getContentType()).isEqualTo(MediaType.APPLICATION_PDF);
        assertThat(headers.getContentDisposition()).isNotNull();

        assertThat(headers.getContentDisposition().getFilename()).isEqualTo("meal-plan-" + id + ".pdf");
        assertThat(headers.getCacheControl()).contains("must-revalidate");

        verify(mealPlanPdfService).generateMealPlanPdf(id);
        verifyNoMoreInteractions(mealPlanService, mealPlanMapper, mealPlanPdfService);
    }

    @Test
    void createManualMealPlan_shouldReturnCreated_andMapDto() {
        CreateMealPlanRequest request = mock(CreateMealPlanRequest.class);
        MealPlan mealPlan = new MealPlan();
        MealPlanDTO dto = mock(MealPlanDTO.class);

        when(mealPlanService.createManualMealPlan(request)).thenReturn(mealPlan);
        when(mealPlanMapper.toDTO(mealPlan)).thenReturn(dto);

        ResponseEntity<ApiResponse<MealPlanDTO>> response = mealPlanController.createManualMealPlan(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();

        verify(mealPlanService).createManualMealPlan(request);
        verify(mealPlanMapper).toDTO(mealPlan);
        verifyNoMoreInteractions(mealPlanService, mealPlanMapper, mealPlanPdfService);
    }
}
