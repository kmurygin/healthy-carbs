CREATE TABLE IF NOT EXISTS allergnes(
                           id BIGSERIAL PRIMARY KEY,
                           name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS ingredients (
                             id BIGSERIAL PRIMARY KEY,
                             name VARCHAR(255) NOT NULL,
                             caloriesperunit NUMERIC(10,2),
                             carbsperunit NUMERIC(10,2),
                             proteinperunit NUMERIC(10,2),
                             fatperunit NUMERIC(10,2)
);

CREATE TABLE IF NOT EXISTS recipes (
                         id BIGSERIAL PRIMARY KEY,
                         name VARCHAR(255) NOT NULL UNIQUE,
                         description TEXT,
                         calories INTEGER,
                         carbs INTEGER,
                         protein INTEGER,
                         fat INTEGER
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
                                    id BIGSERIAL PRIMARY KEY,
                                    recipe_id BIGINT NOT NULL,
                                    ingredient_id BIGINT NOT NULL,
                                    quantity NUMERIC(10,2),
                                    CONSTRAINT fk_recipe
                                        FOREIGN KEY (recipe_id)
                                            REFERENCES recipes(id)
                                            ON DELETE CASCADE,
                                    CONSTRAINT fk_ingredient
                                        FOREIGN KEY (ingredient_id)
                                            REFERENCES ingredients(id)
                                            ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_profiles (
                               id SERIAL PRIMARY KEY,
                               user_id BIGINT UNIQUE REFERENCES users(id),

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