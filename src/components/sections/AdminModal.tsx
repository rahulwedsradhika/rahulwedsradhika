import React, { useState, useEffect } from 'react';
import { Lock, KeyRound, ArrowRight, X, ShieldAlert, Mail, Shield, AlertTriangle } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import {
  getAdminAuthState,
  loginAdminSupabase,
  loginAdminDev,
  signOutAdmin,
  subscribeToAuthChanges,
  isDevLocalModeAllowed,
  AdminAuthState,
} from '../../lib/authService';
import { AdminDashboard } from '../admin/AdminDashboard';
import { RoyalCrestLogo } from '../common/RoyalCrestLogo';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const isDevAllowed = isDevLocalModeAllowed();
  const [authMode, setAuthMode] = useState<'supabase' | 'dev_passkey'>(
    isSupabaseConfigured ? 'supabase' : isDevAllowed ? 'dev_passkey' : 'supabase'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passkey, setPasskey] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [adminUserEmail, setAdminUserEmail] = useState<string | null>(null);
  const [adminRole, setAdminRole] = useState<'admin' | 'superadmin' | 'dev_local' | null>(null);

  // Check existing session & subscribe to real auth changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    // Check current verified admin state
    void getAdminAuthState().then((state) => {
      if (!isMounted) return;
      if (state.isAdmin) {
        setIsUnlocked(true);
        setAdminUserEmail(state.user?.email || (state.mode === 'dev_local' ? 'Local Developer' : 'Admin'));
        setAdminRole(state.role);
      } else {
        setIsUnlocked(false);
        if (state.error) {
          setAuthError(state.error);
        }
      }
    });

    // Subscribe to session expiration or sign out
    const unsubscribe = subscribeToAuthChanges((state: AdminAuthState) => {
      if (!isMounted) return;
      if (!state.isAdmin) {
        setIsUnlocked(false);
        setAdminUserEmail(null);
        setAdminRole(null);
        if (state.error) setAuthError(state.error);
      } else {
        setIsUnlocked(true);
        setAdminUserEmail(state.user?.email || 'Admin');
        setAdminRole(state.role);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [isOpen]);

  const adminTheme = (() => {
    try {
      return localStorage.getItem('wedding_admin_theme_mode') === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  })();

  if (!isOpen) return null;

  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthenticating(true);

    try {
      const res = await loginAdminSupabase(email, password);
      if (res.success && res.user) {
        setIsUnlocked(true);
        setAdminUserEmail(res.user.email || 'Admin');
        setAdminRole(res.role || 'admin');
      } else {
        setAuthError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDevPasskeyLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const res = loginAdminDev(passkey);
    if (res.success) {
      setIsUnlocked(true);
      setAdminUserEmail('Local Developer (Offline)');
      setAdminRole('dev_local');
    } else {
      setAuthError(res.error || 'Incorrect development passkey.');
    }
  };

  const handleSignOut = async () => {
    await signOutAdmin();
    setIsUnlocked(false);
    setAdminUserEmail(null);
    setAdminRole(null);
    setEmail('');
    setPassword('');
    setPasskey('');
    onClose();
  };

  // If already unlocked, render full comprehensive dashboard!
  if (isUnlocked) {
    return (
      <AdminDashboard
        onClose={onClose}
        onSignOut={handleSignOut}
        adminUserEmail={adminUserEmail}
      />
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200 ${
        adminTheme === 'dark' ? 'dark' : ''
      }`}
    >
      <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-pink-100 dark:border-stone-800 space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3">
          <div className="relative inline-block mx-auto">
            <RoyalCrestLogo size="xl" variant="crest" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#702C43] border-2 border-white dark:border-stone-900 flex items-center justify-center text-amber-300 shadow-md">
              <Lock className="w-3 h-3" />
            </div>
          </div>
          <div>
            <h2 className="font-serif font-bold text-2xl text-stone-900 dark:text-stone-100 tracking-tight">
              Wedding Administration
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Protected family portal for ceremony schedule, memories moderation, and settings.
            </p>
          </div>
        </div>

        {/* Tab Mode Switcher: Supabase Auth vs Dev Offline Mode */}
        {isDevAllowed ? (
          <div className="flex rounded-xl bg-stone-100 dark:bg-stone-800 p-1 border border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={() => {
                setAuthMode('supabase');
                setAuthError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                authMode === 'supabase'
                  ? 'bg-white dark:bg-stone-700 text-[#702C43] dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Supabase Auth (Cloud)
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('dev_passkey');
                setAuthError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                authMode === 'dev_passkey'
                  ? 'bg-white dark:bg-stone-700 text-[#702C43] dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Dev Mode (Local)
            </button>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-[#F8E3E9]/50 border border-[#EBD9DE] flex items-center gap-2 text-xs text-[#702C43]">
            <Shield className="w-4 h-4 text-[#702C43] shrink-0" />
            <span>Production Mode: Authenticate with verified Supabase credentials.</span>
          </div>
        )}

        {authError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-800 dark:text-red-200 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {authMode === 'supabase' ? (
          <form onSubmit={handleSupabaseLogin} className="space-y-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@wedding.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-burgundy/20"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-burgundy/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3 mt-2 bg-[#702C43] hover:bg-[#5C2336] text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAuthenticating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying administrator privileges...</span>
                </>
              ) : (
                <>
                  <span>Sign In with Supabase</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleDevPasskeyLogin} className="space-y-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Local Development Mode</strong>: Changes will persist only to this browser (LocalStorage) and will <strong>NOT</strong> sync to Supabase or bypass database-level RLS.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Development Passkey
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Enter local dev passkey..."
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  autoFocus
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-burgundy/20"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#702C43] hover:bg-[#5C2336] text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Unlock Local Dev Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-center">
          <span className="text-[11px] text-stone-400">
            {isSupabaseConfigured
              ? 'Supabase backend connected • Protected by public.wedding_admins RLS'
              : 'Standalone local mode • Connect Supabase for multi-device sync'}
          </span>
        </div>
      </div>
    </div>
  );
};
