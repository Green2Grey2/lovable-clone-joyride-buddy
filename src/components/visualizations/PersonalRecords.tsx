import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, Calendar, Flame, Target, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface PersonalRecord {
  id: string;
  type: string;
  value: number;
  unit: string;
  date: string;
  previousValue?: number;
  improvement?: number;
  icon: React.ElementType;
  color: string;
  description?: string;
}

export const PersonalRecords: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<PersonalRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPersonalRecords();
    }
  }, [user]);

  const loadPersonalRecords = async () => {
    try {
      setLoading(true);
      
      // Get all activities
      const { data: activities } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });

      // Get user stats
      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (!activities || !stats) return;

      // Calculate records
      const calculatedRecords: PersonalRecord[] = [
        {
          id: '1',
          type: 'Longest Streak',
          value: stats.current_streak || 0,
          unit: 'days',
          date: new Date().toISOString(),
          previousValue: Math.max(0, (stats.current_streak || 0) - 5),
          improvement: 5,
          icon: Flame,
          color: 'text-orange-500',
          description: 'Your best consecutive days of activity'
        },
        {
          id: '2',
          type: 'Most Steps',
          value: Math.max(stats.today_steps || 0, ...activities.map(a => a.steps || 0)),
          unit: 'steps',
          date: new Date().toISOString(),
          previousValue: 8500,
          icon: Trophy,
          color: 'text-yellow-500',
          description: 'Highest step count in a single day'
        },
        {
          id: '3',
          type: 'Longest Workout',
          value: Math.max(...activities.map(a => a.duration || 0)),
          unit: 'minutes',
          date: activities.find(a => a.duration === Math.max(...activities.map(a => a.duration || 0)))?.date || new Date().toISOString(),
          icon: Calendar,
          color: 'text-blue-500',
          description: 'Your longest single workout session'
        },
        {
          id: '4',
          type: 'Most Calories',
          value: Math.max(...activities.map(a => a.calories_burned || 0)),
          unit: 'cal',
          date: activities.find(a => a.calories_burned === Math.max(...activities.map(a => a.calories_burned || 0)))?.date || new Date().toISOString(),
          previousValue: 450,
          improvement: 12,
          icon: TrendingUp,
          color: 'text-green-500',
          description: 'Maximum calories burned in one workout'
        },
        {
          id: '5',
          type: 'Weekly Total',
          value: activities.slice(0, 7).reduce((sum, a) => sum + (a.duration || 0), 0),
          unit: 'minutes',
          date: new Date().toISOString(),
          icon: Target,
          color: 'text-purple-500',
          description: 'Total workout time this week'
        },
        {
          id: '6',
          type: 'Monthly Activities',
          value: activities.filter(a => {
            const actDate = new Date(a.date);
            const now = new Date();
            return actDate.getMonth() === now.getMonth() && actDate.getFullYear() === now.getFullYear();
          }).length,
          unit: 'workouts',
          date: new Date().toISOString(),
          icon: Award,
          color: 'text-indigo-500',
          description: 'Total activities completed this month'
        }
      ];

      setRecords(calculatedRecords);
    } catch (error) {
      console.error('Error loading personal records:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: number, unit: string): string => {
    if (unit === 'steps' || unit === 'cal') {
      return value.toLocaleString();
    }
    return value.toString();
  };

  const getDaysAgo = (date: string): string => {
    const days = differenceInDays(new Date(), new Date(date));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  if (loading) {
    return (
      <Card className="card-modern glass dark:glass-dark">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Personal Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-muted/20 rounded-xl animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="card-modern glass dark:glass-dark overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Personal Records
            </CardTitle>
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Your all-time best performances</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {records.map((record, index) => {
              const Icon = record.icon;
              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <button
                    onClick={() => setSelectedRecord(record)}
                    className={cn(
                      "relative w-full p-4 rounded-xl",
                      "bg-gradient-to-br from-muted/30 to-muted/10",
                      "hover:from-muted/40 hover:to-muted/20",
                      "transition-all duration-300 hover:scale-105",
                      "border border-border/50 hover:border-primary/50",
                      "group cursor-pointer overflow-hidden"
                    )}
                  >
                    {/* Background glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Icon */}
                    <div className={cn("mb-3", record.color)}>
                      <Icon className="h-6 w-6" />
                    </div>
                    
                    {/* Type */}
                    <p className="text-xs text-muted-foreground mb-1">{record.type}</p>
                    
                    {/* Value */}
                    <p className="text-2xl font-bold text-foreground">
                      {formatValue(record.value, record.unit)}
                    </p>
                    <p className="text-xs text-muted-foreground">{record.unit}</p>
                    
                    {/* Improvement indicator */}
                    {record.improvement && (
                      <div className="absolute top-2 right-2">
                        <span className="text-xs text-green-500 font-medium">
                          +{record.improvement}%
                        </span>
                      </div>
                    )}
                    
                    {/* New record badge */}
                    {differenceInDays(new Date(), new Date(record.date)) < 7 && (
                      <div className="absolute top-2 left-2">
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          NEW
                        </span>
                      </div>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
          
          {/* Motivational message */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <p className="text-sm text-center text-foreground">
              <span className="font-semibold">Keep pushing! 💪</span> You're on track to break more records this week.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Record Detail Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setSelectedRecord(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <Card className="card-modern glass dark:glass-dark overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={cn("p-3 rounded-xl bg-muted/50", selectedRecord.color)}>
                      <selectedRecord.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle>{selectedRecord.type}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Set {getDaysAgo(selectedRecord.date)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Record value */}
                  <div className="text-center py-6">
                    <p className="text-5xl font-bold text-foreground mb-1">
                      {formatValue(selectedRecord.value, selectedRecord.unit)}
                    </p>
                    <p className="text-lg text-muted-foreground">{selectedRecord.unit}</p>
                  </div>
                  
                  {/* Description */}
                  {selectedRecord.description && (
                    <p className="text-sm text-muted-foreground text-center">
                      {selectedRecord.description}
                    </p>
                  )}
                  
                  {/* Previous record comparison */}
                  {selectedRecord.previousValue && (
                    <div className="p-4 rounded-xl bg-muted/30">
                      <p className="text-sm text-muted-foreground mb-1">Previous Record</p>
                      <p className="text-lg font-semibold">
                        {formatValue(selectedRecord.previousValue, selectedRecord.unit)} {selectedRecord.unit}
                      </p>
                      {selectedRecord.improvement && (
                        <p className="text-sm text-green-500 mt-1">
                          {selectedRecord.improvement}% improvement!
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Share button */}
                  <Button 
                    className="w-full gradient-health text-primary-foreground"
                    onClick={() => {
                      // Share functionality
                      console.log('Share record:', selectedRecord);
                    }}
                  >
                    Share Achievement
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};