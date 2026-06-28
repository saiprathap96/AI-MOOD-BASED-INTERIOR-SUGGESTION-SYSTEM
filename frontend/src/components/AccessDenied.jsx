import React from 'react';
import { ShieldOff, ArrowLeft } from 'lucide-react';

/**
 * AccessDenied — shown when a user without sufficient privileges
 * tries to access a restricted page.
 */
export default function AccessDenied({ navigate }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center animate-fade-in">
      {/* Icon bubble */}
      <div className="w-24 h-24 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-6 shadow-inner">
        <ShieldOff className="w-10 h-10 text-red-400" />
      </div>

      <h2 className="font-serif text-3xl font-bold text-brand-dark dark:text-brand-cream mb-3">
        Access Denied
      </h2>
      <p className="text-sm text-brand-textMuted max-w-sm leading-relaxed mb-8">
        You don&apos;t have permission to view this page.
        This area is restricted to <span className="font-semibold text-brand-gold">Administrators</span> only.
      </p>

      <button
        onClick={() => navigate('home')}
        className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-goldLight text-white font-semibold px-6 py-3 rounded-xl shadow-md shadow-brand-gold/20 transition-all active:scale-[0.98] text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>
    </div>
  );
}
