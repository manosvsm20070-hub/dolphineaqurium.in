import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate whether environment variables are present and not placeholder values
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== '' &&
  !supabaseUrl.includes('your-project-ref') &&
  !supabaseAnonKey.includes('your-anon-key-here')
)

if (!isSupabaseConfigured) {
  console.warn(
    '[Dolphin Aquarium] Missing or placeholder Supabase credentials in .env.local. ' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to connect.'
  )
}

// Single reusable Supabase client instance
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null

/**
 * Safely tests the Supabase connection without modifying or creating any database tables.
 * Respects all existing Row Level Security (RLS) policies and permissions.
 *
 * Distinguishes between:
 * - Missing local configuration
 * - Authentication / API key invalidity
 * - Network / URL connectivity issues
 * - Permission / RLS restricted access
 * - Fully connected
 *
 * @returns {Promise<{ success: boolean, status: string, message: string, details?: string }>}
 */
export async function testSupabaseConnection() {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      status: 'missing_config',
      message: 'Supabase configuration is missing or incomplete.',
      details: 'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local and restart the dev server.',
    }
  }

  try {
    // 1. Verify Auth service connectivity (safe, does not touch tables)
    const { error: authError } = await supabase.auth.getSession()

    if (authError) {
      return {
        success: false,
        status: 'auth_error',
        message: 'Authentication service rejected the request.',
        details: 'The anon key might be invalid, expired, or malformed.',
      }
    }

    // 2. Perform a safe read probe to verify REST API gateway reachability
    // We request 0 rows (count only) on a read probe without altering any data.
    const { error: restError, status: httpStatus } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })

    if (restError) {
      // 401 / 403: API Key or auth issue
      if (httpStatus === 401 || httpStatus === 403) {
        return {
          success: false,
          status: 'auth_error',
          message: 'Access denied by Supabase API gateway.',
          details: 'Please check that your VITE_SUPABASE_ANON_KEY matches the anon public key in your Supabase dashboard.',
        }
      }

      // 404 / 42P01: The products table does not exist yet.
      // This confirms the connection and credentials work, but the schema is not yet created.
      if (httpStatus === 404 || restError.code === '42P01' || restError.code === 'PGRST204' || restError.code === 'PGRST205') {
        return {
          success: true,
          status: 'connected_no_tables',
          message: 'Connected to Supabase project successfully!',
          details: 'Connection verified. Database schema (tables) not created yet.',
        }
      }

      // 42501: Row Level Security prevented reading the table.
      // This confirms the connection and credentials work, and RLS is properly active.
      if (restError.code === '42501') {
        return {
          success: true,
          status: 'connected_rls_active',
          message: 'Connected to Supabase project successfully!',
          details: 'Connection verified. Row Level Security policies are active.',
        }
      }

      // Any other database error still confirms connection reached Supabase
      return {
        success: true,
        status: 'connected',
        message: 'Connected to Supabase project successfully!',
        details: `Service responded (Code: ${restError.code || httpStatus || 'OK'}).`,
      }
    }

    // Completely successful read
    return {
      success: true,
      status: 'connected',
      message: 'Connected to Supabase project successfully!',
      details: 'Read access verified within permitted database policies.',
    }
  } catch (err) {
    return {
      success: false,
      status: 'network_error',
      message: 'Network error while attempting to reach Supabase.',
      details: err instanceof Error ? err.message : 'Check that VITE_SUPABASE_URL is correct and that you have an active internet connection.',
    }
  }
}
