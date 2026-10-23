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
