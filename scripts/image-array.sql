-- Alter the 'image_url' column in the 'cars' table to be an array of TEXT
ALTER TABLE cars
ALTER COLUMN image_url TYPE TEXT[] USING ARRAY[image_url],
ALTER COLUMN image_url SET DEFAULT '{}'; -- Set default to an empty array

-- If there are existing rows with NULL in image_url, you might want to update them to empty arrays
UPDATE cars
SET image_url = '{}'
WHERE image_url IS NULL;
