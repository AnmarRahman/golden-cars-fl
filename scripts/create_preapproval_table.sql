-- Create pre_approval_applications table
CREATE TABLE IF NOT EXISTS pre_approval_applications (
    id SERIAL PRIMARY KEY,
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    car_id INTEGER,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    ssn VARCHAR(20) NOT NULL,
    down_payment DECIMAL(10,2) NOT NULL,
    employment_status VARCHAR(50) NOT NULL,
    monthly_income DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies if needed
ALTER TABLE pre_approval_applications ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (admin) to view all
CREATE POLICY "Admin can view all pre-approval applications" 
ON pre_approval_applications FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create policy for anyone to insert (for form submissions)
CREATE POLICY "Anyone can submit pre-approval applications" 
ON pre_approval_applications FOR INSERT 
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_preapproval_reference_number ON pre_approval_applications(reference_number);
CREATE INDEX IF NOT EXISTS idx_preapproval_created_at ON pre_approval_applications(created_at);
CREATE INDEX IF NOT EXISTS idx_preapproval_car_id ON pre_approval_applications(car_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_preapproval_updated_at BEFORE UPDATE
    ON pre_approval_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
