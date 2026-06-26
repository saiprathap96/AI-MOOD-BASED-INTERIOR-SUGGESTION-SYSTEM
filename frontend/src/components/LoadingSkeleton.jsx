import React from 'react';
import { Sparkles } from 'lucide-react';

export default function LoadingSkeleton() {
  return (
    <div className="w-full bg-white dark:bg-brand-cardDark border border-brand-dark/10 dark:border-brand-cream/10 rounded-2xl shadow-xl overflow-hidden animate-pulse">
      
      {/* Skeleton Top Bar */}
      <div className="bg-brand-gold/10 p-6 flex flex-col sm:flex-row items-center justify-between border-b border-brand-dark/10 dark:border-brand-cream/10 gap-4">
        <div className="space-y-2 text-center sm:text-left">
          <div className="h-6 w-48 bg-brand-gold/20 rounded-md mx-auto sm:mx-0"></div>
          <div className="h-4 w-32 bg-brand-dark/10 dark:bg-brand-cream/10 rounded-md mx-auto sm:mx-0"></div>
        </div>
        <div className="flex items-center gap-2 text-brand-gold bg-brand-gold/5 px-4 py-2 rounded-full border border-brand-gold/20">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span className="text-sm font-semibold tracking-wide">Designing your space...</span>
        </div>
      </div>

      {/* Skeleton Content Grid */}
      <div className="p-6 sm:p-8 space-y-8">
        
        {/* Recommended Furniture Set */}
        <div>
          <div className="h-6 w-60 bg-brand-dark/15 dark:bg-brand-cream/15 rounded-md mb-4"></div>
          <div className="border border-brand-dark/10 dark:border-brand-cream/10 rounded-xl overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="flex flex-col sm:flex-row justify-between p-4 border-b border-brand-dark/5 dark:border-brand-cream/5 last:border-b-0 gap-2 bg-brand-cream/10 dark:bg-brand-bgDark/15"
              >
                <div className="space-y-2">
                  <div className="h-5 w-40 sm:w-56 bg-brand-dark/15 dark:bg-brand-cream/15 rounded-md"></div>
                  <div className="h-4 w-24 sm:w-36 bg-brand-dark/10 dark:bg-brand-cream/10 rounded-sm"></div>
                </div>
                <div className="h-5 w-20 bg-brand-gold/20 rounded-md shrink-0 sm:self-center"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Mid Grid (Notes & Tips) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Style Notes */}
          <div className="space-y-4">
            <div className="h-6 w-44 bg-brand-dark/15 dark:bg-brand-cream/15 rounded-md"></div>
            <div className="p-5 bg-brand-cream/30 dark:bg-brand-bgDark/30 rounded-xl border border-brand-dark/5 dark:border-brand-cream/5 space-y-2">
              <div className="h-4 w-full bg-brand-dark/10 dark:bg-brand-cream/10 rounded"></div>
              <div className="h-4 w-full bg-brand-dark/10 dark:bg-brand-cream/10 rounded"></div>
              <div className="h-4 w-5/6 bg-brand-dark/10 dark:bg-brand-cream/10 rounded"></div>
            </div>
          </div>

          {/* Styling Tips */}
          <div className="space-y-4">
            <div className="h-6 w-40 bg-brand-dark/15 dark:bg-brand-cream/15 rounded-md"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-gold/20 shrink-0"></div>
                  <div className="flex-grow space-y-2">
                    <div className="h-4 w-full bg-brand-dark/10 dark:bg-brand-cream/10 rounded"></div>
                    <div className="h-4 w-3/4 bg-brand-dark/10 dark:bg-brand-cream/10 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Budget Summary Card */}
        <div className="p-6 bg-brand-gold/5 border border-brand-gold/15 rounded-2xl space-y-4">
          <div className="h-6 w-44 bg-brand-gold/20 rounded-md"></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-4 w-20 bg-brand-dark/10 dark:bg-brand-cream/10 rounded"></div>
                <div className="h-7 w-28 bg-brand-gold/20 rounded"></div>
              </div>
            ))}
          </div>
          <div className="h-4 w-2/3 bg-brand-dark/10 dark:bg-brand-cream/10 rounded mt-2"></div>
        </div>

      </div>
    </div>
  );
}
