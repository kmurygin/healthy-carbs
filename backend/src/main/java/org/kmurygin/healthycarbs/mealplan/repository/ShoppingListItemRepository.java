package org.kmurygin.healthycarbs.mealplan.repository;

import org.kmurygin.healthycarbs.mealplan.model.ShoppingListItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShoppingListItemRepository extends JpaRepository<ShoppingListItem, Long> {
}
