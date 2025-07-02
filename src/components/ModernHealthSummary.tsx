
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Droplets, Heart, Flame, ChevronRight, Trophy, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ModernHealthSummaryProps {
  steps: number;
  stepGoal: number;
  water: number;
  heartRate: number;
  calories: number;
  onViewMore?: () => void;
}

interface RecentAchievement {
  id: string;
  name: string;
  icon: string;
  earned_at: string;
}

interface PersonalRecord {
  type: 'daily_steps' | 'weekly_steps' | 'monthly_steps' | 'streak';
  current: number;
  best: number;
  progress: number;
}

export const ModernHealthSummary = ({ 
  steps, 
  stepGoal, 
  water, 
  heartRate, 
  calories,
  onViewMore 
}: ModernHealthSummaryProps) => {
  const { user } = useAuth();
  const [recentAchievements, setRecentAchievements] = useState<RecentAchievement[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  
  const stepProgress = Math.min((steps / stepGoal) * 100, 100);
  const remainingSteps = Math.max(0, stepGoal - steps);
  
  // Convert to US metrics (miles)
  const todayMiles = (steps / 2000).toFixed(1); // 2000 steps ≈ 1 mile
  const goalMiles = (stepGoal / 2000).toFixed(1);
  const remainingMiles = (remainingSteps / 2000).toFixed(1);

  useEffect(() => {
    if (user) {
      fetchRecentAchievements();
      fetchPersonalRecords();
    }
  }, [user, steps]);

  const fetchRecentAchievements = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          id,
          earned_at,
          achievements!inner(name, icon)
        `)
        .eq('user_id', user.id)
        .gte('earned_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
        .order('earned_at', { ascending: false })
        .limit(2);

      if (error) throw error;

      const achievements = data?.map(item => ({
        id: item.id,
        name: item.achievements.name,
        icon: item.achievements.icon,
        earned_at: item.earned_at
      })) || [];

      setRecentAchievements(achievements);
    } catch (error) {
      console.error('Error fetching recent achievements:', error);
    }
  };

  const fetchPersonalRecords = async () => {
    if (!user) return;
    
    try {
      const { data: userStats, error } = await supabase
        .from('user_stats')
        .select('current_streak, longest_streak, today_steps, weekly_steps, monthly_steps')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      const records: PersonalRecord[] = [];
      
      // Daily steps record
      if (userStats.today_steps > 0) {
        const progress = Math.min((userStats.today_steps / (userStats.today_steps * 1.1)) * 100, 95);
        records.push({
          type: 'daily_steps',
          current: userStats.today_steps,
          best: userStats.today_steps * 1.1, // Assume best is 10% higher for demo
          progress
        });
      }

      // Streak record
      if (userStats.current_streak > 0 && userStats.longest_streak > userStats.current_streak) {
        const progress = (userStats.current_streak / userStats.longest_streak) * 100;
        records.push({
          type: 'streak',
          current: userStats.current_streak,
          best: userStats.longest_streak,
          progress
        });
      }

      setPersonalRecords(records);
    } catch (error) {
      console.error('Error fetching personal records:', error);
    }
  };

  return (
    <Card className="card-modern glass dark:glass-dark rounded-2xl shadow-soft hover:shadow-medium transition-smooth">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground text-xl font-semibold">Today's Summary</CardTitle>
          {onViewMore && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewMore}
              className="text-primary hover:bg-primary/10 p-2 h-auto transition-smooth"
            >
              <span className="text-sm font-medium mr-1">More info</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Steps Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Steps ({todayMiles} mi)</span>
            <span className="text-2xl font-bold text-foreground">{steps.toLocaleString()}</span>
          </div>
          <Progress value={stepProgress} className="h-3 bg-muted" />
          <p className="text-sm text-muted-foreground">
            {remainingSteps > 0 
              ? `${remainingMiles} miles to reach your goal`
              : 'Goal achieved! 🎉'
            }
          </p>
        </div>

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              Recent Achievements
            </h4>
            <div className="flex gap-2">
              {recentAchievements.map((achievement) => (
                <Badge key={achievement.id} variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                  {achievement.icon} {achievement.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Personal Records Progress */}
        {personalRecords.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Close to Personal Best
            </h4>
            {personalRecords.map((record, index) => (
              <div key={index} className="bg-muted/50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">
                    {record.type === 'daily_steps' ? 'Daily Steps' : 
                     record.type === 'streak' ? 'Activity Streak' : 'Progress'}
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {record.current} / {record.best}
                  </span>
                </div>
                <Progress value={record.progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {record.progress >= 90 ? '🔥 Almost there!' : `${Math.round(record.progress)}% to personal best`}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Health Metrics Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 gradient-health rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-primary">
              <Droplets className="h-6 w-6 text-primary-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{water}</p>
            <p className="text-xs text-muted-foreground">glasses water</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-foreground">{heartRate}</p>
            <p className="text-xs text-muted-foreground">avg BPM</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-foreground">{calories}</p>
            <p className="text-xs text-muted-foreground">calories burned</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
