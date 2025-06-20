-- Add a new 'message' column to the 'enquiries' table
ALTER TABLE enquiries
ADD COLUMN message TEXT;

-- Optional: If you want to make the message column NOT NULL, you would do it like this
-- after ensuring existing rows have a default value or are updated:
-- ALTER TABLE enquiries
-- ALTER COLUMN message SET NOT NULL;
