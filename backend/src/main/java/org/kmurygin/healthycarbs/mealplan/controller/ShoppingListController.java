package org.kmurygin.healthycarbs.mealplan.controller;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.mealplan.dto.ShoppingListDTO;
import org.kmurygin.healthycarbs.mealplan.dto.UpdateShoppingListItemDTO;
import org.kmurygin.healthycarbs.mealplan.mapper.ShoppingListMapper;
import org.kmurygin.healthycarbs.mealplan.model.ShoppingList;
import org.kmurygin.healthycarbs.mealplan.service.ShoppingListPdfService;
import org.kmurygin.healthycarbs.mealplan.service.ShoppingListService;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.kmurygin.healthycarbs.util.ApiResponses;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/shopping-list")
@RequiredArgsConstructor
public class ShoppingListController {

    private final ShoppingListService shoppingListService;
    private final ShoppingListPdfService shoppingListPdfService;
    private final ShoppingListMapper shoppingListMapper;

    @GetMapping("/{mealPlanId}")
    public ResponseEntity<ApiResponse<ShoppingListDTO>> getShoppingList(@PathVariable Long mealPlanId) {
        ShoppingList shoppingListModel = shoppingListService.getShoppingList(mealPlanId);
        ShoppingListDTO shoppingListDTO = shoppingListMapper.toDTO(shoppingListModel);
        return ApiResponses.success(HttpStatus.OK, shoppingListDTO, "Shopping list retrieved successfully.");
    }

    @PutMapping("/{mealPlanId}/item")
    public ResponseEntity<ApiResponse<Void>> updateShoppingListItem(
            @PathVariable Long mealPlanId,
            @RequestBody UpdateShoppingListItemDTO dto) {

        shoppingListService.updateShoppingListItemStatus(mealPlanId, dto);
        return ApiResponses.success(HttpStatus.OK, null, "Shopping list item updated successfully.");
    }

    @GetMapping("/{mealPlanId}/download")
    public ResponseEntity<byte[]> downloadShoppingListPdf(@PathVariable Long mealPlanId) {
        byte[] pdfBytes = shoppingListPdfService.generateShoppingListPdf(mealPlanId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        String filename = "shopping-list-" + mealPlanId + ".pdf";
        headers.setContentDispositionFormData("attachment", filename);
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
