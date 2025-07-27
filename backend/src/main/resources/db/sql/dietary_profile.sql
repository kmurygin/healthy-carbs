CREATE TABLE dietary_profile
(
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL,
    weight           NUMERIC(5, 2),
    height           NUMERIC(5, 2),
    age              INTEGER,
    diet_type        DIET_TYPE,
    activity_level   ACTIVITY_LEVEL,
    calories_per_day NUMERIC(7, 1),
    carbs_per_day    NUMERIC(7, 1),
    protein_per_day  NUMERIC(7, 1),
    fat_per_day      NUMERIC(7, 1),

    CONSTRAINT fk_dietary_profile_user
        FOREIGN KEY (user_id)
            REFERENCES "users" (id)
            ON UPDATE CASCADE
            ON DELETE CASCADE
);

CREATE INDEX idx_dietary_profile_user ON dietary_profile (user_id);