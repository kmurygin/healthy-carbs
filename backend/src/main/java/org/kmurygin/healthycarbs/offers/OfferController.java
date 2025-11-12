package org.kmurygin.healthycarbs.offers;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.kmurygin.healthycarbs.util.ApiResponse;
import org.kmurygin.healthycarbs.util.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/v1/offers")
public class OfferController {

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
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        offerService.deleteById(id);
        return ApiResponses.success(
                HttpStatus.NO_CONTENT,
                null,
                "Offer deleted successfully"
        );
    }
}
