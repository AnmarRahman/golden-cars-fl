-- Enable the uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the car_view_stats table
CREATE TABLE IF NOT EXISTS car_view_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_id UUID UNIQUE NOT NULL, -- Link to the cars table, unique to prevent duplicates
    car_name TEXT NOT NULL,      -- Store the car name for persistence
    views INTEGER DEFAULT 0,     -- Store the view count
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now() -- Timestamp of last update
);

-- Create a function to update car_view_stats on car view increment
CREATE OR REPLACE FUNCTION update_car_view_stats()
RETURNS TRIGGER AS $$
DECLARE
    current_car_name TEXT;
BEGIN
    -- Get the car name from the cars table
    SELECT name INTO current_car_name FROM cars WHERE id = NEW.id;

    -- Upsert into car_view_stats
    INSERT INTO car_view_stats (car_id, car_name, views)
    VALUES (NEW.id, current_car_name, NEW.views)
    ON CONFLICT (car_id) DO UPDATE
    SET
        car_name = EXCLUDED.car_name, -- Update name in case it changed
        views = EXCLUDED.views,
        last_updated = now();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger that fires after an update on the cars table (specifically for views)
CREATE OR REPLACE TRIGGER after_car_views_update
AFTER UPDATE OF views ON cars
FOR EACH ROW
EXECUTE FUNCTION update_car_view_stats();
