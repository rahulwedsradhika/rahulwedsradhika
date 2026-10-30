/**
 * Wedding Website Admin Authentication & Authorization Service
 * 
 * Production Security:
 * - Demands authentic Supabase Auth session with verified admin authorization.
 * - Checks public.wedding_admins allowlist table and JWT app_metadata.
 * - Local offline development mode is strictly restricted to import.meta.env.DEV.
 * - Production builds (import.meta.env.PROD) categorically reject client-side passkeys.
 */

import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export const DEV_ADMIN_SESSION_KEY = 'wedding_dev_local_admin_session_v3';

export interface AdminAuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  role: 'admin' | 'superadmin' | 'dev_local' | null;
  mode: 'supabase' | 'dev_local' | 'none';
  error: string | null;
}

/**
 * Returns true if local offline dev mode is permissible in this environment.
 * Strictly false in production builds (import.meta.env.PROD === true).
 */
export function isDevLocalModeAllowed(): boolean {
  return Boolean(import.meta.env.DEV);
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
  if (!supabase) {
    return { isAdmin: false, role: null, error: 'Supabase client is unavailable.' };
  }

  // 1. JWT app_metadata check (tamper-proof signed by Supabase Auth)
  const appRole = (user.app_metadata?.role as string | undefined)?.toLowerCase();
  if (appRole === 'admin' || appRole === 'superadmin') {
    return { isAdmin: true, role: appRole as 'admin' | 'superadmin' };
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

  // Fallback: Local dev mode ONLY in development (non-PROD)
  if (isDevLocalModeAllowed()) {
    try {
      const activeDev = sessionStorage.getItem(DEV_ADMIN_SESSION_KEY);
      if (activeDev === 'active_dev_only') {
        return {
          isAuthenticated: true,
          isAdmin: true,
          user: null,
          role: 'dev_local',
          mode: 'dev_local',
          error: null,
        };
      }
    } catch {
      // Ignore
    }
  }

  return {
    isAuthenticated: false,
    isAdmin: false,
    user: null,
    role: null,
    mode: 'none',
    error: null,
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
 * Sign in using Development Passkey.
 * Strictly blocked in production builds (PROD).
 */
export function loginAdminDev(passkey: string): { success: boolean; error?: string } {
  if (!isDevLocalModeAllowed()) {
    return {
      success: false,
      error: 'Passkey login is strictly prohibited in production builds. Please authenticate via Supabase Auth.',
    };
  }

  const configuredPasskey = import.meta.env.VITE_ADMIN_PASSKEY || 'wedding2026';
  if (passkey.trim() === configuredPasskey) {
    try {
      sessionStorage.setItem(DEV_ADMIN_SESSION_KEY, 'active_dev_only');
    } catch {
      // Ignore
    }
    return { success: true };
  }

  return {
    success: false,
    error: 'Incorrect development passkey. Please check your local configuration.',
  };
}

/**
 * Sign out administrator and immediately revoke all session credentials.
 */
export async function signOutAdmin(): Promise<void> {
  try {
    sessionStorage.removeItem(DEV_ADMIN_SESSION_KEY);
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
