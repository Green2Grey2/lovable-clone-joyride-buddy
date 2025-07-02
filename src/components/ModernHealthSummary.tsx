
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Target, Droplets, Heart, Flame, ChevronRight } from 'lucide-react';

interface ModernHealthSummaryProps {
  steps: number;
  stepGoal: number;
  water: number;
  heartRate: number;
  calories: number;
  onViewMore?: () => void;
}

export const ModernHealthSummary = ({ 
  steps, 
  stepGoal, 
  water, 
  heartRate, 
  calories,
  onViewMore 
}: ModernHealthSummaryProps) => {
  const stepProgress = Math.min((steps / stepGoal) * 100, 100);
  const remainingSteps = Math.max(0, stepGoal - steps);
  
  // Convert to US metrics (miles)
  const todayMiles = (steps / 2000).toFixed(1); // 2000 steps ≈ 1 mile
  const goalMiles = (stepGoal / 2000).toFixed(1);
  const remainingMiles = (remainingSteps / 2000).toFixed(1);

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
