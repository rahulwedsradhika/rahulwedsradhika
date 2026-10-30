/**
 * Wedding Website Admin Authentication & Authorization Service
 * 
 * Production Security:
 * - Demands authentic Supabase Auth session with verified admin authorization.
 * - Checks public.wedding_admins allowlist table and JWT app_metadata.
 * - Passkey logic is completely removed; Supabase Auth is the single source of truth.
 */

import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface AdminAuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  role: 'admin' | 'superadmin' | null;
  mode: 'supabase' | 'none';
  error: string | null;
}

/**
 * Verifies whether an authenticated Supabase user has verified administrator authorization.
 * 1. Checks JWT app_metadata for { role: 'admin' | 'superadmin' }
 * 2. Checks public.wedding_admins allowlist table
 */
export async function verifyUserAdminRole(user: User): Promise<{
  isAdmin: boolean;
  role: 'admin' | 'superadmin' | null;
  error?: string;
}> {
  // 1. JWT app_metadata check (tamper-proof signed by Supabase Auth)
  const appRole = (user.app_metadata?.role as string | undefined)?.toLowerCase();
  if (appRole === 'admin' || appRole === 'superadmin') {
    return { isAdmin: true, role: appRole as 'admin' | 'superadmin' };
  }

  if (!supabase) {
    return {
      isAdmin: false,
      role: null,
      error: 'Access denied: Your account is authenticated, but is not registered in the wedding administrators allowlist.',
    };
  }

  // 2. Query public.wedding_admins allowlist table
  try {
    const { data, error } = await supabase
      .from('wedding_admins')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data && (data.role === 'admin' || data.role === 'superadmin')) {
      return { isAdmin: true, role: data.role as 'admin' | 'superadmin' };
    }

    if (error) {
      console.warn('Notice querying wedding_admins allowlist:', error.message);
    }
  } catch (err) {
    console.warn('Network exception while verifying admin role:', err);
  }

  return {
    isAdmin: false,
    role: null,
    error: 'Access denied: Your account is authenticated, but is not registered in the wedding administrators allowlist.',
  };
}

/**
 * Resolve current Admin Authentication State
 */
export async function getAdminAuthState(): Promise<AdminAuthState> {
  // If Supabase is connected, verify active session & admin role
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!error && session && session.user) {
        const check = await verifyUserAdminRole(session.user);
        if (check.isAdmin) {
          return {
            isAuthenticated: true,
            isAdmin: true,
            user: session.user,
            role: check.role,
            mode: 'supabase',
            error: null,
          };
        }
        return {
          isAuthenticated: true,
          isAdmin: false,
          user: session.user,
          role: null,
          mode: 'supabase',
          error: check.error || 'Account lacks wedding administrator privileges.',
        };
      }
    } catch (err) {
      console.error('Failed to get Supabase session:', err);
    }
  }

  return {
    isAuthenticated: false,
    isAdmin: false,
    user: null,
    role: null,
    mode: 'none',
    error: isSupabaseConfigured ? null : 'Supabase is not configured. Connect Supabase to authenticate as an administrator.',
  };
}

/**
 * Sign in via Supabase Auth credentials (email and password).
 * Automatically verifies that the signed-in user is an authorized admin.
 */
export async function loginAdminSupabase(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: User; role?: 'admin' | 'superadmin' }> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: 'Supabase is not configured in this environment.',
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error || !data.user) {
      return {
        success: false,
        error: error?.message || 'Invalid credentials.',
      };
    }

    // Role verification
    const roleCheck = await verifyUserAdminRole(data.user);
    if (!roleCheck.isAdmin) {
      // Revoke session if not an admin
      await supabase.auth.signOut();
      return {
        success: false,
        error: roleCheck.error || 'User is not an authorized wedding administrator.',
      };
    }

    return {
      success: true,
      user: data.user,
      role: roleCheck.role ?? 'admin',
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Authentication network failure.',
    };
  }
}

/**
 * Sign out administrator and immediately revoke all session credentials.
 */
export async function signOutAdmin(): Promise<void> {
  try {
    sessionStorage.removeItem('wedding_admin_authenticated'); // Scrub legacy key
  } catch {
    // Ignore
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
  }
}

/**
 * Listen for auth state changes (session expiry, token refresh, logout)
 */
export function subscribeToAuthChanges(
  callback: (state: AdminAuthState) => void
): () => void {
  if (!isSupabaseConfigured || !supabase) {
    return () => {};
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_OUT' || !session) {
        callback({
          isAuthenticated: false,
          isAdmin: false,
          user: null,
          role: null,
          mode: 'none',
          error: null,
        });
        return;
      }

      if (session.user) {
        const check = await verifyUserAdminRole(session.user);
        callback({
          isAuthenticated: true,
          isAdmin: check.isAdmin,
          user: session.user,
          role: check.role,
          mode: 'supabase',
          error: check.isAdmin ? null : (check.error || 'Unauthorized'),
        });
      }
    }
  );

  return () => {
    subscription.unsubscribe();
  };
}

