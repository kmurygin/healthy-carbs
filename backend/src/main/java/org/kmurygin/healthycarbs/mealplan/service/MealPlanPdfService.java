package org.kmurygin.healthycarbs.mealplan.service;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.auth.service.AuthenticationService;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.model.MealPlan;
import org.kmurygin.healthycarbs.mealplan.model.MealPlanDay;
import org.kmurygin.healthycarbs.mealplan.repository.MealPlanRepository;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.util.PdfGeneratorService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.Map;


@Service
@RequiredArgsConstructor
public class MealPlanPdfService {

    private final MealPlanRepository mealPlanRepository;
    private final AuthenticationService authenticationService;
    private final PdfGeneratorService pdfGeneratorService;

    @Transactional(readOnly = true)
    public byte[] generateMealPlanPdf(Long mealPlanId) {
        User user = authenticationService.getCurrentUser();
        MealPlan mealPlan = mealPlanRepository.findByIdAndUser(mealPlanId, user)
                .orElseThrow(() -> new ResourceNotFoundException("MealPlan not found with id: " + mealPlanId));

        mealPlan.getDays().sort(Comparator.comparing(MealPlanDay::getDayOfWeek));

        return pdfGeneratorService.generatePdf("meal-plan-template.html", Map.of("mealPlan", mealPlan));
    }
}
