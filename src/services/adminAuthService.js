import { supabase, isSupabaseConfigured } from '../lib/supabase'

/**
 * Admin Authentication & Authorization Service
 *
 * Implements Supabase Auth email/password login and strictly verifies
 * database-controlled authorization against public.admin_users via Row Level Security.
 */

/**
 * Sign in with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: any, session: any, isAdmin: boolean, role: string|null, error: any }>}
 */
export async function adminSignIn(email, password) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      user: null,
      session: null,
      isAdmin: false,
      role: null,
      error: new Error('Supabase is not configured. Please check your .env.local file.'),
    }
  }

  try {
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (authError) {
      return {
        user: null,
        session: null,
        isAdmin: false,
        role: null,
        error: authError,
      }
    }

    const user = data.user
    const session = data.session

    // Verify whether this authenticated user has admin role in public.admin_users
    const adminCheck = await checkIsAdmin(user.id)

    return {
      user,
      session,
      isAdmin: adminCheck.isAdmin,
      role: adminCheck.role,
      error: null,
    }
  } catch (err) {
    return {
      user: null,
      session: null,
      isAdmin: false,
      role: null,
      error: err instanceof Error ? err : new Error('Unexpected error during sign-in'),
    }
  }
}

/**
 * Sign out the currently authenticated user
 * @returns {Promise<{ error: any }>}
 */
export async function adminSignOut() {
  if (!isSupabaseConfigured || !supabase) {
    return { error: null }
  }

  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (err) {
    return { error: err }
  }
}

/**
 * Check if a given user ID exists in the admin_users table with an admin role
 * @param {string} userId
 * @returns {Promise<{ isAdmin: boolean, role: string|null, error: any }>}
 */
export async function checkIsAdmin(userId) {
  if (!isSupabaseConfigured || !supabase || !userId) {
    return { isAdmin: false, role: null, error: null }
  }

  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      // If table doesn't exist yet or query failed
      return { isAdmin: false, role: null, error }
    }

    if (data && (data.role === 'admin' || data.role === 'staff')) {
      return { isAdmin: true, role: data.role, error: null }
    }

    return { isAdmin: false, role: null, error: null }
  } catch (err) {
    return { isAdmin: false, role: null, error: err }
  }
}

/**
 * Get the current session user and admin status
 * @returns {Promise<{ user: any, session: any, isAdmin: boolean, role: string|null }>}
 */
export async function getCurrentAdminUser() {
  if (!isSupabaseConfigured || !supabase) {
    return { user: null, session: null, isAdmin: false, role: null }
  }

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session || !session.user) {
      return { user: null, session: null, isAdmin: false, role: null }
    }

    const user = session.user
    const adminCheck = await checkIsAdmin(user.id)

    return {
      user,
      session,
      isAdmin: adminCheck.isAdmin,
      role: adminCheck.role,
    }
  } catch {
    return { user: null, session: null, isAdmin: false, role: null }
  }
}

/**
 * Subscribe to Supabase auth state changes and admin privilege status
 * @param {Function} callback - ({ user, session, isAdmin, role, loading }) => void
 * @returns {Function} unsubscribe function
 */
export function onAdminAuthStateChange(callback) {
  if (!isSupabaseConfigured || !supabase) {
    callback({ user: null, session: null, isAdmin: false, role: null, loading: false })
    return () => {}
  }

  let isMounted = true

  // Initial check
  getCurrentAdminUser().then((res) => {
    if (isMounted) {
      callback({ ...res, loading: false })
    }
  })

  // Listen to Auth events
  const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (!isMounted) return

    if (!session || !session.user) {
      callback({ user: null, session: null, isAdmin: false, role: null, loading: false })
      return
    }

    const adminCheck = await checkIsAdmin(session.user.id)
    if (isMounted) {
      callback({
        user: session.user,
        session,
        isAdmin: adminCheck.isAdmin,
        role: adminCheck.role,
        loading: false,
      })
    }
  })

  return () => {
    isMounted = false
    authListener?.subscription?.unsubscribe()
  }
}
