import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, subMonths, startOfYear, eachMonthOfInterval, isSameDay } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityData {
  date: string;
  intensity: number; // 0-4 scale
  steps?: number;
  calories?: number;
  minutes?: number;
}

export const ActivityHeatMap: React.FC = () => {
  const { user } = useAuth();
  const [activityData, setActivityData] = useState<Record<string, ActivityData>>({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (user) {
      loadActivityData();
    }
  }, [user, currentDate, viewMode]);

  const loadActivityData = async () => {
    try {
      setLoading(true);
      const startDate = viewMode === 'month' 
        ? startOfMonth(currentDate)
        : startOfYear(currentDate);
      
      const endDate = viewMode === 'month'
        ? endOfMonth(currentDate)
        : new Date();

      const { data, error } = await supabase
        .from('activities')
        .select('date, duration, calories_burned')
        .eq('user_id', user?.id)
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'));

      if (error) throw error;

      const processed: Record<string, ActivityData> = {};
      data?.forEach(activity => {
        const intensity = calculateIntensity(activity.duration, activity.calories_burned);
        processed[activity.date] = {
          date: activity.date,
          intensity,
          minutes: activity.duration,
          calories: activity.calories_burned
        };
      });

      setActivityData(processed);
    } catch (error) {
      console.error('Error loading activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateIntensity = (duration: number, calories: number): number => {
    const score = (duration / 30) + (calories / 300);
    if (score >= 2) return 4;
    if (score >= 1.5) return 3;
    if (score >= 1) return 2;
    if (score > 0) return 1;
    return 0;
  };

  const getActivityColor = (intensity: number) => {
    const colors = [
      'bg-muted/20 dark:bg-muted/10',                    // 0 - No activity
      'bg-primary/20 dark:bg-primary/25 shadow-sm',     // 1 - Light
      'bg-primary/40 dark:bg-primary/45 shadow-sm',     // 2 - Moderate
      'bg-primary/60 dark:bg-primary/65 shadow-md',     // 3 - Good
      'bg-primary dark:bg-primary shadow-lg shadow-primary/30', // 4 - Excellent
    ];
    return colors[Math.min(intensity, 4)];
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const firstDayOfWeek = monthStart.getDay();
    const prevMonthEnd = endOfMonth(subMonths(currentDate, 1));
    const prevMonthDays = Array.from({ length: firstDayOfWeek }, (_, i) => 
      new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), prevMonthEnd.getDate() - firstDayOfWeek + i + 1)
    );
    
    const allDays = [...prevMonthDays, ...days];
    const weeks = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }

    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
      <>
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day, i) => (
            <div key={i} className="text-xs text-muted-foreground text-center font-medium">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((day, dayIndex) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const activity = activityData[dateStr];
                const intensity = activity?.intensity || 0;
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={cn(
                      "aspect-square rounded-lg transition-all duration-300 hover:scale-110 cursor-pointer relative group",
                      isCurrentMonth ? getActivityColor(intensity) : 'bg-muted/10',
                      isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    )}
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-foreground/70">
                      {isCurrentMonth && format(day, 'd')}
                    </span>
                    
                    {/* Tooltip */}
                    {activity && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
                        <div className="glass dark:glass-dark p-2 rounded-lg shadow-xl text-xs whitespace-nowrap">
                          <div className="font-semibold">{format(day, 'MMM d')}</div>
                          <div className="text-muted-foreground">{activity.minutes} min</div>
                          <div className="text-primary">{activity.calories} cal</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderYearView = () => {
    const yearStart = startOfYear(currentDate);
    const months = eachMonthOfInterval({ start: yearStart, end: new Date() });
    
    return (
      <div className="grid grid-cols-4 gap-4">
        {months.map(month => {
          const monthDays = eachDayOfInterval({
            start: startOfMonth(month),
            end: endOfMonth(month)
          });
          
          const monthActivity = monthDays.reduce((acc, day) => {
            const activity = activityData[format(day, 'yyyy-MM-dd')];
            return acc + (activity?.intensity || 0);
          }, 0);
          
          const avgIntensity = Math.round(monthActivity / monthDays.length);
          
          return (
            <div
              key={month.toISOString()}
              className={cn(
                "p-4 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer",
                getActivityColor(avgIntensity)
              )}
              onClick={() => {
                setCurrentDate(month);
                setViewMode('month');
              }}
            >
              <div className="text-sm font-semibold">{format(month, 'MMM')}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {monthActivity > 0 ? `${Math.round((monthActivity / (monthDays.length * 4)) * 100)}%` : '0%'}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="card-modern glass dark:glass-dark">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="grid grid-cols-7 gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map(j => (
                  <Skeleton key={j} className="aspect-square rounded-lg" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-modern glass dark:glass-dark overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Activity Heat Map
          </CardTitle>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'month' ? 'year' : 'month')}
              className="text-xs px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              {viewMode === 'month' ? 'Year View' : 'Month View'}
            </button>
            {viewMode === 'month' && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  className="p-1 hover:bg-accent/10 rounded transition-colors"
                >
                  ←
                </button>
                <span className="text-sm font-medium px-2">
                  {format(currentDate, 'MMM yyyy')}
                </span>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="p-1 hover:bg-accent/10 rounded transition-colors"
                  disabled={isSameMonth(currentDate, new Date())}
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'month' ? renderMonthView() : renderYearView()}
        
        {/* Legend */}
        <div className="flex items-center justify-between mt-6 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className={cn(
                  "w-4 h-4 rounded transition-all duration-300 hover:scale-110",
                  getActivityColor(level)
                )}
              />
            ))}
          </div>
          <span>More</span>
        </div>
        
        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {Object.values(activityData).filter(a => a.intensity > 0).length}
            </div>
            <div className="text-xs text-muted-foreground">Active Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {Math.round(Object.values(activityData).reduce((sum, a) => sum + a.intensity, 0) / Object.values(activityData).length) || 0}
            </div>
            <div className="text-xs text-muted-foreground">Avg Intensity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {Math.max(...Object.values(activityData).map(a => a.intensity), 0)}
            </div>
            <div className="text-xs text-muted-foreground">Best Day</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};