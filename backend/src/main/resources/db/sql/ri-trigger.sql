CREATE OR REPLACE FUNCTION update_recipe_totals()
    RETURNS TRIGGER AS
'
    BEGIN
        UPDATE recipes
        SET calories = COALESCE(sums.total_calories, 0),
            carbs    = COALESCE(sums.total_carbs, 0),
            protein  = COALESCE(sums.total_protein, 0),
            fat      = COALESCE(sums.total_fat, 0)
        FROM (SELECT ri.recipe_id,
                     SUM(i.calories_per_unit * ri.quantity) AS total_calories,
                     SUM(i.carbs_per_unit * ri.quantity)    AS total_carbs,
                     SUM(i.protein_per_unit * ri.quantity)  AS total_protein,
                     SUM(i.fat_per_unit * ri.quantity)      AS total_fat
              FROM recipe_ingredients ri
                       JOIN ingredients i ON i.id = ri.ingredient_id
              WHERE ri.recipe_id = COALESCE(NEW.recipe_id, OLD.recipe_id)
              GROUP BY ri.recipe_id) AS sums
        WHERE recipes.id = sums.recipe_id;

        RETURN NEW;
    END;
' LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_recipe_totals ON recipe_ingredients;

CREATE TRIGGER trg_update_recipe_totals
    AFTER INSERT OR UPDATE OR DELETE
    ON recipe_ingredients
    FOR EACH ROW
EXECUTE FUNCTION update_recipe_totals();
