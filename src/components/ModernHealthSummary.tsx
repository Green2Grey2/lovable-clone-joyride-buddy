
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Droplets, Heart, Flame, ChevronRight, Trophy, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { activityTrackingService } from '@/utils/activityTrackingService';
import { useHealthSync } from '@/hooks/useHealthSync';

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
  points: number;
  earned_at: string;
}

interface PersonalRecord {
  type: 'daily_steps' | 'weekly_steps' | 'monthly_steps' | 'streak';
  current: number;
  best: number;
  progress: number;
}

interface WeeklySummary {
  totalSteps: number;
  totalCalories: number;
  totalDuration: number;
  activeDays: number;
  averageSteps: number;
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
  const { healthStats, hasHealthData, showHealthStats } = useHealthSync();
  const [recentAchievements, setRecentAchievements] = useState<RecentAchievement[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  
  // Use health sync data if available, otherwise use props
  const currentStats = showHealthStats && healthStats ? {
    steps: healthStats.steps,
    calories: healthStats.calories,
    heartRate: healthStats.heartRate,
    water: healthStats.water
  } : {
    steps,
    calories,
    heartRate,
    water
  };

  const stepProgress = Math.min((currentStats.steps / stepGoal) * 100, 100);
  const remainingSteps = Math.max(0, stepGoal - currentStats.steps);
  
  // Convert to US metrics (miles)
  const todayMiles = (currentStats.steps / 2000).toFixed(1); // 2000 steps ≈ 1 mile
  const goalMiles = (stepGoal / 2000).toFixed(1);
  const remainingMiles = (remainingSteps / 2000).toFixed(1);

  useEffect(() => {
    if (user) {
      fetchComprehensiveData();
    }
  }, [user, currentStats.steps]);

  const fetchComprehensiveData = async () => {
    if (!user) return;
    
    try {
      // Fetch all data in parallel for efficiency
      const [achievements, records, weekly] = await Promise.all([
        activityTrackingService.getRecentAchievements(user.id, 7),
        activityTrackingService.getPersonalRecords(user.id),
        activityTrackingService.getWeeklySummary(user.id)
      ]);

      setRecentAchievements(achievements);
      setWeeklySummary(weekly);

      // Build personal records from comprehensive data
      const personalRecordsList: PersonalRecord[] = [];
      
      if (records && typeof records === 'object' && 'maxDailySteps' in records) {
        const maxSteps = records.maxDailySteps as number;
        if (maxSteps > 0 && currentStats.steps > 0) {
          const progress = Math.min((currentStats.steps / maxSteps) * 100, 100);
          personalRecordsList.push({
            type: 'daily_steps',
            current: currentStats.steps,
            best: maxSteps,
            progress
          });
        }

        if (weekly && weekly.totalSteps > 0) {
          // Weekly record (compare to best week)
          const bestWeeklySteps = maxSteps * 7; // Estimate
          const progress = Math.min((weekly.totalSteps / bestWeeklySteps) * 100, 100);
          personalRecordsList.push({
            type: 'weekly_steps',
            current: weekly.totalSteps,
            best: bestWeeklySteps,
            progress
          });
        }
      }

      setPersonalRecords(personalRecordsList);
    } catch (error) {
      console.error('Error fetching comprehensive data:', error);
    }
  };

  return (
    <Card className="card-modern glass dark:glass-dark rounded-2xl shadow-soft hover:shadow-medium transition-smooth">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground text-xl font-semibold">Today's Summary</CardTitle>
            {showHealthStats && healthStats?.lastSync && (
              <p className="text-xs text-muted-foreground mt-1">
                Last synced: {new Date(healthStats.lastSync).toLocaleDateString()}
              </p>
            )}
          </div>
          {onViewMore && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewMore}
              className="text-primary hover:bg-primary/10 p-2 h-auto transition-smooth"
            >
              <span className="text-sm font-medium mr-1">Analytics</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Steps Progress with comprehensive tracking */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Steps ({todayMiles} mi)</span>
            <span className="text-2xl font-bold text-foreground">{currentStats.steps.toLocaleString()}</span>
          </div>
          <Progress value={stepProgress} className="h-3 bg-muted" />
          <div className="flex justify-between text-sm">
            <p className="text-muted-foreground">
              {remainingSteps > 0 
                ? `${remainingMiles} miles to goal`
                : 'Goal achieved! 🎉'
              }
            </p>
            {weeklySummary && (
              <p className="text-muted-foreground">
                Week: {weeklySummary.totalSteps.toLocaleString()} steps
              </p>
            )}
          </div>
        </div>

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              Recent Achievements
            </h4>
            <div className="flex gap-2 flex-wrap">
              {recentAchievements.slice(0, 3).map((achievement) => (
                <Badge 
                  key={achievement.id} 
                  variant="secondary" 
                  className="text-xs bg-primary/10 text-primary border-primary/20"
                >
                  {achievement.icon} {achievement.name} (+{achievement.points}pts)
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
              Personal Best Progress
            </h4>
            {personalRecords.map((record, index) => (
              <div key={index} className="bg-muted/50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">
                    {record.type === 'daily_steps' ? 'Daily Steps Record' : 
                     record.type === 'weekly_steps' ? 'Weekly Steps Record' :
                     record.type === 'streak' ? 'Activity Streak' : 'Progress'}
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {record.current.toLocaleString()} / {record.best.toLocaleString()}
                  </span>
                </div>
                <Progress value={record.progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {record.progress >= 90 ? '🔥 Almost there!' : 
                   record.progress >= 100 ? '🏆 New record!' :
                   `${Math.round(record.progress)}% to personal best`}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Health Metrics Grid with comprehensive data */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 gradient-health rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-primary">
              <Droplets className="h-6 w-6 text-primary-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{currentStats.water}</p>
            <p className="text-xs text-muted-foreground">glasses water</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-foreground">{currentStats.heartRate}</p>
            <p className="text-xs text-muted-foreground">avg BPM</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-foreground">{currentStats.calories}</p>
            <p className="text-xs text-muted-foreground">calories burned</p>
          </div>
        </div>

        {/* Weekly Summary Card */}
        {weeklySummary && weeklySummary.activeDays > 0 && (
          <div className="bg-muted/30 rounded-xl p-4 border border-dashed border-muted-foreground/30">
            <h4 className="text-sm font-semibold text-foreground mb-2">This Week</h4>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-foreground">{weeklySummary.activeDays}</p>
                <p className="text-xs text-muted-foreground">active days</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{weeklySummary.averageSteps.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">avg steps/day</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
