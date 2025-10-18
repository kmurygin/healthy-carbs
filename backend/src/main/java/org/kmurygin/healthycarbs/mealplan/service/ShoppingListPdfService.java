package org.kmurygin.healthycarbs.mealplan.service;

import com.itextpdf.html2pdf.HtmlConverter;
import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.IngredientCategory;
import org.kmurygin.healthycarbs.mealplan.model.ShoppingList;
import org.kmurygin.healthycarbs.mealplan.model.ShoppingListItem;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShoppingListPdfService {

    private final ShoppingListService shoppingListService;
    private final SpringTemplateEngine templateEngine;

    public byte[] generateShoppingListPdf(Long mealPlanId) {
        ShoppingList shoppingList = shoppingListService.getShoppingList(mealPlanId);

        Map<IngredientCategory, List<ShoppingListItem>> itemsByCategory = shoppingList.getItems().stream()
                .collect(Collectors.groupingBy(item -> item.getIngredient().getCategory()));

        Context context = new Context();
        context.setVariable("shoppingListItems", itemsByCategory);
        String processedHtml = templateEngine.process("shopping-list-template.html", context);
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        HtmlConverter.convertToPdf(processedHtml, byteArrayOutputStream);

        return byteArrayOutputStream.toByteArray();
    }
}