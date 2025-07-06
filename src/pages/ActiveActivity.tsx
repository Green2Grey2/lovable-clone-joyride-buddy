
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, Timer, Target, Zap, Minimize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useUserStats } from '@/contexts/UserStatsContext';
import { calculateCaloriesBurned, calculateCaloriesFromSteps } from '@/utils/calorieCalculator';

const ActiveActivity = () => {
  const navigate = useNavigate();
  const { activeActivity, stopActivity, userProfile } = useApp();
  const { stats: userStats, updateStats } = useUserStats();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    calories: 0,
    steps: 0,
    distance: 0
  });

  useEffect(() => {
    if (!activeActivity) {
      navigate('/dashboard');
      return;
    }

    const interval = setInterval(() => {
      if (!isPaused && activeActivity.startTime) {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - activeActivity.startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
        
        // Calculate session stats based on elapsed time and user's health data
        const minutes = elapsed / 60;
        
        // Use actual calorie calculation if user has health data
        let caloriesFromActivity = 0;
        let stepsFromActivity = 0;
        
        if (userProfile.height && userProfile.weight && userProfile.age && userProfile.sex) {
          const userData = {
            weight: userProfile.weight,
            height: userProfile.height,
            age: userProfile.age,
            sex: userProfile.sex
          };
          
          // Calculate calories based on activity type and user data
          const activityName = activeActivity.name.toLowerCase();
          caloriesFromActivity = calculateCaloriesBurned(activityName, minutes, userData);
          
          // Calculate steps based on activity (walking/running activities generate more steps)
          if (activityName.includes('walk') || activityName.includes('run')) {
            stepsFromActivity = Math.floor(minutes * 100); // ~100 steps per minute for walking/running
          } else {
            stepsFromActivity = Math.floor(minutes * 20); // ~20 steps per minute for other activities
          }
        } else {
          // Fallback to rough estimates
          caloriesFromActivity = Math.floor(minutes * 5);
          stepsFromActivity = Math.floor(minutes * 80);
        }
        
        // Calculate distance (rough estimate based on steps)
        const distanceFromActivity = parseFloat((stepsFromActivity * 0.0008).toFixed(2)); // ~0.8m per step
        
        setSessionStats({
          calories: caloriesFromActivity,
          steps: stepsFromActivity,
          distance: distanceFromActivity
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeActivity, isPaused, navigate, userProfile]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStopActivity = () => {
    if (activeActivity && sessionStats.steps > 0) {
      // Update user stats with new steps
      // The database trigger will automatically update all aggregated stats
      updateStats({
        today_steps: (userStats?.today_steps || 0) + sessionStats.steps,
        calories_burned: (userStats?.calories_burned || 0) + sessionStats.calories
      });
    }
    
    stopActivity();
    navigate('/dashboard');
  };

  const handleMinimize = () => {
    navigate('/dashboard');
  };

  if (!activeActivity) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Minimize Button */}
      <div className="bg-gradient-to-br from-[#735CF7] to-[#00A3FF] text-white p-8 text-center relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
          onClick={handleMinimize}
        >
          <Minimize2 className="h-5 w-5" />
        </Button>
        
        <div className="text-6xl mb-4">{activeActivity.icon || '🏃‍♀️'}</div>
        <h1 className="text-3xl font-bold mb-2">{activeActivity.name}</h1>
        <p className="text-white/80">{activeActivity.description || 'Stay active and healthy!'}</p>
      </div>

      {/* Timer */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
        <Card className="w-full max-w-md card-modern glass dark:glass-dark">
          <CardContent className="p-8 text-center">
            <div className="text-6xl font-bold text-foreground mb-4">
              {formatTime(elapsedTime)}
            </div>
            <p className="text-muted-foreground">Active Time</p>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-md">
          <Card className="card-modern glass dark:glass-dark">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF7B5A] to-[#FF6B4A] rounded-xl flex items-center justify-center mx-auto mb-2">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <p className="text-xl font-bold text-foreground">{sessionStats.calories}</p>
              <p className="text-xs text-muted-foreground">calories</p>
            </CardContent>
          </Card>
          
          <Card className="card-modern glass dark:glass-dark">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-[#735CF7] to-[#00A3FF] rounded-xl flex items-center justify-center mx-auto mb-2">
                <Target className="h-5 w-5 text-white" />
              </div>
              <p className="text-xl font-bold text-foreground">{sessionStats.steps}</p>
              <p className="text-xs text-muted-foreground">steps</p>
            </CardContent>
          </Card>
          
          <Card className="card-modern glass dark:glass-dark">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00A3FF] to-[#0088CC] rounded-xl flex items-center justify-center mx-auto mb-2">
                <Timer className="h-5 w-5 text-white" />
              </div>
              <p className="text-xl font-bold text-foreground">{sessionStats.distance}</p>
              <p className="text-xs text-muted-foreground">km</p>
            </CardContent>
          </Card>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4 w-full max-w-md">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? <Play className="h-6 w-6 mr-2" /> : <Pause className="h-6 w-6 mr-2" />}
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          
          <Button
            size="lg"
            className="flex-1 bg-gradient-to-r from-[#FF7B5A] to-[#FF6B4A] text-white"
            onClick={handleStopActivity}
          >
            <Square className="h-6 w-6 mr-2" />
            Finish
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActiveActivity;
