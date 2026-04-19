import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRatingSummary } from '../services/ReviewService';
import StarRating from './StarRating';
import { Star } from 'lucide-react';

interface RatingSummaryProps {
  targetType: 'course' | 'session';
  targetId: string;
}

const RatingSummary: React.FC<RatingSummaryProps> = ({ targetType, targetId }) => {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['ratingSummary', targetType, targetId],
    queryFn: () => getRatingSummary(targetType, targetId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return <div className="h-40 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl"></div>;
  }

  if (!summary || summary.count === 0) {
    return null; // Or return a "No ratings yet" state
  }

  const { average, count, distribution } = summary;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-8 items-center">
      
      {/* Big Number and Stars */}
      <div className="flex flex-col items-center justify-center flex-shrink-0">
        <span className="text-5xl font-bold text-gray-900 dark:text-white mb-2">{average.toFixed(1)}</span>
        <StarRating rating={Math.round(average)} readonly size="md" />
        <span className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
          {count} {count === 1 ? 'Rating' : 'Ratings'}
        </span>
      </div>

      {/* Distribution Bars */}
      <div className="flex-1 w-full flex flex-col-reverse gap-2">
        {[1, 2, 3, 4, 5].map((star) => {
          const starCount = distribution[star] || 0;
          const percentage = count > 0 ? (starCount / count) * 100 : 0;

          return (
            <div key={star} className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 w-8 text-gray-600 dark:text-gray-400 font-bold">
                <span>{star}</span>
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
              </div>
              
              <div className="flex-1 h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-400 rounded-full"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              
              <div className="w-8 text-right text-gray-500 dark:text-gray-400 text-xs">
                {Math.round(percentage)}%
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default RatingSummary;
