-- ============================================================================
-- DOLPHIN AQUARIUM: SCHEMA & ROW LEVEL SECURITY MIGRATION
-- Migration: 20261022000001_create_dolphin_aquarium_schema.sql
-- ============================================================================

-- 1. ADMIN USERS TABLE
-- Tracks verified administrator accounts without allowing public self-elevation.
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SECURITY DEFINER HELPER: is_admin()
-- Checks if the authenticated caller's JWT UID exists in public.admin_users.
-- Runs with definer privileges to securely evaluate admin status in RLS policies.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$$;

-- 3. PRODUCTS TABLE
-- Stores livestock, equipment, fish food, bowls, and aquarium supplies.
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10, 2) CHECK (original_price IS NULL OR original_price >= 0),
  category TEXT NOT NULL,
  sub_category TEXT,
  variety TEXT,
  badge TEXT,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  availability TEXT NOT NULL DEFAULT 'in_stock' CHECK (availability IN ('in_stock', 'low_stock', 'out_of_stock')),
  primary_image TEXT,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  sizes TEXT[] DEFAULT ARRAY[]::TEXT[],
  default_size TEXT,
  water_params JSONB DEFAULT NULL,
  specs JSONB DEFAULT NULL,
  is_live_fish BOOLEAN NOT NULL DEFAULT false,
  section TEXT NOT NULL DEFAULT 'livestock',
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PERFORMANCE & SEARCH INDEXES
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_section ON public.products(section);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(published);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- 5. AUTOMATIC TIMESTAMP TRIGGER
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_products_updated_at ON public.products;
CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 6. ROW LEVEL SECURITY (RLS) FOR PRODUCTS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Customers & Public: Read published products only (or admins can view all including drafts)
DROP POLICY IF EXISTS "Public can view published products" ON public.products;
CREATE POLICY "Public can view published products"
  ON public.products
  FOR SELECT
  USING (published = true OR is_admin());

-- Verified Administrators Only: Insert new products
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products"
  ON public.products
  FOR INSERT
  WITH CHECK (is_admin());

-- Verified Administrators Only: Update products
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products"
  ON public.products
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Verified Administrators Only: Delete products
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products"
  ON public.products
  FOR DELETE
  USING (is_admin());

-- 7. ROW LEVEL SECURITY (RLS) FOR ADMIN_USERS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admins can read admin users; users can view their own status
DROP POLICY IF EXISTS "Admins view admin list" ON public.admin_users;
CREATE POLICY "Admins view admin list"
  ON public.admin_users
  FOR SELECT
  USING (is_admin() OR user_id = auth.uid());

-- Prevent public self-granting: Only existing admins can insert, update, or delete
DROP POLICY IF EXISTS "Only existing admins manage admin list" ON public.admin_users;
CREATE POLICY "Only existing admins manage admin list"
  ON public.admin_users
  FOR ALL
  USING (is_admin());
