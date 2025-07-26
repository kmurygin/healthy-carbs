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