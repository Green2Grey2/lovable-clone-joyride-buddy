
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface MotivationalBannerProps {
  motivationalMessage: {
    type: string;
    emoji: string;
    message: string;
    color: string;
  };
  userStats: {
    currentStreak: number;
    longestStreak: number;
  };
}

export const MotivationalBanner = React.memo(({ 
  motivationalMessage, 
  userStats 
}: MotivationalBannerProps) => {
  return (
    <Card className={`border-0 rounded-3xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl ${
      motivationalMessage.type === 'celebration' ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' :
      motivationalMessage.type === 'streak' ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200' :
      motivationalMessage.type === 'goal' ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200' :
      'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
    }`}>
      <CardContent className="p-6 text-center">
        <div className="text-4xl mb-3">{motivationalMessage.emoji}</div>
        <p className={`text-lg font-semibold ${motivationalMessage.color} mb-2`}>
          {motivationalMessage.message}
        </p>
        {userStats.currentStreak > 0 && (
          <p className="text-sm text-gray-600">
            Current streak: {userStats.currentStreak} days | Best: {userStats.longestStreak} days
          </p>
        )}
      </CardContent>
    </Card>
  );
});

MotivationalBanner.displayName = 'MotivationalBanner';
