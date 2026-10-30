import React, { useState, useEffect } from 'react';
import { Lock, KeyRound, ArrowRight, X, ShieldAlert, Mail, UserCheck, Shield, LogOut } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { AdminDashboard } from '../admin/AdminDashboard';
import { RoyalCrestLogo } from '../common/RoyalCrestLogo';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const [authMode, setAuthMode] = useState<'passkey' | 'supabase'>('passkey');
  const [passkey, setPasskey] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [adminUserEmail, setAdminUserEmail] = useState<string | null>(null);

  const configuredPasskey = import.meta.env.VITE_ADMIN_PASSKEY || 'wedding2026';

  // Check existing session
  useEffect(() => {
    if (!isOpen) return;

    // Check session storage
    const localSession = sessionStorage.getItem('wedding_admin_authenticated');
    if (localSession === 'true') {
      setIsUnlocked(true);
      return;
    }

    // Check Supabase session
    if (isSupabaseConfigured && supabase) {
      void supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user) {
          setIsUnlocked(true);
          setAdminUserEmail(session.user.email || 'Admin');
        }
      });
    }
  }, [isOpen]);

  const adminTheme = (() => {
    try {
      return localStorage.getItem('wedding_admin_theme_mode') === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  })();

  if (!isOpen) return null;

  const handlePasskeyUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const entered = passkey.trim();
    if (entered && entered === configuredPasskey) {
      setIsUnlocked(true);
      try {
        sessionStorage.setItem('wedding_admin_authenticated', 'true');
      } catch {
        // Ignore
      }
    } else {
      setAuthError('Incorrect passkey. Please verify with the couple or check your administrator passkey.');
    }
  };

  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setAuthError('Supabase is not configured in this environment. Please use Family Passkey mode.');
      return;
    }

    try {
      setIsAuthenticating(true);
      setAuthError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        setAuthError(error.message || 'Authentication failed. Please check credentials.');
        return;
      }

      if (data.session) {
        setIsUnlocked(true);
        setAdminUserEmail(data.user.email || 'Admin');
        try {
          sessionStorage.setItem('wedding_admin_authenticated', 'true');
        } catch {
          // Ignore
        }
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      sessionStorage.removeItem('wedding_admin_authenticated');
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch {
      // Ignore
    }
    setIsUnlocked(false);
    setAdminUserEmail(null);
    setPasskey('');
    setPassword('');
    onClose();
  };

  // If already unlocked, render full comprehensive dashboard!
  if (isUnlocked) {
    return <AdminDashboard onClose={onClose} onSignOut={handleSignOut} adminUserEmail={adminUserEmail} />;
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
              Family coordinator portal for schedule, RSVP guests, memories moderation, and settings.
            </p>
          </div>
        </div>

        {/* Tab Mode Switcher: Passkey vs Supabase Auth */}
        <div className="flex rounded-xl bg-stone-100 dark:bg-stone-800 p-1 border border-stone-200 dark:border-stone-700">
          <button
            type="button"
            onClick={() => {
              setAuthMode('passkey');
              setAuthError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              authMode === 'passkey'
                ? 'bg-white dark:bg-stone-700 text-[#702C43] dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Family Passkey
          </button>
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
            Supabase Auth
          </button>
        </div>

        {authError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-800 dark:text-red-200 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {authMode === 'passkey' ? (
          <form onSubmit={handlePasskeyUnlock} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Admin Passkey
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Enter passkey..."
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  autoFocus
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-burgundy/20"
                />
              </div>
              <p className="text-[11px] text-stone-400">
                Configured passkey or standard demo: <code className="text-[#702C43] font-mono">wedding2026</code>
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#702C43] hover:bg-[#5C2336] text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Unlock Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
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
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In with Supabase</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-center">
          <span className="text-[11px] text-stone-400">
            {isSupabaseConfigured
              ? 'Supabase backend connected • Protected by RLS policies'
              : 'Local-first mode active • Ready for Supabase connection'}
          </span>
        </div>
      </div>
    </div>
  );
};
