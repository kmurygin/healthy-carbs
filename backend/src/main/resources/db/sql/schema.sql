CREATE TABLE IF NOT EXISTS users
(
    id        BIGSERIAL PRIMARY KEY,
    username  VARCHAR(255) NOT NULL UNIQUE,
    password  VARCHAR(255) NOT NULL,
    email     VARCHAR(255) NOT NULL UNIQUE,
    role      VARCHAR(255) NOT NULL,
    firstname VARCHAR(255),
    lastname  VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS allergens
(
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS ingredients
(
    id                BIGSERIAL PRIMARY KEY,
    name              VARCHAR(255) NOT NULL UNIQUE,
    unit              VARCHAR(50),
    calories_per_unit DOUBLE PRECISION,
    carbs_per_unit    DOUBLE PRECISION,
    protein_per_unit  DOUBLE PRECISION,
    fat_per_unit      DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS recipes
(
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    calories    DOUBLE PRECISION,
    carbs       DOUBLE PRECISION,
    protein     DOUBLE PRECISION,
    fat         DOUBLE PRECISION,
    diet_type   VARCHAR(50),
    meal_type   VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS recipe_ingredients
(
    id            BIGSERIAL PRIMARY KEY,
    recipe_id     BIGINT           NOT NULL REFERENCES recipes (id) ON DELETE CASCADE,
    ingredient_id BIGINT           NOT NULL REFERENCES ingredients (id) ON DELETE CASCADE,
    quantity      DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS meal_plans
(
    id             BIGSERIAL PRIMARY KEY,
    total_calories DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS meal_plan_recipes
(
    id           BIGSERIAL PRIMARY KEY,
    meal_plan_id BIGINT NOT NULL REFERENCES meal_plans (id) ON DELETE CASCADE,
    recipe_id    BIGINT NOT NULL REFERENCES recipes (id) ON DELETE CASCADE,
    meal_type    VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS user_profiles
(
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    weight           DOUBLE PRECISION,
    height           DOUBLE PRECISION,
    age              INTEGER,
    gender           VARCHAR(20),
    diet_type        VARCHAR(20),
    activity_level   VARCHAR(20),
    calories_per_day DOUBLE PRECISION,
    carbs_per_day    DOUBLE PRECISION,
    protein_per_day  DOUBLE PRECISION,
    fat_per_day      DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS recipe_allergens
(
    recipe_id   BIGINT REFERENCES recipes (id) ON DELETE CASCADE,
    allergen_id BIGINT REFERENCES allergens (id) ON DELETE CASCADE,
    PRIMARY KEY (recipe_id, allergen_id)
);
