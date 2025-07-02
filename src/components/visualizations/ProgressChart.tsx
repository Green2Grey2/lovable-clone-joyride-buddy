import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { activityTrackingService } from '@/utils/activityTrackingService';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface ChartData {
  date: string;
  value: number;
  goal?: number;
  previousValue?: number;
}

interface ProgressChartProps {
  type?: 'line' | 'area' | 'bar' | 'radar';
  metric: 'steps' | 'calories' | 'duration' | 'distance';
  period?: 'week' | 'month' | 'year';
  showComparison?: boolean;
  animated?: boolean;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  type = 'area',
  metric = 'steps',
  period = 'week',
  showComparison = true,
  animated = true
}) => {
  const { user } = useAuth();
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [percentChange, setPercentChange] = useState(0);

  useEffect(() => {
    if (user) {
      loadChartData();
    }
  }, [user, metric, period]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
      
      // Get activity history using the new service
      const activities = await activityTrackingService.getActivityHistory(user?.id!, days);
      
      // Get user stats
      const stats = await activityTrackingService.getUserStats(user?.id!);

      // Process data based on metric
      const processedData = processDataByMetric(activities || [], stats, metric, period);
      setData(processedData);
      
      // Calculate trend
      calculateTrend(processedData);
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processDataByMetric = (activities: any[], stats: any, metric: string, period: string) => {
    const dateFormat = period === 'week' ? 'EEE' : period === 'month' ? 'MMM d' : 'MMM';
    const grouped: Record<string, ChartData> = {};

    // Initialize with zeros for the period
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 12;
    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), days - i - 1);
      const key = format(date, dateFormat);
      grouped[key] = {
        date: key,
        value: 0,
        goal: getGoalByMetric(metric)
      };
    }

    // Fill with actual data from activities
    activities.forEach(activity => {
      const key = format(new Date(activity.date), dateFormat);
      if (grouped[key]) {
        switch (metric) {
          case 'steps':
            grouped[key].value += activity.steps || 0;
            break;
          case 'calories':
            grouped[key].value += activity.calories_burned || 0;
            break;
          case 'duration':
            grouped[key].value += activity.duration || 0;
            break;
          case 'distance':
            grouped[key].value += activity.distance || 0;
            break;
        }
      }
    });

    // Use today's steps from stats for current day
    if (metric === 'steps' && stats?.today_steps) {
      const todayKey = format(new Date(), dateFormat);
      if (grouped[todayKey]) {
        grouped[todayKey].value = stats.today_steps;
      }
    }

    return Object.values(grouped);
  };

  const getGoalByMetric = (metric: string): number => {
    switch (metric) {
      case 'steps': return 10000;
      case 'calories': return 500;
      case 'duration': return 30;
      case 'distance': return 5;
      default: return 0;
    }
  };

  const calculateTrend = (data: ChartData[]) => {
    if (data.length < 2) return;
    
    const recent = data.slice(-Math.ceil(data.length / 2));
    const previous = data.slice(0, Math.floor(data.length / 2));
    
    const recentAvg = recent.reduce((sum, d) => sum + d.value, 0) / recent.length;
    const previousAvg = previous.reduce((sum, d) => sum + d.value, 0) / previous.length;
    
    const change = ((recentAvg - previousAvg) / previousAvg) * 100;
    setPercentChange(Math.abs(change));
    
    if (change > 5) setTrend('up');
    else if (change < -5) setTrend('down');
    else setTrend('neutral');
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass dark:glass-dark p-3 rounded-lg shadow-xl border border-border/50">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-sm text-primary font-semibold">
            {payload[0].value} {getUnitByMetric(metric)}
          </p>
          {payload[1] && (
            <p className="text-sm text-muted-foreground">
              Goal: {payload[1].value} {getUnitByMetric(metric)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const getUnitByMetric = (metric: string): string => {
    switch (metric) {
      case 'steps': return 'steps';
      case 'calories': return 'cal';
      case 'duration': return 'min';
      case 'distance': return 'mi';
      default: return '';
    }
  };

  const chartProps = {
    data,
    margin: { top: 5, right: 5, left: 5, bottom: 5 },
  };

  const renderChart = () => {
    const color = 'hsl(var(--primary))';
    const gradientId = `gradient-${metric}`;

    switch (type) {
      case 'line':
        return (
          <LineChart {...chartProps}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={color} stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, r: 4 }}
              activeDot={{ r: 6 }}
              animationDuration={animated ? 1500 : 0}
            />
            {showComparison && (
              <Line 
                type="monotone" 
                dataKey="goal" 
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                animationDuration={animated ? 1500 : 0}
              />
            )}
          </LineChart>
        );
      
      case 'bar':
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              fill={color}
              radius={[8, 8, 0, 0]}
              animationDuration={animated ? 1500 : 0}
            />
            {showComparison && (
              <Bar 
                dataKey="goal" 
                fill="hsl(var(--muted-foreground))"
                fillOpacity={0.3}
                radius={[8, 8, 0, 0]}
                animationDuration={animated ? 1500 : 0}
              />
            )}
          </BarChart>
        );
      
      case 'area':
      default:
        return (
          <AreaChart {...chartProps}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.6}/>
                <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color}
              strokeWidth={3}
              fillOpacity={1} 
              fill={`url(#${gradientId})`}
              animationDuration={animated ? 1500 : 0}
            />
            {showComparison && (
              <Line 
                type="monotone" 
                dataKey="goal" 
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                animationDuration={animated ? 1500 : 0}
              />
            )}
          </AreaChart>
        );
    }
  };

  if (loading) {
    return (
      <Card className="card-modern glass dark:glass-dark">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground';

  return (
    <Card className="card-modern glass dark:glass-dark overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold capitalize">
              {metric} Progress
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <TrendIcon className={cn("h-4 w-4", trendColor)} />
              <span className={cn("text-sm font-medium", trendColor)}>
                {percentChange.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">
                vs previous {period}
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            {(['week', 'month', 'year'] as const).map(p => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-2 text-xs capitalize"
                onClick={() => {/* Update period */}}
              >
                {p}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 pb-4">
        <ResponsiveContainer width="100%" height={240}>
          {renderChart()}
        </ResponsiveContainer>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 px-6 mt-4">
          <div>
            <p className="text-xs text-muted-foreground">Average</p>
            <p className="text-lg font-semibold text-foreground">
              {Math.round(data.reduce((sum, d) => sum + d.value, 0) / data.length || 0)}
              <span className="text-xs text-muted-foreground ml-1">{getUnitByMetric(metric)}</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Best Day</p>
            <p className="text-lg font-semibold text-primary">
              {Math.max(...data.map(d => d.value), 0)}
              <span className="text-xs text-muted-foreground ml-1">{getUnitByMetric(metric)}</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Goal</p>
            <p className="text-lg font-semibold text-foreground">
              {getGoalByMetric(metric)}
              <span className="text-xs text-muted-foreground ml-1">{getUnitByMetric(metric)}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};