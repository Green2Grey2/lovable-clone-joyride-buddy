
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, ArrowRight, Target, Flame, Clock } from 'lucide-react';
import { Activity } from '@/contexts/AppContext';

interface EnhancedHeroActionCardProps {
  activeActivity: Activity | null;
  onPrimaryAction: () => void;
  todaySteps: number;
  stepGoal: number;
}

export const EnhancedHeroActionCard = ({ 
  activeActivity, 
  onPrimaryAction, 
  todaySteps, 
  stepGoal 
}: EnhancedHeroActionCardProps) => {
  const stepProgress = Math.min((todaySteps / stepGoal) * 100, 100);
  const remainingSteps = Math.max(0, stepGoal - todaySteps);
  
  // Convert steps to miles (approximately 2000 steps = 1 mile)
  const todayMiles = (todaySteps / 2000).toFixed(1);
  const goalMiles = (stepGoal / 2000).toFixed(1);
  const remainingMiles = (remainingSteps / 2000).toFixed(1);

  if (activeActivity) {
    return (
      <Card className="bg-gradient-to-br from-primary to-secondary text-primary-foreground border-0 rounded-3xl shadow-premium overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="text-4xl">{activeActivity.icon || '🏃‍♀️'}</div>
                <div>
                  <h2 className="text-2xl font-bold">{activeActivity.name}</h2>
                  <p className="text-primary-foreground/80">Currently Active</p>
                </div>
              </div>
            </div>
            <div className="w-4 h-4 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
          </div>
          
          <Button
            onClick={onPrimaryAction}
            size="lg"
            className="w-full bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-primary-foreground/30 rounded-2xl backdrop-blur-sm transition-all duration-300"
          >
            <Pause className="h-6 w-6 mr-2" />
            View Active Session
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-0 rounded-3xl shadow-premium overflow-hidden">
      <CardContent className="p-8">
        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">Daily Progress</h2>
              <p className="text-muted-foreground">{todayMiles} of {goalMiles} miles walked</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-foreground">{todaySteps.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">steps today</p>
            </div>
          </div>
          
          <Progress value={stepProgress} className="h-4 mb-3" />
          
          <p className="text-sm text-muted-foreground">
            {remainingSteps > 0 
              ? `${remainingMiles} miles to reach your daily goal`
              : 'Daily goal achieved! 🎉'
            }
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center p-4 bg-muted/50 rounded-2xl">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mx-auto mb-2">
              <Target className="h-5 w-5 text-primary-foreground" />
            </div>
            <p className="text-lg font-bold text-foreground">{todayMiles}</p>
            <p className="text-xs text-muted-foreground">miles</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-2xl">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <p className="text-lg font-bold text-foreground">0</p>
            <p className="text-xs text-muted-foreground">calories</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-2xl">
            <div className="w-10 h-10 bg-gradient-to-br from-secondary to-secondary/80 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <p className="text-lg font-bold text-foreground">0</p>
            <p className="text-xs text-muted-foreground">min active</p>
          </div>
        </div>

        {/* Primary Action */}
        <Button
          onClick={onPrimaryAction}
          size="lg"
          className="w-full gradient-health text-primary-foreground rounded-2xl h-14 text-lg font-semibold hover:shadow-premium transition-all duration-300"
        >
          <Play className="h-6 w-6 mr-3" />
          Start Activity
          <ArrowRight className="h-5 w-5 ml-3" />
        </Button>
      </CardContent>
    </Card>
  );
};
