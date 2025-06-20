-- Drop existing policies and tables to ensure a clean slate
-- WARNING: This will delete all data in these tables!
DROP POLICY IF EXISTS "Allow public read access" ON cars;
ALTER TABLE IF EXISTS cars DISABLE ROW LEVEL SECURITY;

DROP TABLE IF EXISTS enquiries CASCADE; -- CASCADE will drop dependent objects like foreign keys
DROP TABLE IF EXISTS cars CASCADE;

-- Create the 'cars' table
CREATE TABLE IF NOT EXISTS cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  image_url TEXT,
  mileage INT NOT NULL,
  vin VARCHAR(17) UNIQUE NOT NULL,
  description TEXT,
  model_year INT,
  price NUMERIC(10, 2), -- Added price column, nullable
  views INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the 'enquiries' table
CREATE TABLE IF NOT EXISTS enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  car_id UUID REFERENCES cars(id) ON DELETE SET NULL, -- Link to the car, allow null if car is deleted
  enquiry_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Add RLS policies for 'cars' and 'enquiries' if you plan to use client-side Supabase for these tables
-- For 'cars', you might want read access for everyone
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON cars FOR SELECT USING (true);

-- For 'enquiries', only authenticated users (or admin) should be able to read/write
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
-- As discussed, server-side actions handle inserts for enquiries using the service role key.
-- If you want client-side users to submit, you'd need a policy like:
-- CREATE POLICY "Allow authenticated users to insert enquiries" ON enquiries FOR INSERT WITH CHECK (auth.role() = 'authenticated');
