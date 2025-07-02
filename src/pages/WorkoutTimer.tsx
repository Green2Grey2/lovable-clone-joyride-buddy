import React, { useState } from 'react';
import { WorkoutTimer as TimerComponent } from '@/components/visualizations/WorkoutTimer';
import { FloatingBottomNav } from '@/components/FloatingBottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Play, Timer, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface WorkoutPhase {
  name: string;
  duration: number;
  type: 'work' | 'rest' | 'prepare';
  color: string;
}

const WorkoutTimerPage = () => {
  const navigate = useNavigate();
  const { playNavigation } = useSoundEffects();
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutPhase[] | null>(null);

  const presetWorkouts = [
    {
      name: 'HIIT Express',
      description: '7-minute high-intensity workout',
      totalTime: '7 min',
      calories: '80-120 cal',
      phases: [
        { name: 'Prepare', duration: 10, type: 'prepare' as const, color: 'text-yellow-500' },
        { name: 'High Intensity', duration: 20, type: 'work' as const, color: 'text-red-500' },
        { name: 'Recovery', duration: 10, type: 'rest' as const, color: 'text-blue-500' },
        { name: 'High Intensity', duration: 20, type: 'work' as const, color: 'text-red-500' },
        { name: 'Recovery', duration: 10, type: 'rest' as const, color: 'text-blue-500' },
        { name: 'High Intensity', duration: 20, type: 'work' as const, color: 'text-red-500' },
        { name: 'Recovery', duration: 10, type: 'rest' as const, color: 'text-blue-500' },
        { name: 'High Intensity', duration: 20, type: 'work' as const, color: 'text-red-500' },
        { name: 'Cool Down', duration: 30, type: 'rest' as const, color: 'text-green-500' },
      ]
    },
    {
      name: 'Tabata',
      description: '4-minute Tabata protocol',
      totalTime: '4 min',
      calories: '50-80 cal',
      phases: [
        { name: 'Prepare', duration: 10, type: 'prepare' as const, color: 'text-yellow-500' },
        { name: 'Work', duration: 20, type: 'work' as const, color: 'text-green-500' },
        { name: 'Rest', duration: 10, type: 'rest' as const, color: 'text-blue-500' },
        { name: 'Work', duration: 20, type: 'work' as const, color: 'text-green-500' },
        { name: 'Rest', duration: 10, type: 'rest' as const, color: 'text-blue-500' },
        { name: 'Work', duration: 20, type: 'work' as const, color: 'text-green-500' },
        { name: 'Rest', duration: 10, type: 'rest' as const, color: 'text-blue-500' },
        { name: 'Work', duration: 20, type: 'work' as const, color: 'text-green-500' },
        { name: 'Rest', duration: 10, type: 'rest' as const, color: 'text-blue-500' },
        { name: 'Work', duration: 20, type: 'work' as const, color: 'text-green-500' },
        { name: 'Rest', duration: 10, type: 'rest' as const, color: 'text-blue-500' },
        { name: 'Work', duration: 20, type: 'work' as const, color: 'text-green-500' },
        { name: 'Rest', duration: 10, type: 'rest' as const, color: 'text-blue-500' },
        { name: 'Work', duration: 20, type: 'work' as const, color: 'text-green-500' },
        { name: 'Rest', duration: 10, type: 'rest' as const, color: 'text-blue-500' },
        { name: 'Work', duration: 20, type: 'work' as const, color: 'text-green-500' },
        { name: 'Cool Down', duration: 20, type: 'rest' as const, color: 'text-green-500' },
      ]
    },
    {
      name: 'Strength Circuit',
      description: '15-minute strength training',
      totalTime: '15 min',
      calories: '120-180 cal',
      phases: [
        { name: 'Warm Up', duration: 60, type: 'prepare' as const, color: 'text-yellow-500' },
        { name: 'Exercise', duration: 45, type: 'work' as const, color: 'text-purple-500' },
        { name: 'Rest', duration: 15, type: 'rest' as const, color: 'text-blue-500' },
        { name: 'Exercise', duration: 45, type: 'work' as const, color: 'text-purple-500' },
        { name: 'Rest', duration: 15, type: 'rest' as const, color: 'text-blue-500' },
        { name: 'Exercise', duration: 45, type: 'work' as const, color: 'text-purple-500' },
        { name: 'Rest', duration: 15, type: 'rest' as const, color: 'text-blue-500' },
        { name: 'Exercise', duration: 45, type: 'work' as const, color: 'text-purple-500' },
        { name: 'Rest', duration: 15, type: 'rest' as const, color: 'text-blue-500' },
        { name: 'Exercise', duration: 45, type: 'work' as const, color: 'text-purple-500' },
        { name: 'Rest', duration: 15, type: 'rest' as const, color: 'text-blue-500' },
        { name: 'Exercise', duration: 45, type: 'work' as const, color: 'text-purple-500' },
        { name: 'Cool Down', duration: 120, type: 'rest' as const, color: 'text-green-500' },
      ]
    }
  ];

  const handleWorkoutSelect = (workout: typeof presetWorkouts[0]) => {
    playNavigation();
    setSelectedWorkout(workout.phases);
  };

  const handleBack = () => {
    playNavigation();
    if (selectedWorkout) {
      setSelectedWorkout(null);
    } else {
      navigate('/dashboard');
    }
  };

  const handleWorkoutComplete = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="glass dark:glass-dark backdrop-blur-xl sticky top-0 z-30 border-b border-border/50">
        <div className="px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="rounded-full w-10 h-10 p-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {selectedWorkout ? 'Workout Timer' : 'Choose Workout'}
              </h1>
              <p className="text-muted-foreground text-sm">
                {selectedWorkout ? 'Follow the timer for your workout' : 'Select a structured workout to begin'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {selectedWorkout ? (
          <TimerComponent 
            phases={selectedWorkout}
            onComplete={handleWorkoutComplete}
            autoStart={false}
          />
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4">
              {presetWorkouts.map((workout, index) => (
                <Card 
                  key={index}
                  className="card-modern glass dark:glass-dark hover:shadow-medium hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                  onClick={() => handleWorkoutSelect(workout)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
                        <Timer className="h-8 w-8 text-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                          {workout.name}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-3">
                          {workout.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Timer className="h-4 w-4" />
                            <span className="font-medium">{workout.totalTime}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Zap className="h-4 w-4" />
                            <span className="font-medium">{workout.calories}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-2xl px-6 py-3 group-hover:scale-105 transition-transform duration-300"
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Start
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Custom Timer Option */}
            <Card className="card-modern glass dark:glass-dark border-2 border-dashed border-border">
              <CardContent className="p-6 text-center">
                <Timer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Custom Timer</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Create your own workout timer with custom phases
                </p>
                <Button variant="outline" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <FloatingBottomNav />
    </div>
  );
};

export default WorkoutTimerPage;