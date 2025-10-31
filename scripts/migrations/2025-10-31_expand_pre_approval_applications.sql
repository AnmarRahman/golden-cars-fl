-- Migration: expand pre_approval_applications to include full application fields
-- Safe-guard: only add columns if they do not already exist
DO $$
BEGIN
  -- Address fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='pre_approval_applications' AND column_name='street_address'
  ) THEN
    ALTER TABLE pre_approval_applications ADD COLUMN street_address TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='pre_approval_applications' AND column_name='unit_apt'
  ) THEN
    ALTER TABLE pre_approval_applications ADD COLUMN unit_apt TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='pre_approval_applications' AND column_name='city'
  ) THEN
    ALTER TABLE pre_approval_applications ADD COLUMN city TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='pre_approval_applications' AND column_name='state'
  ) THEN
    ALTER TABLE pre_approval_applications ADD COLUMN state TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='pre_approval_applications' AND column_name='zip'
  ) THEN
    ALTER TABLE pre_approval_applications ADD COLUMN zip TEXT;
  END IF;

  -- Housing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='pre_approval_applications' AND column_name='housing_status'
  ) THEN
    ALTER TABLE pre_approval_applications ADD COLUMN housing_status TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='pre_approval_applications' AND column_name='monthly_housing_payment'
  ) THEN
    ALTER TABLE pre_approval_applications ADD COLUMN monthly_housing_payment NUMERIC(12,2);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='pre_approval_applications' AND column_name='time_at_address_years'
  ) THEN
    ALTER TABLE pre_approval_applications ADD COLUMN time_at_address_years TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='pre_approval_applications' AND column_name='time_at_address_months'
  ) THEN
    ALTER TABLE pre_approval_applications ADD COLUMN time_at_address_months TEXT;
  END IF;

  -- Employment
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='pre_approval_applications' AND column_name='employer_name'
  ) THEN
    ALTER TABLE pre_approval_applications ADD COLUMN employer_name TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='pre_approval_applications' AND column_name='job_title'
  ) THEN
    ALTER TABLE pre_approval_applications ADD COLUMN job_title TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='pre_approval_applications' AND column_name='employer_phone'
  ) THEN
    ALTER TABLE pre_approval_applications ADD COLUMN employer_phone TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='pre_approval_applications' AND column_name='time_at_job_years'
  ) THEN
    ALTER TABLE pre_approval_applications ADD COLUMN time_at_job_years TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='pre_approval_applications' AND column_name='time_at_job_months'
  ) THEN
    ALTER TABLE pre_approval_applications ADD COLUMN time_at_job_months TEXT;
  END IF;

  -- Other income
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='pre_approval_applications' AND column_name='other_income_source'
  ) THEN
    ALTER TABLE pre_approval_applications ADD COLUMN other_income_source TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='pre_approval_applications' AND column_name='other_monthly_income'
  ) THEN
    ALTER TABLE pre_approval_applications ADD COLUMN other_monthly_income NUMERIC(12,2);
  END IF;

  -- Vehicle fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='pre_approval_applications' AND column_name='vehicle_year'
  ) THEN
    ALTER TABLE pre_approval_applications ADD COLUMN vehicle_year TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='pre_approval_applications' AND column_name='vehicle_make'
  ) THEN
    ALTER TABLE pre_approval_applications ADD COLUMN vehicle_make TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='pre_approval_applications' AND column_name='vehicle_model'
  ) THEN
    ALTER TABLE pre_approval_applications ADD COLUMN vehicle_model TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='pre_approval_applications' AND column_name='vehicle_trim'
  ) THEN
    ALTER TABLE pre_approval_applications ADD COLUMN vehicle_trim TEXT;
  END IF;
END $$;
