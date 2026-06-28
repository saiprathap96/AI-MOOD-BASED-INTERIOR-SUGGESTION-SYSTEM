import React, { useState, useContext } from 'react';
import { Armchair, Eye, EyeOff, Lock, User, ShieldCheck, LogIn, Sparkles } from 'lucide-react';
import { ToastContext } from '../App';

// Demo credentials for role-based access
const CREDENTIALS = {
  admin: { username: 'admin', password: 'admin123', role: 'admin' },
  user:  { username: 'user',  password: 'user123',  role: 'user'  },
};

export default function Login({ onLogin, darkMode }) {
  const { addToast } = useContext(ToastContext);

  const [form, setForm]           = useState({ username: '', password: '' });
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState({});
  const [activeRole, setActiveRole] = useState(null); // visual hint of which role tab

  // ── helpers ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required';
    if (!form.password)        e.password = 'Password is required';
    return e;
  };

  const fillDemo = (role) => {
    setActiveRole(role);
    setForm({ username: CREDENTIALS[role].username, password: CREDENTIALS[role].password });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 900));

    const match = Object.values(CREDENTIALS).find(
      (c) => c.username === form.username.trim() && c.password === form.password
    );

    if (match) {
      addToast(`Welcome back, ${match.role === 'admin' ? 'Administrator' : 'User'}! 🎉`, 'success');
      onLogin({ username: match.username, role: match.role });
    } else {
      setErrors({ form: 'Invalid username or password. Please try again.' });
      addToast('Login failed. Check your credentials.', 'error');
    }
    setLoading(false);
  };

  // ── render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-brand-cream dark:bg-brand-bgDark">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand-goldLight/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-gold/5 rounded-full blur-3xl" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/70 dark:bg-brand-cardDark/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-brand-gold/20 dark:border-brand-gold/10 overflow-hidden animate-slide-up">

          {/* Top accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-brand-gold via-brand-goldLight to-brand-gold" />

          <div className="px-8 pt-8 pb-10">

            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-brand-gold text-brand-cream p-3 rounded-2xl shadow-lg shadow-brand-gold/30">
                  <Armchair className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-serif text-2xl font-bold text-brand-dark dark:text-brand-cream leading-tight">
                    Sri Venkata Sai
                  </p>
                  <p className="text-[11px] tracking-widest uppercase text-brand-gold font-semibold">
                    Furniture Works
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-brand-textMuted dark:text-brand-textMuted text-sm mt-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-goldLight" />
                <span>AI-Powered Interior Suggestions</span>
                <Sparkles className="w-3.5 h-3.5 text-brand-goldLight" />
              </div>
            </div>

            {/* Role selector pills (quick-fill demo) */}
            <div className="mb-6">
              <p className="text-xs text-brand-textMuted dark:text-brand-textMuted text-center mb-3 uppercase tracking-wider font-medium">
                Quick Demo Login
              </p>
              <div className="flex gap-3">
                {/* Admin pill */}
                <button
                  type="button"
                  onClick={() => fillDemo('admin')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                    activeRole === 'admin'
                      ? 'bg-brand-gold border-brand-gold text-white shadow-lg shadow-brand-gold/30 scale-[1.02]'
                      : 'border-brand-gold/30 text-brand-gold dark:text-brand-goldLight hover:bg-brand-gold/10 dark:hover:bg-brand-gold/10'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </button>

                {/* User pill */}
                <button
                  type="button"
                  onClick={() => fillDemo('user')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                    activeRole === 'user'
                      ? 'bg-brand-dark border-brand-dark text-white dark:bg-brand-goldLight dark:border-brand-goldLight shadow-lg scale-[1.02]'
                      : 'border-brand-dark/30 text-brand-dark dark:text-brand-cream/70 dark:border-brand-cream/20 hover:bg-brand-dark/10 dark:hover:bg-brand-cream/5'
                  }`}
                >
                  <User className="w-4 h-4" />
                  User
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-brand-dark/10 dark:bg-brand-cream/10" />
              <span className="text-xs text-brand-textMuted uppercase tracking-widest">or sign in manually</span>
              <div className="flex-1 h-px bg-brand-dark/10 dark:bg-brand-cream/10" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* Global error */}
              {errors.form && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 text-sm rounded-xl px-4 py-3 animate-fade-in">
                  {errors.form}
                </div>
              )}

              {/* Username */}
              <div>
                <label htmlFor="login-username" className="block text-xs font-semibold text-brand-dark/70 dark:text-brand-cream/60 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="login-username"
                    type="text"
                    name="username"
                    autoComplete="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm bg-brand-sand/60 dark:bg-brand-bgDark/60 border text-brand-dark dark:text-brand-cream placeholder:text-brand-textMuted focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all duration-200 ${
                      errors.username
                        ? 'border-red-400 dark:border-red-500'
                        : 'border-brand-gold/20 dark:border-brand-cream/10 focus:border-brand-gold'
                    }`}
                  />
                </div>
                {errors.username && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 ml-1">{errors.username}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="block text-xs font-semibold text-brand-dark/70 dark:text-brand-cream/60 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={`w-full pl-11 pr-12 py-3 rounded-xl text-sm bg-brand-sand/60 dark:bg-brand-bgDark/60 border text-brand-dark dark:text-brand-cream placeholder:text-brand-textMuted focus:outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all duration-200 ${
                      errors.password
                        ? 'border-red-400 dark:border-red-500'
                        : 'border-brand-gold/20 dark:border-brand-cream/10 focus:border-brand-gold'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-textMuted hover:text-brand-gold transition-colors"
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 ml-1">{errors.password}</p>
                )}
              </div>

              {/* Submit */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2.5 bg-brand-gold hover:bg-brand-goldLight active:scale-[0.98] text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-brand-gold/30 hover:shadow-brand-gold/50 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm tracking-wide"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Signing In…
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Credential hints */}
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-brand-textMuted dark:text-brand-textMuted/70">
              <div className="bg-brand-gold/5 dark:bg-brand-gold/10 rounded-xl p-3 border border-brand-gold/10">
                <p className="flex items-center gap-1 font-semibold text-brand-gold mb-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin
                </p>
                <p>user: <span className="font-mono text-brand-dark dark:text-brand-cream">admin</span></p>
                <p>pass: <span className="font-mono text-brand-dark dark:text-brand-cream">admin123</span></p>
              </div>
              <div className="bg-brand-dark/5 dark:bg-brand-cream/5 rounded-xl p-3 border border-brand-dark/10 dark:border-brand-cream/10">
                <p className="flex items-center gap-1 font-semibold text-brand-dark dark:text-brand-cream/80 mb-1.5">
                  <User className="w-3.5 h-3.5" /> User
                </p>
                <p>user: <span className="font-mono text-brand-dark dark:text-brand-cream">user</span></p>
                <p>pass: <span className="font-mono text-brand-dark dark:text-brand-cream">user123</span></p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-brand-textMuted mt-5">
          &copy; {new Date().getFullYear()} Sri Venkata Sai Furniture Works &mdash; All rights reserved.
        </p>
      </div>
    </div>
  );
}
