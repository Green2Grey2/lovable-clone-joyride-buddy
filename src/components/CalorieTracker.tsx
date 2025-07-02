
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame, Target, TrendingUp } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { calculateCaloriesFromSteps, calculateDailyCalorieNeeds, calculateCaloriesBurned } from '@/utils/calorieCalculator';

export const CalorieTracker = () => {
  const { userProfile, userStats } = useApp();
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [stepsCalories, setStepsCalories] = useState(0);

  useEffect(() => {
    if (userProfile.height && userProfile.weight && userProfile.age && userProfile.sex) {
      const userData = {
        weight: userProfile.weight,
        height: userProfile.height,
        age: userProfile.age,
        sex: userProfile.sex
      };

      // Calculate daily calorie burn goal (30% of daily needs)
      const dailyNeeds = calculateDailyCalorieNeeds(userData, 'moderate');
      setDailyCalorieGoal(Math.floor(dailyNeeds * 0.3));

      // Calculate calories from today's steps
      const stepCalories = calculateCaloriesFromSteps(userStats.todaySteps, userData);
      setStepsCalories(stepCalories);

      // Use the actual calories from userStats (which includes activity calories)
      setCaloriesBurned(userStats.calories);
    }
  }, [userProfile, userStats.todaySteps, userStats.calories]);

  const progress = dailyCalorieGoal > 0 ? (caloriesBurned / dailyCalorieGoal) * 100 : 0;

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-orange-800 dark:text-orange-200 flex items-center gap-2">
          <Flame className="h-5 w-5" />
          Calorie Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">{caloriesBurned}</p>
            <p className="text-sm text-orange-600 dark:text-orange-400">Calories burned today</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-orange-700 dark:text-orange-300">/ {dailyCalorieGoal}</p>
            <p className="text-xs text-orange-600 dark:text-orange-400">Daily goal</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-orange-700 dark:text-orange-300">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={Math.min(progress, 100)} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-background/50 rounded-lg p-2">
            <p className="font-semibold text-orange-800 dark:text-orange-200">{stepsCalories}</p>
            <p className="text-orange-600 dark:text-orange-400 text-xs">From steps</p>
          </div>
          <div className="bg-background/50 rounded-lg p-2">
            <p className="font-semibold text-orange-800 dark:text-orange-200">{Math.max(0, caloriesBurned - stepsCalories)}</p>
            <p className="text-orange-600 dark:text-orange-400 text-xs">From activities</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
