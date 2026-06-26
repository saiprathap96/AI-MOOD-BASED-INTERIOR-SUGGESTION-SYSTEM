import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Star, Database, Flame, Clock, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import useToast from '../hooks/useToast';
import { BarChart, DonutChart, LineChart } from '../components/AnalyticsCharts';

export default function AdminDashboard() {
  const { addToast } = useToast();
  
  // Analytics States
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch metrics data
  const fetchMetrics = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await api.get('/suggestions/analytics');
      if (response.success) {
        setAnalytics(response.data);
        if (silent) addToast('Analysis metrics refreshed!', 'info');
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      addToast('Could not fetch dashboard metrics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  // Determine top room type
  const getTopRoomType = () => {
    if (!analytics || !analytics.popularRoomTypes || analytics.popularRoomTypes.length === 0) return 'N/A';
    return analytics.popularRoomTypes[0].name;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-brand-dark/10 dark:border-brand-cream/10 pb-6">
        <div className="text-center sm:text-left space-y-1">
          <h1 className="font-serif text-3xl font-bold text-brand-dark dark:text-brand-cream">
            Analysis Dashboard
          </h1>
          <p className="text-sm text-brand-textMuted">
            Monitor AI system performance, customer usage trends, and design quality ratings.
          </p>
        </div>
        
        {/* Refresh button */}
        <button
          onClick={() => fetchMetrics(true)}
          disabled={loading}
          className="flex items-center gap-2 border border-brand-dark/20 hover:border-brand-dark dark:border-brand-cream/20 dark:hover:border-brand-cream hover:bg-brand-cream/30 dark:hover:bg-brand-cream/5 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* LOADING OVERLAY */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-white dark:bg-brand-cardDark border rounded-2xl"></div>
          ))}
        </div>
      )}

      {/* MAIN DASHBOARD */}
      {!loading && analytics && (
        <div className="space-y-10 animate-fade-in">
          
          {/* 1. KPI STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Total Generated */}
            <div className="bg-white dark:bg-brand-cardDark p-6 rounded-2xl border border-brand-dark/10 dark:border-brand-cream/10 shadow-sm flex items-center justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-textMuted">Total Mood Boards</span>
                <p className="text-3xl font-bold font-serif text-brand-dark dark:text-brand-cream">{analytics.totalSuggestions}</p>
              </div>
              <div className="bg-brand-gold/10 p-3 rounded-xl text-brand-gold">
                <LayoutDashboard className="w-6 h-6" />
              </div>
            </div>

            {/* Card 2: Average Rating */}
            <div className="bg-white dark:bg-brand-cardDark p-6 rounded-2xl border border-brand-dark/10 dark:border-brand-cream/10 shadow-sm flex items-center justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-textMuted">Average Rating</span>
                <p className="text-3xl font-bold font-serif text-brand-dark dark:text-brand-cream">
                  {analytics.averageRating > 0 ? `${analytics.averageRating} / 5` : 'No ratings'}
                </p>
              </div>
              <div className="bg-brand-gold/10 p-3 rounded-xl text-brand-gold">
                <Star className="w-6 h-6 fill-brand-gold text-brand-gold" />
              </div>
            </div>

            {/* Card 3: Top Room Type */}
            <div className="bg-white dark:bg-brand-cardDark p-6 rounded-2xl border border-brand-dark/10 dark:border-brand-cream/10 shadow-sm flex items-center justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-textMuted">Most Popular Room</span>
                <p className="text-lg font-bold font-serif text-brand-dark dark:text-brand-cream truncate max-w-[150px]">{getTopRoomType()}</p>
              </div>
              <div className="bg-brand-gold/10 p-3 rounded-xl text-brand-gold">
                <Flame className="w-6 h-6" />
              </div>
            </div>

            {/* Card 4: Database Connection status */}
            <div className="bg-white dark:bg-brand-cardDark p-6 rounded-2xl border border-brand-dark/10 dark:border-brand-cream/10 shadow-sm flex items-center justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-textMuted">Storage Node</span>
                <p className="text-xs font-semibold bg-brand-gold/10 text-brand-gold px-2.5 py-1 rounded-md mt-1 inline-block">
                  Active
                </p>
              </div>
              <div className="bg-brand-gold/10 p-3 rounded-xl text-brand-gold">
                <Database className="w-6 h-6" />
              </div>
            </div>

          </div>

          {/* 2. ANALYTICS CHARTS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Box: Popularity (Bar Chart) */}
            <div className="lg:col-span-6 bg-white dark:bg-brand-cardDark p-6 sm:p-8 rounded-3xl border border-brand-dark/10 dark:border-brand-cream/10 shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-brand-dark dark:text-brand-cream">
                  Room Type Popularity
                </h3>
                <p className="text-xs text-brand-textMuted">
                  Distribution of AI furniture set requests across different room classes.
                </p>
              </div>
              
              <div className="border border-brand-dark/5 dark:border-brand-cream/5 p-4 rounded-2xl bg-brand-cream/20 dark:bg-brand-bgDark/20">
                <BarChart data={analytics.popularRoomTypes} />
              </div>
            </div>

            {/* Right Box: Budget (Donut Chart) */}
            <div className="lg:col-span-6 bg-white dark:bg-brand-cardDark p-6 sm:p-8 rounded-3xl border border-brand-dark/10 dark:border-brand-cream/10 shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-brand-dark dark:text-brand-cream">
                  Budget Distribution
                </h3>
                <p className="text-xs text-brand-textMuted">
                  Segmentation of design requests by customer pricing category (₹).
                </p>
              </div>
              
              <div className="border border-brand-dark/5 dark:border-brand-cream/5 p-4 rounded-2xl bg-brand-cream/20 dark:bg-brand-bgDark/20">
                <DonutChart data={analytics.budgetDistribution} />
              </div>
            </div>

            {/* Bottom Box: Usage Trend (Line Chart) */}
            <div className="lg:col-span-12 bg-white dark:bg-brand-cardDark p-6 sm:p-8 rounded-3xl border border-brand-dark/10 dark:border-brand-cream/10 shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-brand-dark dark:text-brand-cream">
                  Daily Generation Trend
                </h3>
                <p className="text-xs text-brand-textMuted">
                  Visual timeline representing mood boards generated over the past 7 days.
                </p>
              </div>
              
              <div className="border border-brand-dark/5 dark:border-brand-cream/5 p-6 rounded-2xl bg-brand-cream/20 dark:bg-brand-bgDark/20 overflow-x-auto">
                <div className="min-w-[480px]">
                  <LineChart data={analytics.dailyTrend} />
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
