CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        role VARCHAR(255) NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS allergens (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS ingredients (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        unit VARCHAR(50),
        calories_per_unit NUMERIC(10,2),
        carbs_per_unit NUMERIC(10,2),
        protein_per_unit NUMERIC(10,2),
        fat_per_unit NUMERIC(10,2)
);

CREATE TABLE IF NOT EXISTS recipes (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        calories INTEGER,
        carbs INTEGER,
        protein INTEGER,
        fat INTEGER,
        diet_type SMALLINT,
        meal_type SMALLINT
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
        id BIGSERIAL PRIMARY KEY,
        recipe_id BIGINT NOT NULL,
        ingredient_id BIGINT NOT NULL,
        quantity NUMERIC(10,2),
        CONSTRAINT fk_recipe_ri FOREIGN KEY (recipe_id)
            REFERENCES recipes(id) ON DELETE CASCADE,
        CONSTRAINT fk_ingredient_ri FOREIGN KEY (ingredient_id)
            REFERENCES ingredients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_profiles (
     id SERIAL PRIMARY KEY,
     user_id BIGINT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
     weight DOUBLE PRECISION,
     height DOUBLE PRECISION,
     age INTEGER,
     gender INTEGER,
     diet_type INTEGER,
     activity_level INTEGER,
     calories_per_day DOUBLE PRECISION,
     carbs_per_day DOUBLE PRECISION,
     protein_per_day DOUBLE PRECISION,
     fat_per_day DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS meal_plans (
      id BIGSERIAL PRIMARY KEY,
      total_calories DOUBLE PRECISION,
      fitness DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS meal_plan_recipes (
     id BIGSERIAL PRIMARY KEY,
     meal_plan_id BIGINT NOT NULL,
     recipe_id BIGINT NOT NULL,
     slot SMALLINT,
     CONSTRAINT fk_meal_plan_mpr FOREIGN KEY (meal_plan_id)
         REFERENCES meal_plans(id) ON DELETE CASCADE,
     CONSTRAINT fk_recipe_mpr FOREIGN KEY (recipe_id)
         REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recipe_allergens (
    recipe_id BIGINT,
    allergen_id BIGINT,
    PRIMARY KEY (recipe_id, allergen_id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (allergen_id) REFERENCES allergens(id) ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION update_recipe_totals()
    RETURNS TRIGGER AS '
BEGIN
    UPDATE recipes
    SET calories = COALESCE(sums.total_calories, 0),
        carbs = COALESCE(sums.total_carbs, 0),
        protein = COALESCE(sums.total_protein, 0),
        fat = COALESCE(sums.total_fat, 0)
    FROM (
             SELECT ri.recipe_id,
                    SUM(i.calories_per_unit * ri.quantity) AS total_calories,
                    SUM(i.carbs_per_unit * ri.quantity) AS total_carbs,
                    SUM(i.protein_per_unit * ri.quantity) AS total_protein,
                    SUM(i.fat_per_unit * ri.quantity) AS total_fat
             FROM recipe_ingredients ri
                      JOIN ingredients i ON i.id = ri.ingredient_id
             WHERE ri.recipe_id = COALESCE(NEW.recipe_id, OLD.recipe_id)
             GROUP BY ri.recipe_id
         ) AS sums
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

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

CREATE INDEX IF NOT EXISTS idx_recipes_diet_type ON recipes(diet_type);
CREATE INDEX IF NOT EXISTS idx_recipes_meal_type ON recipes(meal_type);

CREATE INDEX IF NOT EXISTS idx_ingredients_name ON ingredients(name);

CREATE INDEX IF NOT EXISTS idx_ri_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_ri_ingredient_id ON recipe_ingredients(ingredient_id);

CREATE INDEX IF NOT EXISTS idx_mpr_meal_plan_id ON meal_plan_recipes(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_mpr_recipe_id ON meal_plan_recipes(recipe_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
