-- Migration: expand pre_approval_applications to include ALL fields used by the UI forms
-- Idempotent: every ALTER is guarded with IF NOT EXISTS so it can be run safely multiple times.

DO $$
BEGIN
  -- Core personal fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pre_approval_applications' AND column_name='date_of_birth') THEN
    ALTER TABLE pre_approval_applications ADD COLUMN date_of_birth date;
  END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pre_approval_applications' AND column_name='middle_name') THEN
    ALTER TABLE pre_approval_applications ADD COLUMN middle_name text;
  END IF;

  -- Address fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pre_approval_applications' AND column_name='street_address') THEN
    ALTER TABLE pre_approval_applications ADD COLUMN street_address text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pre_approval_applications' AND column_name='unit_apt') THEN
    ALTER TABLE pre_approval_applications ADD COLUMN unit_apt text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pre_approval_applications' AND column_name='city') THEN
    ALTER TABLE pre_approval_applications ADD COLUMN city text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pre_approval_applications' AND column_name='state') THEN
    ALTER TABLE pre_approval_applications ADD COLUMN state text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pre_approval_applications' AND column_name='zip') THEN
    ALTER TABLE pre_approval_applications ADD COLUMN zip text;
  END IF;

  -- Housing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pre_approval_applications' AND column_name='housing_status') THEN
    ALTER TABLE pre_approval_applications ADD COLUMN housing_status text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pre_approval_applications' AND column_name='monthly_housing_payment') THEN
    ALTER TABLE pre_approval_applications ADD COLUMN monthly_housing_payment numeric(12,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pre_approval_applications' AND column_name='time_at_address_years') THEN
    ALTER TABLE pre_approval_applications ADD COLUMN time_at_address_years text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pre_approval_applications' AND column_name='time_at_address_months') THEN
    ALTER TABLE pre_approval_applications ADD COLUMN time_at_address_months text;
  END IF;

  -- Employment
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pre_approval_applications' AND column_name='employer_name') THEN
    ALTER TABLE pre_approval_applications ADD COLUMN employer_name text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pre_approval_applications' AND column_name='job_title') THEN
    ALTER TABLE pre_approval_applications ADD COLUMN job_title text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pre_approval_applications' AND column_name='employer_phone') THEN
    ALTER TABLE pre_approval_applications ADD COLUMN employer_phone text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pre_approval_applications' AND column_name='time_at_job_years') THEN
    ALTER TABLE pre_approval_applications ADD COLUMN time_at_job_years text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pre_approval_applications' AND column_name='time_at_job_months') THEN
    ALTER TABLE pre_approval_applications ADD COLUMN time_at_job_months text;
  END IF;

  -- Other income
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pre_approval_applications' AND column_name='other_income_source') THEN
    ALTER TABLE pre_approval_applications ADD COLUMN other_income_source text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pre_approval_applications' AND column_name='other_monthly_income') THEN
    ALTER TABLE pre_approval_applications ADD COLUMN other_monthly_income numeric(12,2);
  END IF;

  -- Vehicle fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pre_approval_applications' AND column_name='vehicle_year') THEN
    ALTER TABLE pre_approval_applications ADD COLUMN vehicle_year text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pre_approval_applications' AND column_name='vehicle_make') THEN
    ALTER TABLE pre_approval_applications ADD COLUMN vehicle_make text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pre_approval_applications' AND column_name='vehicle_model') THEN
    ALTER TABLE pre_approval_applications ADD COLUMN vehicle_model text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pre_approval_applications' AND column_name='vehicle_trim') THEN
    ALTER TABLE pre_approval_applications ADD COLUMN vehicle_trim text;
  END IF;

  -- Defaults / constraints
  EXECUTE 'ALTER TABLE pre_approval_applications ALTER COLUMN status SET DEFAULT ''pending''';
END $$;
