-- Add 'trim' and 'cylinders' columns to the 'cars' table
ALTER TABLE cars
ADD COLUMN trim VARCHAR(255),
ADD COLUMN cylinders INT;
