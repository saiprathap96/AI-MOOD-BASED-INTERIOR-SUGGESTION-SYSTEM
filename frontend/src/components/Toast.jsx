import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  // Automatically slide out/fade after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      // Cleanup handled by App.jsx
    }, 3800);
    return () => clearTimeout(timer);
  }, []);

  const styles = {
    success: {
      bg: 'bg-white dark:bg-brand-cardDark',
      border: 'border-l-4 border-brand-gold',
      text: 'text-brand-dark dark:text-brand-cream',
      icon: <CheckCircle2 className="w-5 h-5 text-brand-gold shrink-0" />
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-l-4 border-red-500',
      text: 'text-red-800 dark:text-red-200',
      icon: <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-l-4 border-blue-500',
      text: 'text-blue-800 dark:text-blue-200',
      icon: <Info className="w-5 h-5 text-blue-500 shrink-0" />
    }
  };

  const currentStyle = styles[type] || styles.success;

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg shadow-lg border border-brand-dark/5 dark:border-brand-cream/5 ${currentStyle.bg} ${currentStyle.border} ${currentStyle.text} animate-slide-up w-full`}>
      <div className="flex items-center gap-3">
        {currentStyle.icon}
        <span className="text-sm font-medium">{message}</span>
      </div>
      <button 
        onClick={onClose}
        className="text-brand-dark/40 hover:text-brand-dark dark:text-brand-cream/40 dark:hover:text-brand-cream p-1 rounded transition-colors ml-4"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
