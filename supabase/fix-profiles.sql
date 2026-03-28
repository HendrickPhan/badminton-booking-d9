-- ========================================
-- BADMINTON MANAGEMENT - COMPLETE SCHEMA
-- Custom Auth (No Supabase Auth)
-- Run this in Supabase SQL Editor
-- ========================================

-- Drop all existing tables (in order of dependencies)
DROP TABLE IF EXISTS public.rankings CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.booking_consumables CASCADE;
DROP TABLE IF EXISTS public.booking_participants CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.centers CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Also drop the trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ========================================
-- 1. USERS TABLE (Custom Auth)
-- ========================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS - we handle auth in API routes
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- ========================================
-- 1b. SETTINGS TABLE
-- ========================================
CREATE TABLE public.settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  female_discount_percent DECIMAL(5,2) DEFAULT 0,
  female_discount_enabled BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO public.settings (id, female_discount_percent, female_discount_enabled)
VALUES (1, 0, FALSE);

ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- ========================================
-- 2. CENTERS TABLE
-- ========================================
CREATE TABLE public.centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.centers DISABLE ROW LEVEL SECURITY;

-- ========================================
-- 3. BOOKINGS TABLE (No FK constraints for flexibility)
-- ========================================
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID,
  match_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  courts_count INTEGER DEFAULT 1,
  court_price DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending_registration' CHECK (status IN ('pending_registration', 'confirmed', 'pending_payment', 'completed', 'cancelled')),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;

-- ========================================
-- 4. BOOKING_PARTICIPANTS TABLE
-- ========================================
CREATE TABLE public.booking_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID,
  user_id UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'joined', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id, user_id)
);

ALTER TABLE public.booking_participants DISABLE ROW LEVEL SECURITY;

-- ========================================
-- 5. BOOKING_CONSUMABLES TABLE
-- ========================================
CREATE TABLE public.booking_consumables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID,
  item_type TEXT CHECK (item_type IN ('shuttlecock', 'drink')),
  quantity INTEGER DEFAULT 0,
  unit_price DECIMAL(10,2) DEFAULT 0
);

ALTER TABLE public.booking_consumables DISABLE ROW LEVEL SECURITY;

-- ========================================
-- 6. PAYMENTS TABLE
-- ========================================
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID,
  user_id UUID,
  amount DECIMAL(10,2) NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id, user_id)
);

ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;

-- ========================================
-- 7. MATCHES TABLE
-- ========================================
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID,
  match_type TEXT CHECK (match_type IN ('1v1', '2v2')),
  team1_player1 UUID,
  team1_player2 UUID,
  team2_player1 UUID,
  team2_player2 UUID,
  team1_score INTEGER,
  team2_score INTEGER,
  winner_team INTEGER,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.matches DISABLE ROW LEVEL SECURITY;

-- ========================================
-- 8. RANKINGS TABLE
-- ========================================
CREATE TABLE public.rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE,
  singles_rating INTEGER DEFAULT 1000,
  doubles_rating INTEGER DEFAULT 1000,
  singles_wins INTEGER DEFAULT 0,
  singles_losses INTEGER DEFAULT 0,
  doubles_wins INTEGER DEFAULT 0,
  doubles_losses INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.rankings DISABLE ROW LEVEL SECURITY;

-- ========================================
-- 9. INSERT ADMIN USER
-- Password: @Admin123456
-- ========================================
INSERT INTO public.users (username, email, password_hash, role)
VALUES ('admin', 'mhieu25101998@gmail.com', '@Admin123456', 'admin');

-- ========================================
-- 10. VERIFY TABLES
-- ========================================
SELECT
  'users' as table_name, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'centers', COUNT(*) FROM public.centers
UNION ALL
SELECT 'bookings', COUNT(*) FROM public.bookings
UNION ALL
SELECT 'rankings', COUNT(*) FROM public.rankings;

-- Show admin user
SELECT id, username, email, role, created_at FROM public.users WHERE username = 'admin';
