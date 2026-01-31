package org.kmurygin.healthycarbs.mealplan.service;

import com.itextpdf.html2pdf.HtmlConverter;
import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.auth.service.AuthenticationService;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.model.MealPlan;
import org.kmurygin.healthycarbs.mealplan.model.MealPlanDay;
import org.kmurygin.healthycarbs.mealplan.repository.MealPlanRepository;
import org.kmurygin.healthycarbs.user.model.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.io.ByteArrayOutputStream;
import java.util.Comparator;


@Service
@RequiredArgsConstructor
public class MealPlanPdfService {

    private final MealPlanRepository mealPlanRepository;
    private final AuthenticationService authenticationService;
    private final SpringTemplateEngine templateEngine;

    @Transactional(readOnly = true)
    public byte[] generateMealPlanPdf(Long mealPlanId) {
        User user = authenticationService.getCurrentUser();
        MealPlan mealPlan = mealPlanRepository.findByIdAndUser(mealPlanId, user)
                .orElseThrow(() -> new ResourceNotFoundException("MealPlan not found with id: " + mealPlanId));

        mealPlan.getDays().sort(Comparator.comparing(MealPlanDay::getDayOfWeek));

        Context context = new Context();
        context.setVariable("mealPlan", mealPlan);
        String processedHtml = templateEngine.process("meal-plan-template.html", context);
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        HtmlConverter.convertToPdf(processedHtml, byteArrayOutputStream);

        return byteArrayOutputStream.toByteArray();
    }
}
