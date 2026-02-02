package org.kmurygin.healthycarbs.offers.offer;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.kmurygin.healthycarbs.util.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/offers")
public class OfferController {

    private static final String ADMIN_OR_DIETITIAN = "hasAnyRole('ADMIN', 'DIETITIAN')";

    private final OfferService offerService;
    private final OfferMapper offerMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<OfferDTO>>> getAll() {
        List<OfferDTO> offers = offerService.findAll().stream()
                .map(offerMapper::toDTO)
                .toList();
        return ApiResponses.success(offers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OfferDTO>> getById(@PathVariable Long id) {
        Offer offer = offerService.findById(id);
        return ApiResponses.success(offerMapper.toDTO(offer));
    }

    @PostMapping
    @PreAuthorize(ADMIN_OR_DIETITIAN)
    public ResponseEntity<ApiResponse<OfferDTO>> create(@Valid @RequestBody OfferDTO offerDTO) {
        Offer offer = offerService.create(
                offerMapper.toEntity(offerDTO),
                offerDTO.getMealPlanTemplateId()
        );
        return ApiResponses.success(
                HttpStatus.CREATED,
                offerMapper.toDTO(offer),
                "Offer created successfully"
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize(ADMIN_OR_DIETITIAN)
    public ResponseEntity<ApiResponse<OfferDTO>> update(
            @PathVariable Long id,
            @Valid @RequestBody OfferDTO offerDTO
    ) {
        Offer offer = offerService.update(
                id,
                offerMapper.toEntity(offerDTO),
                offerDTO.getMealPlanTemplateId()
        );
        return ApiResponses.success(offerMapper.toDTO(offer));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(ADMIN_OR_DIETITIAN)
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        offerService.deleteById(id);
        return ApiResponses.success(
                HttpStatus.NO_CONTENT,
                null,
                "Offer deleted successfully"
        );
    }
}
