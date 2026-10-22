-- ============================================================================
-- DOLPHIN AQUARIUM: COMPLETE STAGE 4 SETUP SCRIPT
-- Tables, RLS, Storage, Admin Privileges & Seed Data
-- ============================================================================

-- 1. ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SECURITY DEFINER HELPER: is_admin()
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

-- 3. GRANT ADMIN TO YOUR ACCOUNT (manosvsm20070@gmail.com)
INSERT INTO public.admin_users (user_id, role)
VALUES ('a4cc0aa0-26e1-4816-b777-a605519b6fd8', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- 4. PRODUCTS TABLE
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

-- 5. PERFORMANCE & SEARCH INDEXES
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_section ON public.products(section);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(published);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- 6. AUTOMATIC TIMESTAMP TRIGGER
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

-- 7. ROW LEVEL SECURITY (RLS) FOR PRODUCTS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published products" ON public.products;
CREATE POLICY "Public can view published products"
  ON public.products
  FOR SELECT
  USING (published = true OR is_admin());

DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products"
  ON public.products
  FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products"
  ON public.products
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products"
  ON public.products
  FOR DELETE
  USING (is_admin());

-- 8. ROW LEVEL SECURITY (RLS) FOR ADMIN_USERS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view admin list" ON public.admin_users;
CREATE POLICY "Admins view admin list"
  ON public.admin_users
  FOR SELECT
  USING (is_admin() OR user_id = auth.uid());

DROP POLICY IF EXISTS "Only existing admins manage admin list" ON public.admin_users;
CREATE POLICY "Only existing admins manage admin list"
  ON public.admin_users
  FOR ALL
  USING (is_admin());

-- 9. STORAGE BUCKET & IMAGE PERMISSIONS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880;

DROP POLICY IF EXISTS "Public Read Product Images" ON storage.objects;
CREATE POLICY "Public Read Product Images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admins Upload Product Images" ON storage.objects;
CREATE POLICY "Admins Upload Product Images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins Update Product Images" ON storage.objects;
CREATE POLICY "Admins Update Product Images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins Delete Product Images" ON storage.objects;
CREATE POLICY "Admins Delete Product Images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND public.is_admin());

-- 10. INITIAL PRODUCT CATALOG SEED
INSERT INTO public.products (
  name, description, price, original_price, category, sub_category, variety, badge,
  stock, availability, primary_image, images, sizes, default_size, water_params, specs,
  is_live_fish, section, published
) VALUES
(
  'Red Cap Oranda Goldfish',
  'High-grade Fancy Red Cap Oranda with prominent raspberry-textured crimson wen growth and flowing silky white fins. Quarantined for 14 days and conditioned for local tap water.',
  80.00, 100.00, 'Goldfish', 'Oranda', 'Red Cap', 'Red Cap',
  14, 'in_stock',
  'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80',
  ARRAY['https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80'],
  ARRAY['3.5 inch', '4.5 inch', '5.5 inch Jumbo'], '3.5 inch',
  '{"ph": "7.2 - 7.6", "temp": "20-24°C", "temperament": "Peaceful"}'::jsonb, NULL,
  true, 'livestock', true
),
(
  'Calico Ryukin Goldfish',
  'High arched shoulder hump with magnificent tri-color calico marbling. Energetic swimmer with wide double fantail.',
  100.00, 850.00, 'Goldfish', 'Ryukin', 'Calico', 'Calico',
  8, 'in_stock',
  'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=800&q=80',
  ARRAY['https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=800&q=80'],
  ARRAY['3 inch', '4 inch', '5 inch'], '3 inch',
  '{"ph": "7.2 - 7.6", "temp": "18-24°C", "temperament": "Peaceful"}'::jsonb, NULL,
  true, 'livestock', true
),
(
  'Black Moor Goldfish',
  'Velvety deep matte black scales with protruding telescope eyes and elegant butterfly tail.',
  450.00, NULL, 'Goldfish', 'Telescope', 'Black Moor', 'Black Moor',
  18, 'in_stock',
  'https://images.unsplash.com/photo-1544943910-4c1dc44a0b22?auto=format&fit=crop&w=800&q=80',
  ARRAY['https://images.unsplash.com/photo-1544943910-4c1dc44a0b22?auto=format&fit=crop&w=800&q=80'],
  ARRAY['2.5 inch', '3.5 inch'], '2.5 inch',
  '{"ph": "7.0 - 7.8", "temp": "18-22°C", "temperament": "Peaceful"}'::jsonb, NULL,
  true, 'livestock', true
),
(
  'Royal Blue Halfmoon Betta',
  'Show-grade Royal Blue Halfmoon Betta displaying a perfect 180° caudal spread. Iridescent cobalt scales.',
  350.00, 420.00, 'Betta Fish', 'Halfmoon', 'Halfmoon', 'Halfmoon',
  12, 'in_stock',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
  ARRAY['https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'],
  ARRAY['2.5 inch Show Grade'], '2.5 inch Show Grade',
  '{"ph": "6.5 - 7.4", "temp": "26-28°C", "temperament": "Solitary"}'::jsonb, NULL,
  true, 'livestock', true
),
(
  'Liny LY-1000F Aquarium Internal Filter Motor',
  'High-power 15W model LY-1000F aquarium internal filter. Features energy saving mute design, durable ceramic axle, active aeration, and BIO filtration.',
  280.00, 350.00, 'Motors & Pumps', 'Internal Filter', 'BIO Filtration Motor', 'BIO Filtration Motor',
  22, 'in_stock',
  'https://images.unsplash.com/photo-1584555613497-9ecf9dd06f68?auto=format&fit=crop&w=800&q=80',
  ARRAY['https://images.unsplash.com/photo-1584555613497-9ecf9dd06f68?auto=format&fit=crop&w=800&q=80'],
  ARRAY['LY-1000F (15W)'], 'LY-1000F (15W)',
  NULL,
  '{"Power": "15 Watts", "Design": "Mute Low Energy Consumption", "Axle": "Durable Ceramic Axle"}'::jsonb,
  false, 'motors', true
),
(
  'Bluepet BL-600F Internal Filter Motor',
  'Powerful 8W submersible internal filter motor with 650 L/H flow. Designed for larger freshwater tanks with higher biological and mechanical load.',
  330.00, 390.00, 'Motors & Pumps', 'Internal Filter', 'Submersible Motor', 'Submersible Motor',
  18, 'in_stock',
  'https://images.unsplash.com/photo-1584555613497-9ecf9dd06f68?auto=format&fit=crop&w=800&q=80',
  ARRAY['https://images.unsplash.com/photo-1584555613497-9ecf9dd06f68?auto=format&fit=crop&w=800&q=80'],
  ARRAY['BL-600F (8W / 650 L/H)'], 'BL-600F (8W / 650 L/H)',
  NULL,
  '{"Power": "8 Watts", "Flow": "650 L/H Max"}'::jsonb,
  false, 'motors', true
),
(
  'Premium Spirulina & High-Protein Growth Pellets',
  'Balanced daily nutrition fortified with organic spirulina, multivitamins, and minerals. Boosts immunity and scales luster in all tropical freshwater fish.',
  180.00, 220.00, 'Fish Food', 'Pellets', 'Daily Growth', 'Daily Growth',
  25, 'in_stock',
  'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=800&q=80',
  ARRAY['https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=800&q=80'],
  ARRAY['200g Pack', '500g Tub'], '200g Pack',
  NULL, NULL,
  false, 'food', true
),
(
  'Multi-Nutrition Tropical Fish Flakes',
  'Slow-floating gourmet flake blend suitable for all surface and mid-water community fish like guppies, tetras, danios, and mollies.',
  120.00, 150.00, 'Fish Food', 'Flakes', 'Community Flakes', 'Community Flakes',
  30, 'in_stock',
  'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=800&q=80',
  ARRAY['https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=800&q=80'],
  ARRAY['50g Tin', '100g Tin'], '50g Tin',
  NULL, NULL,
  false, 'food', true
),
(
  'Stress Heal Water Conditioner (50ml)',
  'Premium natural Aloe Vera stress reducer, transport aid, slime coat protectant, instant ammonia control, and tap water chlorine remover.',
  120.00, 150.00, 'Fish Medicines', 'Water Conditioner', 'Aloe Vera Formula', 'Aloe Vera Formula',
  60, 'in_stock',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
  ARRAY['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'],
  ARRAY['50 ml Bottle'], '50 ml Bottle',
  NULL, NULL,
  false, 'essentials', true
),
(
  'Clear Round Glass Fish Bowl (12 Inch)',
  'Large 12-inch heavy-duty glass bowl providing generous swimming volume for fancy goldfish, guppy colonies, and live plants.',
  380.00, 450.00, 'Aquarium Bowls', 'Glass Bowls', 'Round Bowl', 'Round Bowl',
  15, 'in_stock',
  'https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=800&q=80',
  ARRAY['https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=800&q=80'],
  ARRAY['12 Inch'], '12 Inch',
  NULL, NULL,
  false, 'essentials', true
);
