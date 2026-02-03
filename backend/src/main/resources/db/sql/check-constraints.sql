ALTER TABLE ingredients
    ADD CONSTRAINT chk_ingredients_calories CHECK (calories_per_unit >= 0),
    ADD CONSTRAINT chk_ingredients_carbs CHECK (carbs_per_unit >= 0),
    ADD CONSTRAINT chk_ingredients_protein CHECK (protein_per_unit >= 0),
    ADD CONSTRAINT chk_ingredients_fat CHECK (fat_per_unit >= 0);

ALTER TABLE recipe_ingredients
    ADD CONSTRAINT chk_ri_quantity_positive CHECK (quantity > 0);

ALTER TABLE orders
    ADD CONSTRAINT chk_orders_amount_positive CHECK (total_amount > 0);

ALTER TABLE user_measurements
    ADD CONSTRAINT chk_measurement_weight_positive CHECK (weight > 0);
