CREATE OR REPLACE FUNCTION update_meal_plan_day_totals()
    RETURNS TRIGGER AS
$$
BEGIN
    UPDATE meal_plan_days
    SET total_calories = COALESCE(sums.total_calories, 0),
        total_carbs    = COALESCE(sums.total_carbs, 0),
        total_protein  = COALESCE(sums.total_protein, 0),
        total_fat      = COALESCE(sums.total_fat, 0)
    FROM (SELECT mpr.meal_plan_day_id,
                 SUM(r.calories) AS total_calories,
                 SUM(r.carbs)    AS total_carbs,
                 SUM(r.protein)  AS total_protein,
                 SUM(r.fat)      AS total_fat
          FROM meal_plan_recipes mpr
                   JOIN recipes r ON r.id = mpr.recipe_id
          WHERE mpr.meal_plan_day_id = COALESCE(NEW.meal_plan_day_id, OLD.meal_plan_day_id)
          GROUP BY mpr.meal_plan_day_id) AS sums
    WHERE meal_plan_days.id = sums.meal_plan_day_id;

    UPDATE meal_plans
    SET total_calories = COALESCE(day_sums.total_calories, 0),
        total_carbs    = COALESCE(day_sums.total_carbs, 0),
        total_protein  = COALESCE(day_sums.total_protein, 0),
        total_fat      = COALESCE(day_sums.total_fat, 0)
    FROM (SELECT mpd.meal_plan_id,
                 SUM(mpd.total_calories) AS total_calories,
                 SUM(mpd.total_carbs)    AS total_carbs,
                 SUM(mpd.total_protein)  AS total_protein,
                 SUM(mpd.total_fat)      AS total_fat
          FROM meal_plan_days mpd
          WHERE mpd.meal_plan_id = (SELECT meal_plan_id
                                    FROM meal_plan_days
                                    WHERE id = COALESCE(NEW.meal_plan_day_id, OLD.meal_plan_day_id))
          GROUP BY mpd.meal_plan_id) AS day_sums
    WHERE meal_plans.id = day_sums.meal_plan_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_meal_plan_day_totals ON meal_plan_recipes;

CREATE TRIGGER trg_update_meal_plan_day_totals
    AFTER INSERT OR UPDATE OR DELETE
    ON meal_plan_recipes
    FOR EACH ROW
EXECUTE FUNCTION update_meal_plan_day_totals();
