
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { 
  Target, Clock, MapPin, TrendingUp, Calendar as CalendarIcon, 
  Flame, Droplets, Heart, Award, ChevronDown, Zap 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LineChart, Line, Area, AreaChart, Tooltip } from 'recharts';
import { useApp } from '@/contexts/AppContext';

export const ComprehensiveActivityView = () => {
  const { userStats, userProfile } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'steps' | 'calories' | 'distance' | 'workouts'>('steps');
  
  // Convert to US metrics (miles)
  const stepGoal = Math.floor(userProfile.weeklyGoal / 7);
  const stepProgress = (userStats.todaySteps / stepGoal) * 100;
  const todayMiles = (userStats.todaySteps / 2000).toFixed(1); // 2000 steps ≈ 1 mile

  // Use real user data for weekly view
  const weeklyData = [
    { day: 'Mon', steps: Math.floor(userStats.weeklySteps * 0.12), calories: Math.floor(userStats.calories * 0.12), distance: parseFloat((userStats.weeklySteps * 0.12 / 2000).toFixed(1)), date: '2024-01-15' },
    { day: 'Tue', steps: Math.floor(userStats.weeklySteps * 0.18), calories: Math.floor(userStats.calories * 0.18), distance: parseFloat((userStats.weeklySteps * 0.18 / 2000).toFixed(1)), date: '2024-01-16' },
    { day: 'Wed', steps: Math.floor(userStats.weeklySteps * 0.15), calories: Math.floor(userStats.calories * 0.15), distance: parseFloat((userStats.weeklySteps * 0.15 / 2000).toFixed(1)), date: '2024-01-17' },
    { day: 'Thu', steps: Math.floor(userStats.weeklySteps * 0.20), calories: Math.floor(userStats.calories * 0.20), distance: parseFloat((userStats.weeklySteps * 0.20 / 2000).toFixed(1)), date: '2024-01-18' },
    { day: 'Fri', steps: userStats.todaySteps, calories: userStats.calories, distance: parseFloat(todayMiles), date: '2024-01-19' },
    { day: 'Sat', steps: 0, calories: 0, distance: 0, date: '2024-01-20' },
    { day: 'Sun', steps: 0, calories: 0, distance: 0, date: '2024-01-21' },
  ];

  // Use real user data for monthly view
  const monthlyData = [
    { week: 'W1', steps: Math.floor(userStats.monthlySteps * 0.28), calories: Math.floor(userStats.calories * 4 * 0.28), workouts: Math.floor(userStats.totalWorkouts * 0.28), distance: parseFloat((userStats.monthlySteps * 0.28 / 2000).toFixed(1)), activeMinutes: Math.floor(userStats.activeMinutes * 4 * 0.28) },
    { week: 'W2', steps: Math.floor(userStats.monthlySteps * 0.32), calories: Math.floor(userStats.calories * 4 * 0.32), workouts: Math.floor(userStats.totalWorkouts * 0.32), distance: parseFloat((userStats.monthlySteps * 0.32 / 2000).toFixed(1)), activeMinutes: Math.floor(userStats.activeMinutes * 4 * 0.32) },
    { week: 'W3', steps: Math.floor(userStats.monthlySteps * 0.25), calories: Math.floor(userStats.calories * 4 * 0.25), workouts: Math.floor(userStats.totalWorkouts * 0.25), distance: parseFloat((userStats.monthlySteps * 0.25 / 2000).toFixed(1)), activeMinutes: Math.floor(userStats.activeMinutes * 4 * 0.25) },
    { week: 'W4', steps: Math.floor(userStats.monthlySteps * 0.15), calories: Math.floor(userStats.calories * 4 * 0.15), workouts: Math.floor(userStats.totalWorkouts * 0.15), distance: parseFloat((userStats.monthlySteps * 0.15 / 2000).toFixed(1)), activeMinutes: Math.floor(userStats.activeMinutes * 4 * 0.15) },
  ];

  const recentActivities = [
    {
      id: '1',
      activity: 'Running',
      goal: 'Running goal completed',
      duration: `${userStats.activeMinutes} min`,
      date: 'Today',
      stats: { distance: `${todayMiles} mi`, pace: '8:30/mi', calories: userStats.calories.toString() },
      icon: Target,
      completed: true
    },
    {
      id: '2',
      activity: 'Walking',
      goal: 'Daily steps achieved',
      duration: `${Math.floor(userStats.activeMinutes * 1.2)} min`,
      date: 'Yesterday',
      stats: { steps: userStats.todaySteps.toLocaleString(), distance: `${(userStats.todaySteps * 0.8 / 2000).toFixed(1)} mi`, calories: Math.floor(userStats.calories * 0.8).toString() },
      icon: Target,
      completed: true
    },
    {
      id: '3',
      activity: 'Workout',
      goal: 'Strength training',
      duration: '30 min',
      date: '2 days ago',
      stats: { sets: '12', reps: '180', calories: Math.floor(userStats.calories * 0.6).toString() },
      icon: Zap,
      completed: true
    }
  ];

  const metricOptions = [
    { key: 'steps', label: 'Steps', icon: Target, color: '#735CF7' },
    { key: 'calories', label: 'Calories', icon: Flame, color: '#FF7B5A' },
    { key: 'distance', label: 'Distance (mi)', icon: MapPin, color: '#00A3FF' },
    { key: 'workouts', label: 'Workouts', icon: Zap, color: '#10B981' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100">
          <p className="font-semibold text-[#1D244D] mb-2">{label}</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#735CF7] rounded-full"></div>
              <span className="text-sm">Steps: {data.steps?.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#FF7B5A] rounded-full"></div>
              <span className="text-sm">Calories: {data.calories}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#00A3FF] rounded-full"></div>
              <span className="text-sm">Distance: {data.distance} mi</span>
            </div>
            {data.activeMinutes && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#10B981] rounded-full"></div>
                <span className="text-sm">Active: {data.activeMinutes} min</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const TodayContent = () => (
    <div className="space-y-6">
      {/* Today's Progress */}
      <Card className="bg-white border-0 rounded-3xl shadow-[0px_10px_30px_rgba(115,92,247,0.1)]">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-[#1D244D]">Today's Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Steps Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[#8A94A6] font-medium">Steps</span>
              <span className="text-2xl font-bold text-[#1D244D]">{userStats.todaySteps.toLocaleString()}</span>
            </div>
            <Progress value={stepProgress} className="h-3 bg-gray-100" />
            <p className="text-sm text-[#8A94A6]">{Math.max(0, stepGoal - userStats.todaySteps).toLocaleString()} steps to reach your goal</p>
          </div>

          {/* Today's Stats Grid */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#735CF7] to-[#00A3FF] rounded-2xl flex items-center justify-center mx-auto mb-2">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#1D244D]">{todayMiles}</p>
              <p className="text-xs text-[#8A94A6]">miles walked</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FF7B5A] to-[#FF6B4A] rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#1D244D]">{userStats.activeMinutes}</p>
              <p className="text-xs text-[#8A94A6]">active mins</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00A3FF] to-[#0088CC] rounded-2xl flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#1D244D]">{userStats.calories}</p>
              <p className="text-xs text-[#8A94A6]">calories</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Droplets className="h-5 w-5 text-white" />
            </div>
            <p className="text-xl font-bold text-blue-800">{userStats.water}</p>
            <p className="text-xs text-blue-600">glasses water</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <p className="text-xl font-bold text-red-800">{userStats.heartRate}</p>
            <p className="text-xs text-red-600">avg BPM</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <p className="text-xl font-bold text-orange-800">{userStats.calories}</p>
            <p className="text-xs text-orange-600">calories burned</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="bg-white border-0 rounded-3xl shadow-[0px_10px_30px_rgba(115,92,247,0.1)]">
        <CardHeader className="pb-4">
          <CardTitle className="text-[#1D244D] text-xl font-semibold">Today's Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.slice(0, 2).map((item) => {
              const IconComponent = item.icon;
              return (
                <Card key={item.id} className="bg-[#F5F6FA] border-0 rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#735CF7] to-[#00A3FF] rounded-2xl flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-[#1D244D] font-semibold">{item.goal}</h4>
                          <Badge className="bg-green-100 text-green-700 border-0">
                            Completed
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1 text-[#8A94A6] text-sm">
                            <Clock className="h-4 w-4" />
                            {item.duration}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          {Object.entries(item.stats).map(([key, value]) => (
                            <div key={key} className="bg-white rounded-xl p-3 text-center">
                              <p className="text-[#8A94A6] text-xs capitalize">{key}</p>
                              <p className="text-[#1D244D] text-sm font-semibold">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const WeeklyContent = () => (
    <div className="space-y-6">
      {/* Weekly Chart */}
      <Card className="bg-white border-0 rounded-3xl shadow-[0px_10px_30px_rgba(115,92,247,0.1)]">
        <CardHeader className="pb-4">
          <CardTitle className="text-[#1D244D] text-xl font-semibold">Weekly Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} barCategoryGap="20%">
                <defs>
                  <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#735CF7" />
                    <stop offset="100%" stopColor="#00A3FF" />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8A94A6', fontSize: 12 }}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="steps" radius={[8, 8, 0, 0]}>
                  {weeklyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.day === 'Fri' ? 'url(#weeklyGradient)' : '#E5E7EB'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Overview */}
      <Card className="bg-white border-0 rounded-3xl shadow-[0px_10px_30px_rgba(115,92,247,0.1)]">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-[#1D244D] flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            This Week's Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weeklyData.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${day.steps > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="font-medium text-[#1D244D]">{day.day}</span>
                </div>
                <div className="flex gap-6 text-right">
                  <div>
                    <span className="text-sm font-bold text-[#1D244D]">{day.steps.toLocaleString()}</span>
                    <span className="text-xs text-[#8A94A6] ml-1">steps</span>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#1D244D]">{day.distance}</span>
                    <span className="text-xs text-[#8A94A6] ml-1">mi</span>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#1D244D]">{day.calories}</span>
                    <span className="text-xs text-[#8A94A6] ml-1">cal</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Activities This Week */}
      <Card className="bg-white border-0 rounded-3xl shadow-[0px_10px_30px_rgba(115,92,247,0.1)]">
        <CardHeader className="pb-4">
          <CardTitle className="text-[#1D244D] text-xl font-semibold">All Activities This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((item) => {
              const IconComponent = item.icon;
              return (
                <Card key={item.id} className="bg-[#F5F6FA] border-0 rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#735CF7] to-[#00A3FF] rounded-2xl flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-[#1D244D] font-semibold">{item.goal}</h4>
                          <Badge className="bg-green-100 text-green-700 border-0">
                            Completed
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1 text-[#8A94A6] text-sm">
                            <Clock className="h-4 w-4" />
                            {item.duration}
                          </div>
                          <span className="text-[#8A94A6] text-sm">{item.date}</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          {Object.entries(item.stats).map(([key, value]) => (
                            <div key={key} className="bg-white rounded-xl p-3 text-center">
                              <p className="text-[#8A94A6] text-xs capitalize">{key}</p>
                              <p className="text-[#1D244D] text-sm font-semibold">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const MonthlyContent = () => (
    <div className="space-y-6">
      {/* Enhanced Monthly Chart with integrated metric selector */}
      <Card className="bg-white border-0 rounded-3xl shadow-[0px_10px_30px_rgba(115,92,247,0.1)]">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-[#1D244D] text-lg md:text-xl font-semibold">
              Monthly {metricOptions.find(m => m.key === selectedMetric)?.label} Overview
            </CardTitle>
          </div>
          {/* Integrated Metric Selector - Fixed responsive layout */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {metricOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <Button
                  key={option.key}
                  variant={selectedMetric === option.key ? "default" : "outline"}
                  onClick={() => setSelectedMetric(option.key as any)}
                  size="sm"
                  className={`h-auto p-2 md:p-3 justify-start text-xs flex-col md:flex-row gap-1 md:gap-2 ${
                    selectedMetric === option.key 
                      ? 'bg-gradient-to-r from-[#735CF7] to-[#00A3FF] text-white' 
                      : 'bg-white hover:bg-gray-50 text-[#1D244D] hover:text-[#1D244D]'
                  }`}
                >
                  <IconComponent className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="text-xs leading-tight">{option.label}</span>
                </Button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-8 pt-0">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metricOptions.find(m => m.key === selectedMetric)?.color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={metricOptions.find(m => m.key === selectedMetric)?.color} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="week" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8A94A6', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8A94A6', fontSize: 12 }}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke={metricOptions.find(m => m.key === selectedMetric)?.color} 
                  strokeWidth={3}
                  fill="url(#monthlyGradient)"
                  dot={{ fill: metricOptions.find(m => m.key === selectedMetric)?.color, strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 8, fill: metricOptions.find(m => m.key === selectedMetric)?.color }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white border-0 rounded-3xl shadow-[0px_10px_30px_rgba(115,92,247,0.1)]">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-[#735CF7] to-[#00A3FF] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Target className="h-6 w-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-[#1D244D]">{userStats.monthlySteps.toLocaleString()}</p>
            <p className="text-sm text-[#8A94A6]">Total Steps</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-0 rounded-3xl shadow-[0px_10px_30px_rgba(115,92,247,0.1)]">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF7B5A] to-[#FF6B4A] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-[#1D244D]">{Math.floor(userStats.calories * 4)}</p>
            <p className="text-sm text-[#8A94A6]">Total Calories</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <Card className="bg-white border-0 rounded-3xl shadow-[0px_10px_30px_rgba(115,92,247,0.1)]">
        <CardHeader className="pb-4">
          <CardTitle className="text-[#1D244D] text-xl font-semibold">Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyData.map((week, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#735CF7] rounded-full"></div>
                  <span className="font-medium text-[#1D244D]">{week.week}</span>
                </div>
                <div className="flex gap-3 md:gap-6 text-right text-xs md:text-sm">
                  <div>
                    <span className="font-bold text-[#1D244D]">{week.steps.toLocaleString()}</span>
                    <span className="text-[#8A94A6] ml-1">steps</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#1D244D]">{week.calories}</span>
                    <span className="text-[#8A94A6] ml-1">cal</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#1D244D]">{week.workouts}</span>
                    <span className="text-[#8A94A6] ml-1">workouts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <Card className="bg-white border-0 rounded-3xl shadow-[0px_10px_30px_rgba(115,92,247,0.1)]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1D244D]">Activity Overview</h2>
            <Popover open={showCalendar} onOpenChange={setShowCalendar}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="rounded-xl">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {selectedDate.toLocaleDateString()}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setShowCalendar(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different time periods */}
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white rounded-2xl p-1 shadow-[0px_10px_30px_rgba(115,92,247,0.1)]">
          <TabsTrigger 
            value="today" 
            className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#735CF7] data-[state=active]:to-[#00A3FF] data-[state=active]:text-white flex items-center justify-center px-4 py-2 min-h-[2.5rem]"
          >
            Today
          </TabsTrigger>
          <TabsTrigger 
            value="weekly" 
            className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#735CF7] data-[state=active]:to-[#00A3FF] data-[state=active]:text-white flex items-center justify-center px-4 py-2 min-h-[2.5rem]"
          >
            Weekly
          </TabsTrigger>
          <TabsTrigger 
            value="monthly" 
            className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#735CF7] data-[state=active]:to-[#00A3FF] data-[state=active]:text-white flex items-center justify-center px-4 py-2 min-h-[2.5rem]"
          >
            Monthly
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="today" className="mt-6">
          <TodayContent />
        </TabsContent>
        
        <TabsContent value="weekly" className="mt-6">
          <WeeklyContent />
        </TabsContent>
        
        <TabsContent value="monthly" className="mt-6">
          <MonthlyContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};
