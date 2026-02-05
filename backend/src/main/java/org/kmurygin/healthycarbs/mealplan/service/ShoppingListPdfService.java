package org.kmurygin.healthycarbs.mealplan.service;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.IngredientCategory;
import org.kmurygin.healthycarbs.mealplan.model.ShoppingList;
import org.kmurygin.healthycarbs.mealplan.model.ShoppingListItem;
import org.kmurygin.healthycarbs.util.PdfGeneratorService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShoppingListPdfService {

    private final ShoppingListService shoppingListService;
    private final PdfGeneratorService pdfGeneratorService;

    public byte[] generateShoppingListPdf(Long mealPlanId) {
        ShoppingList shoppingList = shoppingListService.getShoppingList(mealPlanId);

        Map<IngredientCategory, List<ShoppingListItem>> itemsByCategory = shoppingList.getItems().stream()
                .collect(Collectors.groupingBy(item -> item.getIngredient().getCategory()));

        return pdfGeneratorService.generatePdf(
                "shopping-list-template.html",
                Map.of("shoppingListItems", itemsByCategory)
        );
    }
}
