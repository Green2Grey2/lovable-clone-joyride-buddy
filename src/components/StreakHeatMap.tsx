import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, subMonths } from 'date-fns';

interface StreakHeatMapProps {
  activityData: Record<string, number>; // date string -> activity level (0-4)
  currentMonth?: Date;
}

export const StreakHeatMap: React.FC<StreakHeatMapProps> = ({ 
  activityData = {}, 
  currentMonth = new Date() 
}) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get previous month days to fill the grid
  const firstDayOfWeek = monthStart.getDay();
  const prevMonthEnd = endOfMonth(subMonths(currentMonth, 1));
  const prevMonthDays = Array.from({ length: firstDayOfWeek }, (_, i) => 
    new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), prevMonthEnd.getDate() - firstDayOfWeek + i + 1)
  );
  
  const allDays = [...prevMonthDays, ...days];
  const weeks = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  const getActivityLevel = (date: Date): number => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return activityData[dateStr] || 0;
  };

  const getActivityColor = (level: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return 'bg-muted/30';
    
    const colors = [
      'bg-muted/50 dark:bg-muted/20',        // 0 - No activity
      'bg-primary/20 dark:bg-primary/30',    // 1 - Light activity
      'bg-primary/40 dark:bg-primary/50',    // 2 - Moderate activity
      'bg-primary/60 dark:bg-primary/70',    // 3 - Good activity
      'bg-primary dark:bg-primary',          // 4 - Excellent activity
    ];
    
    return colors[Math.min(level, 4)];
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthName = format(currentMonth, 'MMMM yyyy');

  return (
    <Card className="card-modern glass dark:glass-dark">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Activity Heat Map</CardTitle>
        <p className="text-sm text-muted-foreground">{monthName}</p>
      </CardHeader>
      <CardContent>
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-xs text-muted-foreground text-center">
              {day[0]}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((day, dayIndex) => {
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const activityLevel = getActivityLevel(day);
                const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                
                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={cn(
                      "aspect-square rounded-md transition-all duration-200 hover:scale-110 cursor-pointer relative",
                      getActivityColor(activityLevel, isCurrentMonth),
                      isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    )}
                    title={`${format(day, 'MMM d')}: ${activityLevel > 0 ? `Level ${activityLevel} activity` : 'No activity'}`}
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                      {isCurrentMonth && format(day, 'd')}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-between mt-6 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className={cn(
                  "w-3 h-3 rounded-sm",
                  getActivityColor(level, true)
                )}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
};