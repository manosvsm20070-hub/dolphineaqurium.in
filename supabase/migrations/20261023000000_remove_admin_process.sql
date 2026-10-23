-- ============================================================================
-- DOLPHIN AQUARIUM: REMOVE ADMIN PROCESSES AND TABLES
-- Migration: 20261023000000_remove_admin_process.sql
-- ============================================================================

-- 1. DROP STORAGE ADMIN POLICIES
DROP POLICY IF EXISTS "Admins Upload Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Admins Update Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Admins Delete Product Images" ON storage.objects;

-- Ensure public can continue reading product images
DROP POLICY IF EXISTS "Public Read Product Images" ON storage.objects;
CREATE POLICY "Public Read Product Images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

-- 2. UPDATE PRODUCTS ROW LEVEL SECURITY
-- Drop admin-dependent policies
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

-- Simplify public read policy so it no longer checks is_admin()
DROP POLICY IF EXISTS "Public can view published products" ON public.products;
CREATE POLICY "Public can view published products"
  ON public.products
  FOR SELECT
  USING (published = true);

-- 3. DROP ADMIN_USERS TABLE & POLICIES
DROP POLICY IF EXISTS "Admins view admin list" ON public.admin_users;
DROP POLICY IF EXISTS "Only existing admins manage admin list" ON public.admin_users;
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- 4. DROP IS_ADMIN HELPER FUNCTION
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
