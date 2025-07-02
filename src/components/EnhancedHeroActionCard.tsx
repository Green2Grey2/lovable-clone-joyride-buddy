
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
      <Card className="bg-gradient-to-br from-[#735CF7] to-[#00A3FF] text-white border-0 rounded-3xl shadow-[0px_20px_40px_rgba(115,92,247,0.3)] overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="text-4xl">{activeActivity.icon || '🏃‍♀️'}</div>
                <div>
                  <h2 className="text-2xl font-bold">{activeActivity.name}</h2>
                  <p className="text-white/80">Currently Active</p>
                </div>
              </div>
            </div>
            <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          
          <Button
            onClick={onPrimaryAction}
            size="lg"
            className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-2xl backdrop-blur-sm transition-all duration-300"
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
    <Card className="bg-white border-0 rounded-3xl shadow-[0px_20px_40px_rgba(115,92,247,0.1)] overflow-hidden">
      <CardContent className="p-8">
        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#1D244D] mb-1">Daily Progress</h2>
              <p className="text-[#8A94A6]">{todayMiles} of {goalMiles} miles walked</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-[#1D244D]">{todaySteps.toLocaleString()}</p>
              <p className="text-sm text-[#8A94A6]">steps today</p>
            </div>
          </div>
          
          <Progress value={stepProgress} className="h-4 mb-3 bg-gray-100" />
          
          <p className="text-sm text-muted-foreground">
            {remainingSteps > 0 
              ? `${remainingMiles} miles to reach your daily goal`
              : 'Daily goal achieved! 🎉'
            }
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center p-4 bg-[#F5F6FA] rounded-2xl">
            <div className="w-10 h-10 bg-gradient-to-br from-[#735CF7] to-[#00A3FF] rounded-xl flex items-center justify-center mx-auto mb-2">
              <Target className="h-5 w-5 text-white" />
            </div>
            <p className="text-lg font-bold text-[#1D244D]">{todayMiles}</p>
            <p className="text-xs text-[#8A94A6]">miles</p>
          </div>
          <div className="text-center p-4 bg-[#F5F6FA] rounded-2xl">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF7B5A] to-[#FF6B4A] rounded-xl flex items-center justify-center mx-auto mb-2">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <p className="text-lg font-bold text-[#1D244D]">0</p>
            <p className="text-xs text-[#8A94A6]">calories</p>
          </div>
          <div className="text-center p-4 bg-[#F5F6FA] rounded-2xl">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00A3FF] to-[#0088CC] rounded-xl flex items-center justify-center mx-auto mb-2">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <p className="text-lg font-bold text-[#1D244D]">0</p>
            <p className="text-xs text-[#8A94A6]">min active</p>
          </div>
        </div>

        {/* Primary Action */}
        <Button
          onClick={onPrimaryAction}
          size="lg"
          className="w-full bg-gradient-to-r from-[#735CF7] to-[#00A3FF] text-white rounded-2xl h-14 text-lg font-semibold hover:shadow-[0px_10px_30px_rgba(115,92,247,0.4)] transition-all duration-300"
        >
          <Play className="h-6 w-6 mr-3" />
          Start Activity
          <ArrowRight className="h-5 w-5 ml-3" />
        </Button>
      </CardContent>
    </Card>
  );
};
