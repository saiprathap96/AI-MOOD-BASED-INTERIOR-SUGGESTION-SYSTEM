import React, { useState, useEffect } from 'react';
import { Sparkles, Clipboard, Copy, FileText, Send, RefreshCw, Armchair, HelpCircle } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import StarRating from '../components/StarRating';
import api from '../utils/api';
import useToast from '../hooks/useToast';

export default function SuggestionTool({ navigate }) {
  const { addToast } = useToast();
  
  // Form States
  const [roomType, setRoomType] = useState('Living Room');
  const [colourPreference, setColourPreference] = useState('');
  const [budget, setBudget] = useState(150000);
  
  // UI & Network States
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [errors, setErrors] = useState({});

  // Preset templates
  const presets = [
    { label: '🛋️ Royal Living', room: 'Living Room', color: 'Terracotta and Cream', budget: 250000 },
    { label: '🛏️ Olive Bed', room: 'Bedroom', color: 'Olive Green and Gold', budget: 90000 },
    { label: '💼 Walnut Office', room: 'Office', color: 'Midnight Blue and Walnut', budget: 60000 },
    { label: '🍳 Modern Kitchen', room: 'Kitchen', color: 'Charcoal and Rose Gold', budget: 300000 }
  ];

  // Colors Suggestions
  const colorSuggestions = [
    'Warm Beige & Dark Walnut',
    'Sage Green & Oak Wood',
    'Midnight Blue & Brass',
    'Blush Pink & Neutral Grey',
    'Teal & Natural Ash'
  ];

  // Apply a template preset
  const handleApplyPreset = (preset) => {
    setRoomType(preset.room);
    setColourPreference(preset.color);
    setBudget(preset.budget);
    setErrors({});
    addToast(`Preset "${preset.label}" loaded!`, 'info');
  };

  // Validate form inputs
  const validateForm = () => {
    const newErrors = {};
    if (!roomType) newErrors.roomType = 'Please select a room type.';
    if (!colourPreference.trim()) newErrors.colourPreference = 'Colour preferences are required.';
    
    const budgetNum = Number(budget);
    if (!budgetNum || isNaN(budgetNum)) {
      newErrors.budget = 'Please enter a valid number.';
    } else if (budgetNum < 15000) {
      newErrors.budget = 'Budget must be at least ₹15,000.';
    } else if (budgetNum > 5000000) {
      newErrors.budget = 'Budget cannot exceed ₹50,00,000.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit suggestion request — normalizes flat Flask response into nested shape
  const handleGenerate = async (e) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      addToast('Please fix the errors in the form.', 'error');
      return;
    }

    setLoading(true);
    setSuggestion(null);

    try {
      const response = await api.post('/suggestions/generate', {
        roomType,
        colourPreference,
        budget: Number(budget)
      });

      if (response.success) {
        const d = response.data;

        // Map flat backend fields -> nested shape the render section expects
        const furnitureSet = (d.furniture_set || []).map(item => ({
          name:     item.name        || 'Unknown Item',
          material: item.description || item.dimensions || '',
          price:    Number(item.price) || 0,
          category: item.category    || '',
        }));

        const totalCost = Number(d.total_set_cost) || furnitureSet.reduce((s, i) => s + i.price, 0);
        const remaining = Number(budget) - totalCost;

        // Split styling_notes into a short intro note + bullet tips
        const rawNotes  = d.styling_notes || '';
        const sentences = rawNotes.split(/\.\s+/).filter(s => s.trim().length > 5);
        const colourNote = sentences.length > 0 ? sentences[0] + '.' : rawNotes;
        const tips = sentences.length > 1
          ? sentences.slice(1).map(s => s.endsWith('.') ? s : s + '.')
          : [rawNotes];

        const normalized = {
          // integer id -> string so .substring() works
          id:               String(d.history_id || d.output_id || Date.now()),
          output_id:        d.output_id,
          history_id:       d.history_id,
          roomType:         d.roomType         || roomType,
          colourPreference: d.colourPreference || colourPreference,
          budget:           Number(d.budget)   || Number(budget),
          createdAt:        d.created_at ? new Date(d.created_at).toISOString() : new Date().toISOString(),
          rating:           d.rating || null,
          recommendation: {
            furnitureSet,
            colourStyleNotes: colourNote,
            stylingTips:      tips,
            budgetSummary: {
              totalCost,
              remaining: Math.max(0, remaining),
              notes: `This curated set uses Rs.${totalCost.toLocaleString('en-IN')} of your Rs.${Number(budget).toLocaleString('en-IN')} budget, leaving Rs.${Math.max(0, remaining).toLocaleString('en-IN')} for accessories and decor.`,
            }
          }
        };

        setSuggestion(normalized);
        addToast('Mood board generated successfully!', 'success');
      } else {
        throw new Error(response.message || 'Generation failed');
      }
    } catch (error) {
      console.error(error);
      addToast(error.message || 'Failed to connect to backend.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Copy Suggestion Text to Clipboard
  const handleCopyToClipboard = () => {
    if (!suggestion) return;
    
    const rec = suggestion.recommendation;
    const itemsText = rec.furnitureSet.map(item => `- ${item.name} (${item.material}): ₹${item.price.toLocaleString('en-IN')}`).join('\n');
    
    const textToCopy = `=== SRI VENKATA SAI FURNITURE WORKS ===
AI Interior Mood Board Recommendation
Room Type: ${suggestion.roomType}
Colour Theme: ${suggestion.colourPreference}
Budget Limit: ₹${suggestion.budget.toLocaleString('en-IN')}

RECOMMENDED SET:
${itemsText}

COLOUR & STYLE NOTES:
${rec.colourStyleNotes}

STYLING TIPS:
${rec.stylingTips.map((tip, idx) => `${idx + 1}. ${tip}`).join('\n')}

BUDGET SUMMARY:
Total Estimated Cost: ₹${rec.budgetSummary.totalCost.toLocaleString('en-IN')}
Remaining Balance: ₹${rec.budgetSummary.remaining.toLocaleString('en-IN')}
Notes: ${rec.budgetSummary.notes}
===================================`;

    navigator.clipboard.writeText(textToCopy)
      .then(() => addToast('Copied to clipboard!', 'success'))
      .catch(() => addToast('Failed to copy text.', 'error'));
  };

  // Share to WhatsApp
  const handleWhatsAppShare = () => {
    if (!suggestion) return;
    const rec = suggestion.recommendation;
    
    const message = `*Sri Venkata Sai Furniture Works - AI Mood Board* 🛋️✨
I just designed my dream *${suggestion.roomType}*!

🎨 *Colour Theme:* ${suggestion.colourPreference}
💰 *Budget Limit:* ₹${suggestion.budget.toLocaleString('en-IN')}
💵 *Estimated Cost:* ₹${rec.budgetSummary.totalCost.toLocaleString('en-IN')}

*Recommended Furniture:*
${rec.furnitureSet.map(i => `• ${i.name} - ₹${i.price.toLocaleString('en-IN')}`).join('\n')}

_Generated via SVS AI interior consultant_`;

    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // PDF Download (triggers window print layout)
  const handleDownloadPDF = () => {
    window.print();
  };

  // Update rating score locally after child component saves it
  const handleRatingUpdate = (newRating) => {
    setSuggestion(prev => ({
      ...prev,
      rating: newRating
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Page Header */}
      <div className="text-center md:text-left space-y-2 mb-10 no-print">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-dark dark:text-brand-cream">
          AI Suggestion Tool
        </h1>
        <p className="text-sm text-brand-textMuted">
          Specify your room settings, and let our designer AI compile the perfect matching furniture collection.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: PREFERENCES FORM & PRESETS */}
        <div className="lg:col-span-4 space-y-6 no-print">
          
          {/* Preset Buttons */}
          <div className="bg-white dark:bg-brand-cardDark p-6 rounded-2xl border border-brand-dark/10 dark:border-brand-cream/10 shadow-sm space-y-4">
            <span className="block text-xs font-bold uppercase tracking-wider text-brand-textMuted">
              Template Presets
            </span>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(p)}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-brand-cream/60 dark:bg-brand-bgDark border border-brand-dark/5 dark:border-brand-cream/5 hover:border-brand-gold/40 dark:hover:border-brand-gold/40 hover:bg-brand-cream dark:hover:bg-brand-cardDark text-left transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Core Input Form */}
          <form onSubmit={handleGenerate} className="bg-white dark:bg-brand-cardDark p-6 sm:p-8 rounded-2xl border border-brand-dark/10 dark:border-brand-cream/10 shadow-sm space-y-6">
            
            {/* 1. Room Type */}
            <div className="space-y-2">
              <label htmlFor="room-type" className="block text-sm font-semibold text-brand-dark dark:text-brand-cream">
                Room Type
              </label>
              <select
                id="room-type"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full rounded-xl border border-brand-dark/20 dark:border-brand-cream/20 bg-transparent px-4 py-3 text-sm focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-all dark:bg-brand-cardDark"
              >
                <option value="Living Room">Living Room</option>
                <option value="Bedroom">Bedroom</option>
                <option value="Office">Office</option>
                <option value="Dining Room">Dining Room</option>
                <option value="Kitchen">Kitchen</option>
              </select>
              {errors.roomType && <p className="text-xs text-red-500">{errors.roomType}</p>}
            </div>

            {/* 2. Colour Preference */}
            <div className="space-y-2">
              <label htmlFor="color-preference" className="block text-sm font-semibold text-brand-dark dark:text-brand-cream">
                Colour Preference
              </label>
              <input
                id="color-preference"
                type="text"
                value={colourPreference}
                onChange={(e) => setColourPreference(e.target.value)}
                placeholder="e.g. Sage green with oak highlights"
                className="w-full rounded-xl border border-brand-dark/20 dark:border-brand-cream/20 bg-transparent px-4 py-3 text-sm focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-all dark:bg-brand-cardDark"
              />
              
              {/* Micro Suggestions tag triggers */}
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {colorSuggestions.map((color, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setColourPreference(color)}
                    className="text-[10px] font-medium text-brand-gold bg-brand-gold/10 hover:bg-brand-gold/20 px-2 py-1 rounded transition-colors"
                  >
                    +{color}
                  </button>
                ))}
              </div>
              {errors.colourPreference && <p className="text-xs text-red-500">{errors.colourPreference}</p>}
            </div>

            {/* 3. Budget Input */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="budget" className="block text-sm font-semibold text-brand-dark dark:text-brand-cream">
                  Budget (in ₹)
                </label>
                <span className="text-sm font-bold text-brand-gold bg-brand-gold/10 px-2.5 py-1 rounded-md">
                  ₹{Number(budget).toLocaleString('en-IN')}
                </span>
              </div>
              
              <input
                id="budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                min="15000"
                max="5000000"
                className="w-full rounded-xl border border-brand-dark/20 dark:border-brand-cream/20 bg-transparent px-4 py-3 text-sm focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-all dark:bg-brand-cardDark [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />

              {/* Slider Input */}
              <input
                type="range"
                min="15000"
                max="500000"
                step="5000"
                value={budget > 500000 ? 500000 : budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full"
                aria-label="Budget slider"
              />
              
              <div className="flex justify-between text-[10px] text-brand-textMuted font-semibold">
                <span>₹15,000</span>
                <span>₹5,00,000+</span>
              </div>
              {errors.budget && <p className="text-xs text-red-500">{errors.budget}</p>}
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-dark hover:bg-brand-dark/90 dark:bg-brand-gold dark:hover:bg-brand-goldLight text-brand-cream font-medium py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Generate My Room Set</span>
            </button>
            
          </form>

        </div>

        {/* RIGHT COLUMN: MOOD BOARD OUTPUT OR SKELETON */}
        <div className="lg:col-span-8">
          
          {/* LOADING STATE */}
          {loading && <LoadingSkeleton />}

          {/* EMPTY STATE */}
          {!loading && !suggestion && (
            <div className="bg-white dark:bg-brand-cardDark border border-brand-dark/10 dark:border-brand-cream/10 rounded-2xl shadow-sm p-12 text-center space-y-6 flex flex-col items-center justify-center min-h-[450px]">
              <div className="w-20 h-20 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                <Armchair className="w-10 h-10" />
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="font-serif text-xl font-bold text-brand-dark dark:text-brand-cream">
                  Your Mood Board Awaits
                </h3>
                <p className="text-sm text-brand-textMuted">
                  Submit the furniture preferences form or select a template preset to generate your AI design mood board.
                </p>
              </div>
            </div>
          )}

          {/* MOOD BOARD SUGGESTION CARD */}
          {!loading && suggestion && (
            <div className="bg-white dark:bg-brand-cardDark border border-brand-dark/10 dark:border-brand-cream/10 rounded-2xl shadow-xl overflow-hidden print-card">
              
              {/* Output Top Bar */}
              <div className="bg-brand-gold/10 p-6 flex flex-col sm:flex-row items-center justify-between border-b border-brand-dark/10 dark:border-brand-cream/10 gap-4 no-print">
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="font-serif text-lg font-bold text-brand-dark dark:text-brand-cream">
                    SVS AI Curated Mood Board
                  </h3>
                  <p className="text-xs text-brand-textMuted font-medium">
                    Generated on {new Date(suggestion.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                
                {/* Print Title Header (Only visible on physical prints / PDF export) */}
                <div className="hidden print:block text-center w-full border-b pb-4 mb-4">
                  <h1 className="font-serif text-2xl font-bold tracking-tight text-brand-dark">SRI VENKATA SAI FURNITURE WORKS</h1>
                  <p className="text-xs text-brand-gold uppercase tracking-widest font-semibold">AI Interior Design Consultant Report</p>
                </div>

                {/* Print/Download controls */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={handleCopyToClipboard}
                    className="p-2.5 rounded-lg bg-white dark:bg-brand-bgDark border border-brand-dark/10 dark:border-brand-cream/10 hover:bg-brand-cream dark:hover:bg-brand-cardDark transition-colors"
                    title="Copy recommendation text"
                  >
                    <Copy className="w-4 h-4 text-brand-gold" />
                  </button>
                  <button
                    onClick={handleWhatsAppShare}
                    className="p-2.5 rounded-lg bg-white dark:bg-brand-bgDark border border-brand-dark/10 dark:border-brand-cream/10 hover:bg-brand-cream dark:hover:bg-brand-cardDark transition-colors"
                    title="Share via WhatsApp"
                  >
                    <Send className="w-4 h-4 text-brand-gold" />
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="p-2.5 rounded-lg bg-brand-gold text-brand-cream hover:bg-brand-goldLight transition-colors flex items-center gap-2 text-xs font-semibold px-4"
                  >
                    <FileText className="w-4 h-4 shrink-0" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>

              {/* Print Header inside PDF */}
              <div className="hidden print:block border-b-2 border-brand-gold pb-6 p-8 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="font-serif text-2xl font-bold text-brand-dark">SRI VENKATA SAI FURNITURE WORKS</h1>
                    <p className="text-[10px] tracking-wider uppercase font-semibold text-brand-gold">AI Generated Interior Design Proposal</p>
                  </div>
                  <div className="text-right text-xs">
                    <p><strong>Date:</strong> {new Date(suggestion.createdAt).toLocaleDateString('en-IN')}</p>
                    <p><strong>Proposal ID:</strong> {suggestion.id.substring(0, 8).toUpperCase()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6 text-xs bg-brand-cream/30 p-4 rounded-xl border">
                  <p><strong>Room Type:</strong> {suggestion.roomType}</p>
                  <p><strong>Color Theme:</strong> {suggestion.colourPreference}</p>
                  <p><strong>Stated Budget:</strong> ₹{suggestion.budget.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Mood Board Content */}
              <div className="p-6 sm:p-8 space-y-8">
                
                {/* 1. Recommended Furniture Set */}
                <div>
                  <h4 className="font-serif text-xl font-bold text-brand-dark dark:text-brand-cream mb-4 print-text-dark">
                    Recommended Furniture Set
                  </h4>
                  
                  <div className="border border-brand-dark/10 dark:border-brand-cream/10 rounded-xl overflow-hidden shadow-sm">
                    {suggestion.recommendation.furnitureSet.map((item, index) => (
                      <div 
                        key={index}
                        className="flex flex-col sm:flex-row justify-between p-4 border-b border-brand-dark/5 dark:border-brand-cream/5 last:border-b-0 gap-2 bg-brand-cream/10 dark:bg-brand-bgDark/15 hover:bg-brand-gold/5 dark:hover:bg-brand-gold/5 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <h5 className="font-serif text-base font-bold text-brand-dark dark:text-brand-cream print-text-dark">
                            {item.name}
                          </h5>
                          <p className="text-xs text-brand-textMuted">
                            <strong>Material:</strong> {item.material}
                          </p>
                        </div>
                        <div className="text-sm font-bold text-brand-gold shrink-0 sm:self-center">
                          ₹{item.price.toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Color & Style Notes + 3. Styling Tips */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print-grid">
                  
                  {/* Style Notes */}
                  <div className="space-y-3">
                    <h4 className="font-serif text-lg font-bold text-brand-dark dark:text-brand-cream print-text-dark">
                      Colour & Style Notes
                    </h4>
                    <div className="p-5 bg-brand-cream/40 dark:bg-brand-bgDark/40 rounded-xl border border-brand-dark/5 dark:border-brand-cream/5 leading-relaxed text-sm text-brand-dark/80 dark:text-brand-cream/80">
                      {suggestion.recommendation.colourStyleNotes}
                    </div>
                  </div>

                  {/* Styling Tips */}
                  <div className="space-y-3">
                    <h4 className="font-serif text-lg font-bold text-brand-dark dark:text-brand-cream print-text-dark">
                      Styling Tips
                    </h4>
                    <ul className="space-y-3">
                      {suggestion.recommendation.stylingTips.map((tip, idx) => (
                        <li key={idx} className="flex gap-3 text-sm text-brand-dark/80 dark:text-brand-cream/80 leading-relaxed">
                          <span className="w-5 h-5 rounded-full bg-brand-gold/10 text-brand-gold font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* 4. Budget Summary */}
                <div className="p-6 bg-brand-gold/5 border border-brand-gold/15 rounded-2xl space-y-4">
                  <h4 className="font-serif text-lg font-bold text-brand-dark dark:text-brand-cream print-text-dark">
                    Budget Summary
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-semibold text-brand-textMuted tracking-wider">
                        Set Cost
                      </span>
                      <p className="text-xl font-bold text-brand-dark dark:text-brand-cream print-text-dark">
                        ₹{suggestion.recommendation.budgetSummary.totalCost.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-semibold text-brand-textMuted tracking-wider">
                        Remaining
                      </span>
                      <p className="text-xl font-bold text-brand-gold">
                        ₹{suggestion.recommendation.budgetSummary.remaining.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-semibold text-brand-textMuted tracking-wider">
                        Total Budget
                      </span>
                      <p className="text-xl font-bold text-brand-dark/60 dark:text-brand-cream/60">
                        ₹{suggestion.budget.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-xs italic text-brand-textMuted border-t border-brand-dark/10 dark:border-brand-cream/10 pt-3">
                    {suggestion.recommendation.budgetSummary.notes}
                  </p>
                </div>

                {/* Star Rating Section */}
                <StarRating 
                  suggestionId={suggestion.id} 
                  initialRating={suggestion.rating} 
                  onRate={handleRatingUpdate} 
                />

                {/* Regenerate button (no print) */}
                <div className="flex justify-end pt-4 border-t border-brand-dark/10 dark:border-brand-cream/10 no-print">
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="flex items-center gap-2 border border-brand-dark/20 hover:border-brand-dark dark:border-brand-cream/20 dark:hover:border-brand-cream hover:bg-brand-cream/30 dark:hover:bg-brand-cream/5 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all active:scale-95"
                  >
                    <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                    <span>Regenerate Board</span>
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>
      
    </div>
  );
}
