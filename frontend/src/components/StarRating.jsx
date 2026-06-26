import React, { useState } from 'react';
import { Star } from 'lucide-react';
import api from '../utils/api';
import useToast from '../hooks/useToast';

export default function StarRating({ suggestionId, initialRating, onRate }) {
  const [rating, setRating] = useState(initialRating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleRatingSubmit = async (value) => {
    if (rating > 0) return; // Prevent double rating submissions

    setLoading(true);
    try {
      const response = await api.post(`/suggestions/${suggestionId}/rate`, { rating: value });
      if (response.success) {
        setRating(value);
        if (onRate) onRate(value);
        addToast('Thank you for rating this design suggestion!', 'success');
      }
    } catch (error) {
      console.error('Failed to submit rating:', error);
      addToast(error.message || 'Failed to submit rating. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center sm:items-start gap-2 py-4 border-t border-brand-dark/10 dark:border-brand-cream/10 no-print star-rating-form">
      <span className="text-xs font-semibold uppercase tracking-wider text-brand-dark/60 dark:text-brand-cream/60">
        {rating > 0 ? 'Your Quality Rating' : 'Rate this design suggestion'}
      </span>
      
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = rating > 0 ? starIndex <= rating : starIndex <= (hoverRating || rating);
          return (
            <button
              key={starIndex}
              type="button"
              disabled={rating > 0 || loading}
              onClick={() => handleRatingSubmit(starIndex)}
              onMouseEnter={() => rating === 0 && setHoverRating(starIndex)}
              onMouseLeave={() => rating === 0 && setHoverRating(0)}
              className={`p-1 rounded-md transition-all ${
                rating === 0 ? 'hover:scale-110 active:scale-95 cursor-pointer' : 'cursor-default'
              }`}
              aria-label={`Rate ${starIndex} out of 5 stars`}
            >
              <Star
                className={`w-6 h-6 transition-colors duration-150 ${
                  isFilled 
                    ? 'fill-brand-gold text-brand-gold' 
                    : 'text-brand-dark/25 dark:text-brand-cream/25 hover:text-brand-gold'
                }`}
              />
            </button>
          );
        })}
        
        {rating > 0 && (
          <span className="text-sm font-semibold text-brand-gold ml-2 animate-fade-in">
            ({rating}/5 Rated)
          </span>
        )}
      </div>
    </div>
  );
}
