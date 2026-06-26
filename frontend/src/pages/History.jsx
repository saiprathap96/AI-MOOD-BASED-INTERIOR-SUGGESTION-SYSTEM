import React, { useState, useEffect } from 'react';
import { Calendar, Trash2, ChevronDown, ChevronUp, Armchair, ArrowRight, Sparkles, Filter, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import useToast from '../hooks/useToast';
import StarRating from '../components/StarRating';

export default function History({ navigate }) {
  const { addToast } = useToast();
  
  // States
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filterRoom, setFilterRoom] = useState('All');
  const [deletingId, setDeletingId] = useState(null);

  // Fetch history list
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/suggestions/history');
      if (response.success) {
        setHistory(response.data);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      addToast('Could not load suggestions history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Handle deletion of suggestion
  // Handle deletion of suggestion (confirmed)
  const handleConfirmDelete = async (id) => {
    try {
      const response = await api.delete(`/suggestions/${id}`);
      if (response.success) {
        setHistory(prev => prev.filter(item => item.id !== id));
        if (expandedId === id) setExpandedId(null);
        setDeletingId(null);
        addToast('Suggestion deleted successfully.', 'success');
      }
    } catch (error) {
      console.error('Delete error:', error);
      addToast('Failed to delete suggestion.', 'error');
    }
  };

  // Toggle accordion expansion
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Filter history list
  const filteredHistory = filterRoom === 'All'
    ? history
    : history.filter(item => item.roomType === filterRoom);

  const roomOptions = ['All', 'Living Room', 'Bedroom', 'Office', 'Dining Room', 'Kitchen'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="font-serif text-3xl font-bold text-brand-dark dark:text-brand-cream">
            Design History
          </h1>
          <p className="text-sm text-brand-textMuted">
            Review and manage all past AI furniture mood boards you have generated.
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 bg-white dark:bg-brand-cardDark border px-3 py-2 rounded-xl self-center shadow-sm">
          <Filter className="w-4 h-4 text-brand-gold" />
          <select
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            className="text-xs font-semibold bg-transparent outline-none cursor-pointer text-brand-dark dark:text-brand-cream dark:bg-brand-cardDark"
            aria-label="Filter history by room type"
          >
            {roomOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-brand-cardDark h-20 rounded-xl animate-pulse border border-brand-dark/5 dark:border-brand-cream/5"></div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && filteredHistory.length === 0 && (
        <div className="bg-white dark:bg-brand-cardDark border border-brand-dark/10 dark:border-brand-cream/10 rounded-2xl shadow-sm p-12 text-center space-y-6 flex flex-col items-center justify-center min-h-[350px]">
          <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-sm">
            <h3 className="font-serif text-lg font-bold text-brand-dark dark:text-brand-cream">
              {filterRoom === 'All' ? 'No History Found' : `No ${filterRoom} Designs`}
            </h3>
            <p className="text-sm text-brand-textMuted">
              {filterRoom === 'All' 
                ? 'You haven\'t generated any interior suggestions yet.' 
                : `You haven't generated suggestions for ${filterRoom} rooms yet.`}
            </p>
          </div>
          <button
            onClick={() => navigate('tool')}
            className="bg-brand-gold hover:bg-brand-goldLight text-brand-cream font-medium px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-md transition-all active:scale-[0.98]"
          >
            <span>Create a Suggestion</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HISTORY CARDS LIST */}
      {!loading && filteredHistory.length > 0 && (
        <div className="space-y-4">
          {filteredHistory.map((item) => {
            const isExpanded = expandedId === item.id;
            const formattedDate = new Date(item.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            });

            return (
              <div 
                key={item.id}
                className={`bg-white dark:bg-brand-cardDark border rounded-2xl transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md ${
                  isExpanded 
                    ? 'border-brand-gold/60 ring-1 ring-brand-gold/20' 
                    : 'border-brand-dark/10 dark:border-brand-cream/10'
                }`}
              >
                {/* Header/Summary Line (Click to toggle) */}
                <div 
                  onClick={() => toggleExpand(item.id)}
                  className="p-5 flex items-center justify-between cursor-pointer select-none gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="bg-brand-gold/10 text-brand-gold p-2.5 rounded-xl shrink-0">
                      <Armchair className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-base font-bold text-brand-dark dark:text-brand-cream">
                          {item.roomType}
                        </h3>
                        {item.rating && (
                          <span className="text-[10px] font-bold text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded">
                            ★ {item.rating}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-textMuted font-medium pt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formattedDate}
                        </span>
                        <span>
                          Budget: <strong>₹{item.budget.toLocaleString('en-IN')}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {deletingId === item.id ? (
                      <div className="flex items-center gap-1.5 no-print">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfirmDelete(item.id);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] uppercase tracking-wider px-2 py-1.5 rounded-md transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(null);
                          }}
                          className="border border-brand-dark/20 dark:border-brand-cream/20 hover:bg-brand-dark/5 dark:hover:bg-brand-cream/5 text-brand-dark/70 dark:text-brand-cream/70 font-semibold text-[10px] uppercase tracking-wider px-2 py-1.5 rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(item.id);
                        }}
                        className="p-2 rounded-lg text-brand-textMuted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Delete entry"
                        aria-label="Delete suggestion"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {/* Expand Chevron */}
                    <div className="p-1 text-brand-textMuted bg-brand-cream/60 dark:bg-brand-bgDark rounded-lg">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="border-t border-brand-dark/10 dark:border-brand-cream/10 bg-brand-cream/10 dark:bg-brand-bgDark/20 p-6 sm:p-8 space-y-6 animate-fade-in">
                    
                    {/* Furniture Item Grid */}
                    <div>
                      <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-brand-textMuted mb-3">
                        Furniture Items
                      </h4>
                      <div className="border border-brand-dark/10 dark:border-brand-cream/10 rounded-xl overflow-hidden bg-white dark:bg-brand-cardDark">
                        {item.recommendation.furnitureSet.map((fItem, fIdx) => (
                          <div 
                            key={fIdx}
                            className="flex justify-between p-3.5 border-b border-brand-dark/5 dark:border-brand-cream/5 last:border-b-0 text-xs sm:text-sm"
                          >
                            <div>
                              <p className="font-serif font-bold text-brand-dark dark:text-brand-cream">{fItem.name}</p>
                              <p className="text-[10px] text-brand-textMuted font-medium pt-0.5">Material: {fItem.material}</p>
                            </div>
                            <span className="font-bold text-brand-gold align-middle pt-1">
                              ₹{fItem.price.toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Style Notes & Tips Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      <div className="space-y-2">
                        <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-brand-textMuted">
                          Colour & Styling details
                        </h4>
                        <div className="p-4 bg-white dark:bg-brand-cardDark rounded-xl border border-brand-dark/5 dark:border-brand-cream/5 text-xs leading-relaxed text-brand-dark/80 dark:text-brand-cream/80">
                          {item.recommendation.colourStyleNotes}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-brand-textMuted">
                          Styling Tips
                        </h4>
                        <ul className="space-y-2">
                          {item.recommendation.stylingTips.map((tip, tIdx) => (
                            <li key={tIdx} className="flex gap-2 text-xs text-brand-dark/80 dark:text-brand-cream/80">
                              <span className="w-4 h-4 rounded-full bg-brand-gold/15 text-brand-gold font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                                {tIdx + 1}
                              </span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="p-4.5 bg-brand-gold/5 border border-brand-gold/20 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                      <div className="space-y-1">
                        <p className="text-brand-textMuted font-semibold uppercase text-[9px] tracking-wider">Estimated Investment</p>
                        <p className="text-brand-dark dark:text-brand-cream">
                          Total Set Cost: <strong>₹{item.recommendation.budgetSummary.totalCost.toLocaleString('en-IN')}</strong> (Budget remaining: ₹{item.recommendation.budgetSummary.remaining.toLocaleString('en-IN')})
                        </p>
                      </div>
                      <span className="text-[10px] italic text-brand-textMuted">
                        {item.recommendation.budgetSummary.notes}
                      </span>
                    </div>

                    {/* Star Rating Feedback Interface */}
                    <StarRating 
                      suggestionId={item.id} 
                      initialRating={item.rating} 
                      onRate={(val) => {
                        // Update local history array element rating score
                        setHistory(prev => prev.map(histItem => 
                          histItem.id === item.id ? { ...histItem, rating: val } : histItem
                        ));
                      }} 
                    />

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
    </div>
  );
}
