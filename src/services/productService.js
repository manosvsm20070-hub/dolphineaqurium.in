import { useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { SAMPLE_PRODUCTS } from '../data/sampleProducts'

/**
 * Product Data Service
 *
 * Checks if Supabase has an active 'products' table.
 * If data exists in Supabase, it returns the real database records.
 * Otherwise, it falls back cleanly to the realistic sample data, ensuring
 * the storefront works immediately while clearly tracking data source.
 */
export async function fetchProducts(includeUnpublished = false) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      products: SAMPLE_PRODUCTS,
      isUsingSupabase: false,
      message: 'Using initial catalog sample data (.env.local not configured).',
    }
  }

  try {
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (!includeUnpublished) {
      query = query.eq('published', true)
    }

    const { data, error } = await query

    if (error) {
      // If table doesn't exist yet (Stage 4), fall back to sample products safely
      return {
        products: SAMPLE_PRODUCTS,
        isUsingSupabase: false,
        message: 'Using initial catalog sample data (Apply Stage 4 migration in Supabase SQL editor).',
      }
    }

    if (data && data.length > 0) {
      return {
        products: data,
        isUsingSupabase: true,
        message: `Loaded ${data.length} products directly from your Supabase database.`,
      }
    }

    // Table exists but has no records yet
    return {
      products: SAMPLE_PRODUCTS,
      isUsingSupabase: false,
      message: 'Supabase table is currently empty; using sample catalog.',
    }
  } catch (err) {
    console.warn('[productService] Error querying Supabase products, falling back to sample data:', err)
    return {
      products: SAMPLE_PRODUCTS,
      isUsingSupabase: false,
      message: 'Network error reading Supabase; fallback sample data in use.',
    }
  }
}

/**
 * Create a new product (restricted by RLS to verified administrators)
 * @param {Object} productData
 * @returns {Promise<{ data: any, error: any }>}
 */
export async function createProduct(productData) {
  if (!isSupabaseConfigured || !supabase) {
    return { data: null, error: new Error('Supabase is not configured.') }
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single()

    return { data, error }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Failed to create product') }
  }
}

/**
 * Update an existing product (restricted by RLS to verified administrators)
 * @param {string} id
 * @param {Object} updates
 * @returns {Promise<{ data: any, error: any }>}
 */
export async function updateProduct(id, updates) {
  if (!isSupabaseConfigured || !supabase) {
    return { data: null, error: new Error('Supabase is not configured.') }
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Failed to update product') }
  }
}

/**
 * Delete a product (restricted by RLS to verified administrators)
 * @param {string} id
 * @returns {Promise<{ error: any }>}
 */
export async function deleteProduct(id) {
  if (!isSupabaseConfigured || !supabase) {
    return { error: new Error('Supabase is not configured.') }
  }

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    return { error }
  } catch (err) {
    return { error: err instanceof Error ? err : new Error('Failed to delete product') }
  }
}

/**
 * Upload an image to the 'product-images' Supabase storage bucket
 * @param {File} file
 * @returns {Promise<{ url: string|null, error: any }>}
 */
export async function uploadProductImage(file) {
  if (!isSupabaseConfigured || !supabase) {
    return { url: null, error: new Error('Supabase is not configured.') }
  }

  try {
    const fileExt = file.name.split('.').pop()
    const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_')
    const fileName = `${Date.now()}-${cleanName}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      return { url: null, error: uploadError }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return { url: publicUrl, error: null }
  } catch (err) {
    return { url: null, error: err instanceof Error ? err : new Error('Failed to upload image') }
  }
}

/**
 * Custom React hook for products
 */
export function useProducts() {
  const [products, setProducts] = useState(SAMPLE_PRODUCTS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isUsingSupabase, setIsUsingSupabase] = useState(false)
  const [sourceMessage, setSourceMessage] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchProducts()
      setProducts(res.products)
      setIsUsingSupabase(res.isUsingSupabase)
      setSourceMessage(res.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setProducts(SAMPLE_PRODUCTS)
      setIsUsingSupabase(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    fetchProducts()
      .then((res) => {
        if (isMounted) {
          setProducts(res.products)
          setIsUsingSupabase(res.isUsingSupabase)
          setSourceMessage(res.message)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error')
          setProducts(SAMPLE_PRODUCTS)
          setIsUsingSupabase(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return {
    products,
    loading,
    error,
    isUsingSupabase,
    sourceMessage,
    refreshProducts: load,
  }
}
