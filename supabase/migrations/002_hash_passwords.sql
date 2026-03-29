-- ========================================
-- Migration: Hash existing plain text passwords
-- Date: 2026-03-29
-- Description: Hash all existing plain text passwords in the database
-- ========================================

-- This migration should be run manually in Supabase SQL Editor
-- Since bcrypt hashes cannot be computed in SQL, you will need to:
-- 1. Have users login with their existing password
-- 2. Run this migration from the application to hash their password

-- Alternative: Reset passwords and have users set new passwords

-- ========================================
-- Instructions:
-- 1. Run this in Supabase SQL Editor to see current users
-- 2. Have users login - their passwords will be hashed automatically
-- 3. Or manually reset passwords using the admin panel
-- ========================================

SELECT id, username, role, created_at FROM public.users ORDER BY created_at;
