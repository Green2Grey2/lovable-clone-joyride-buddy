import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Target, Flame, MapPin, Zap, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { activityTrackingService } from '@/utils/activityTrackingService';
import { format, subDays } from 'date-fns';

interface ComprehensiveActivityViewProps {
  userStats: any;
}

export const ComprehensiveActivityView = ({ userStats }: ComprehensiveActivityViewProps) => {
  const { user } = useAuth();
  const [selectedView, setSelectedView] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedMetric, setSelectedMetric] = useState('steps');
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  
  const stepGoal = 10000;
  const stepProgress = (userStats.today_steps / stepGoal) * 100;
  const todayMiles = (userStats.today_steps / 2000).toFixed(1);

  useEffect(() => {
    if (user) {
      loadActivityData();
    }
  }, [user]);

  const loadActivityData = async () => {
    try {
      // Get weekly activity history
      const weeklyActivities = await activityTrackingService.getActivityHistory(user?.id!, 7);
      const weeklyStats = await activityTrackingService.getWeeklySummary(user?.id!);
      
      // Process weekly data from real activities
      const processedWeeklyData = weeklyActivities.map((activity, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        return {
          day: format(date, 'EEE'),
          steps: activity.steps || 0,
          calories: activity.calories_burned || 0,
          distance: parseFloat(((activity.steps || 0) / 2000).toFixed(1)),
          date: format(date, 'yyyy-MM-dd')
        };
      });

      // Get monthly data (simplified - using weekly averages)
      const monthlyStats = [
        { week: 'W1', steps: Math.floor((weeklyStats?.totalSteps || 0) * 0.28), calories: Math.floor((weeklyStats?.totalCalories || 0) * 0.28), workouts: Math.floor((weeklyStats?.activeDays || 0) * 0.28), distance: parseFloat(((weeklyStats?.totalSteps || 0) * 0.28 / 2000).toFixed(1)), activeMinutes: Math.floor((weeklyStats?.totalDuration || 0) * 0.28) },
        { week: 'W2', steps: Math.floor((weeklyStats?.totalSteps || 0) * 0.32), calories: Math.floor((weeklyStats?.totalCalories || 0) * 0.32), workouts: Math.floor((weeklyStats?.activeDays || 0) * 0.32), distance: parseFloat(((weeklyStats?.totalSteps || 0) * 0.32 / 2000).toFixed(1)), activeMinutes: Math.floor((weeklyStats?.totalDuration || 0) * 0.32) },
        { week: 'W3', steps: Math.floor((weeklyStats?.totalSteps || 0) * 0.25), calories: Math.floor((weeklyStats?.totalCalories || 0) * 0.25), workouts: Math.floor((weeklyStats?.activeDays || 0) * 0.25), distance: parseFloat(((weeklyStats?.totalSteps || 0) * 0.25 / 2000).toFixed(1)), activeMinutes: Math.floor((weeklyStats?.totalDuration || 0) * 0.25) },
        { week: 'W4', steps: Math.floor((weeklyStats?.totalSteps || 0) * 0.15), calories: Math.floor((weeklyStats?.totalCalories || 0) * 0.15), workouts: Math.floor((weeklyStats?.activeDays || 0) * 0.15), distance: parseFloat(((weeklyStats?.totalSteps || 0) * 0.15 / 2000).toFixed(1)), activeMinutes: Math.floor((weeklyStats?.totalDuration || 0) * 0.15) },
      ];

      setWeeklyData(processedWeeklyData);
      setMonthlyData(monthlyStats);
      setRecentActivities(weeklyActivities.slice(0, 3));
    } catch (error) {
      console.error('Error loading activity data:', error);
    }
  };

  const metricOptions = [
    { key: 'steps', label: 'Steps', icon: Target, color: 'hsl(var(--primary))' },
    { key: 'calories', label: 'Calories', icon: Flame, color: 'hsl(var(--orange-500))' },
    { key: 'distance', label: 'Distance (mi)', icon: MapPin, color: 'hsl(var(--blue-500))' },
    { key: 'workouts', label: 'Workouts', icon: Zap, color: 'hsl(var(--green-500))' },
  ];

  const currentData = selectedView === 'weekly' ? weeklyData : monthlyData;
  const dataKey = selectedView === 'weekly' ? 'day' : 'week';

  const pieData = [
    { name: 'Completed', value: stepProgress },
    { name: 'Remaining', value: 100 - stepProgress }
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted))'];

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center text-primary-foreground">
            <CalendarDays className="h-5 w-5" />
          </div>
          Comprehensive Activity View
        </h2>
        <div className="flex gap-2">
          <Button
            variant={selectedView === 'weekly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('weekly')}
            className="transition-all"
          >
            Weekly
          </Button>
          <Button
            variant={selectedView === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('monthly')}
            className="transition-all"
          >
            Monthly
          </Button>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="flex flex-wrap gap-2">
        {metricOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Button
              key={option.key}
              variant={selectedMetric === option.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMetric(option.key)}
              className="flex items-center gap-2 transition-all"
            >
              <Icon className="h-4 w-4" />
              {option.label}
            </Button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <Card className="card-modern glass dark:glass-dark">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {selectedView === 'weekly' ? 'Weekly' : 'Monthly'} {metricOptions.find(m => m.key === selectedMetric)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={currentData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                    <XAxis 
                      dataKey={dataKey} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey={selectedMetric} 
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Today's Progress */}
          <Card className="card-modern glass dark:glass-dark">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Today's Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">{userStats.today_steps?.toLocaleString() || 0}</p>
                  <p className="text-sm text-muted-foreground">steps today</p>
                  <p className="text-xs text-muted-foreground">{todayMiles} miles</p>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {stepProgress.toFixed(1)}% of daily goal
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="card-modern glass dark:glass-dark">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.length > 0 ? recentActivities.map((activity, index) => (
                  <div key={activity.id || index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground text-sm">{activity.type || 'Activity'}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.duration ? `${activity.duration} min` : ''} • {activity.date || 'Recent'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground text-sm">{activity.calories_burned || 0} cal</p>
                      <p className="text-xs text-muted-foreground">{activity.steps || 0} steps</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent activities
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};