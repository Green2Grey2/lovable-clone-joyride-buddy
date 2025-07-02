
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Calendar, Trophy } from 'lucide-react';

interface StreakVisualizationProps {
  currentStreak: number;
  longestStreak: number;
  weeklyProgress: number[];
}

export const StreakVisualization = React.memo(({ 
  currentStreak, 
  longestStreak, 
  weeklyProgress 
}: StreakVisualizationProps) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date().getDay() - 1; // Adjust for Monday start
  
  return (
    <Card className="bg-card border-0 rounded-3xl shadow-lg dark:shadow-primary/10 hover:shadow-xl dark:hover:shadow-primary/20 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-foreground text-xl font-semibold">Weekly Streak</h3>
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="text-orange-600 font-bold">{currentStreak} days</span>
          </div>
        </div>
        
        {/* Weekly Progress Circles */}
        <div className="flex justify-between items-center mb-6">
          {days.map((day, index) => {
            const isToday = index === today;
            const isCompleted = weeklyProgress[index] >= 100;
            const isPartial = weeklyProgress[index] > 0 && weeklyProgress[index] < 100;
            
            return (
              <div key={day} className="flex flex-col items-center">
                <div className={`relative w-12 h-12 rounded-full border-4 transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-300 shadow-lg' 
                    : isPartial
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-300'
                      : isToday
                        ? 'bg-gradient-to-br from-blue-400 to-purple-500 border-blue-300 animate-pulse-subtle'
                        : 'bg-muted border-border'
                }`}>
                  {isCompleted && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-primary-foreground" />
                    </div>
                  )}
                  {isToday && !isCompleted && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <span className={`text-xs mt-2 font-medium ${
                  isToday ? 'text-blue-600' : 'text-muted-foreground'
                }`}>
                  {day}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Streak Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-orange-600 font-bold text-lg">{currentStreak}</span>
            </div>
            <p className="text-muted-foreground text-sm">Current Streak</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <span className="text-yellow-600 font-bold text-lg">{longestStreak}</span>
            </div>
            <p className="text-muted-foreground text-sm">Best Streak</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

StreakVisualization.displayName = 'StreakVisualization';
