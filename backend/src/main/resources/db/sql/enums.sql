DO
$$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender') THEN
            CREATE TYPE gender AS ENUM ('MALE', 'FEMALE', 'OTHER');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'diet_type') THEN
            CREATE TYPE diet_type AS ENUM ('KETO', 'VEGAN', 'PALEO', 'BALANCED', 'STANDARD', 'VEGETARIAN', 'MEDITERRANEAN');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_level') THEN
            CREATE TYPE activity_level AS ENUM ('SEDENTARY', 'LIGHT', 'MODERATE', 'HIGH', 'EXTREME');
        END IF;
    END
$$;
