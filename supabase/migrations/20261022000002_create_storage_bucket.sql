-- ============================================================================
-- DOLPHIN AQUARIUM: STORAGE BUCKET & ACCESS POLICIES
-- Migration: 20261022000002_create_storage_bucket.sql
-- ============================================================================

-- 1. CREATE STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

-- 2. STORAGE ROW LEVEL SECURITY POLICIES

-- Policy A: Anyone can view product images (public storefront access)
DROP POLICY IF EXISTS "Public Read Product Images" ON storage.objects;
CREATE POLICY "Public Read Product Images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

-- Policy B: Only verified administrators can upload product images
DROP POLICY IF EXISTS "Admins Upload Product Images" ON storage.objects;
CREATE POLICY "Admins Upload Product Images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND public.is_admin()
  );

-- Policy C: Only verified administrators can update existing images
DROP POLICY IF EXISTS "Admins Update Product Images" ON storage.objects;
CREATE POLICY "Admins Update Product Images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND public.is_admin()
  );

-- Policy D: Only verified administrators can delete images
DROP POLICY IF EXISTS "Admins Delete Product Images" ON storage.objects;
CREATE POLICY "Admins Delete Product Images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND public.is_admin()
  );
