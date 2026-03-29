-- ========================================
-- Migration: Replace email with phone_number
-- Date: 2026-03-28
-- Description: Replace email column with phone_number in users table
-- ========================================

-- Step 1: Add phone_number column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE public.users ADD COLUMN phone_number TEXT;
  END IF;
END $$;

-- Step 2: Create unique index on phone_number if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'users_phone_number_key'
  ) THEN
    CREATE UNIQUE INDEX users_phone_number_key ON public.users (phone_number) WHERE phone_number IS NOT NULL;
  END IF;
END $$;

-- Step 3: Drop email column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'email'
  ) THEN
    -- First drop any unique constraints on email
    DECLARE
      constraint_name TEXT;
    BEGIN
      SELECT conname INTO constraint_name
      FROM pg_constraint
      WHERE conrelid = 'public.users'::regclass
        AND contype = 'u'
        AND conname LIKE '%email%';

      IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.users DROP CONSTRAINT %I', constraint_name);
      END IF;
    END;

    -- Drop the column
    ALTER TABLE public.users DROP COLUMN email;
  END IF;
END $$;

-- Verify the migration
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;
