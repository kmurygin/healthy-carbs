package org.kmurygin.healthycarbs.mealplan.service;

import lombok.RequiredArgsConstructor;
import org.kmurygin.healthycarbs.exception.ForbiddenException;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.mealplan.model.Allergen;
import org.kmurygin.healthycarbs.mealplan.repository.AllergenRepository;
import org.kmurygin.healthycarbs.user.model.Role;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class AllergenService {

    private final AllergenRepository allergenRepository;
    private final UserService userService;

    public List<Allergen> findAll() {
        return allergenRepository.findAll();
    }

    public Allergen findById(Long id) {
        return allergenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Allergen", "id", id));
    }

    public Allergen create(Allergen allergen) {
        allergen.setAuthor(userService.getCurrentUser());
        return allergenRepository.save(allergen);
    }

    @Transactional
    public Allergen update(Long id, Allergen updatedAllergen) {
        Allergen allergen = findById(id);
        User currentUser = userService.getCurrentUser();

        if (!allergen.getAuthor().getId().equals(currentUser.getId()) &&
                currentUser.getRole() != Role.ADMIN
        ) {
            throw new ForbiddenException("You are not authorized to update this allergen.");
        }

        allergen.setName(updatedAllergen.getName());
        return allergenRepository.save(allergen);
    }

    public void deleteById(Long id) {
        Allergen allergen = findById(id);
        User currentUser = userService.getCurrentUser();

        if (!allergen.getAuthor().getId().equals(currentUser.getId()) &&
                currentUser.getRole() != Role.ADMIN
        ) {
            throw new ForbiddenException("You are not authorized to delete this allergen.");
        }

        allergenRepository.deleteById(id);
    }

}
