import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { activityTrackingService } from '@/utils/activityTrackingService';
import { toast } from 'sonner';

interface ManualStepTrackerProps {
  currentSteps: number;
  onStepsAdded?: () => void;
}

export const ManualStepTracker = ({ currentSteps, onStepsAdded }: ManualStepTrackerProps) => {
  const [stepInput, setStepInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const quickStepOptions = [500, 1000, 2000, 5000];

  const handleAddSteps = async (steps: number) => {
    console.log('🚀 ManualStepTracker: Starting to add steps:', steps);
    
    if (steps <= 0) {
      toast.error('Please enter a valid number of steps');
      return;
    }

    setIsAdding(true);
    try {
      console.log('📝 ManualStepTracker: Calling activityTrackingService.recordActivity');
      const success = await activityTrackingService.recordActivity({
        type: 'walking',
        steps: steps,
        duration: Math.ceil(steps / 100), // Estimate: ~100 steps per minute
        calories: Math.ceil(steps * 0.04), // Estimate: ~0.04 calories per step
        notes: 'Manual step entry'
      });

      console.log('✅ ManualStepTracker: recordActivity result:', success);

      if (success) {
        setStepInput('');
        console.log('🔄 ManualStepTracker: Calling onStepsAdded callback');
        onStepsAdded?.();
        toast.success(`Added ${steps.toLocaleString()} steps to your daily total!`);
        console.log('🎉 ManualStepTracker: Steps added successfully');
      } else {
        console.warn('⚠️ ManualStepTracker: recordActivity returned false');
        toast.error('Failed to record activity');
      }
    } catch (error) {
      console.error('❌ ManualStepTracker: Error adding steps:', error);
      toast.error('Failed to add steps. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuickAdd = (steps: number) => {
    handleAddSteps(steps);
  };

  const handleCustomAdd = () => {
    const steps = parseInt(stepInput);
    if (isNaN(steps) || steps <= 0) {
      toast.error('Please enter a valid number of steps');
      return;
    }
    handleAddSteps(steps);
  };

  return (
    <Card className="card-modern glass dark:glass-dark">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Add Steps
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Steps Display */}
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">Current Daily Total</p>
          <p className="text-2xl font-bold text-foreground">{currentSteps.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">steps</p>
        </div>

        {/* Quick Add Buttons */}
        <div>
          <Label className="text-sm font-medium text-foreground mb-2 block">Quick Add</Label>
          <div className="grid grid-cols-2 gap-2">
            {quickStepOptions.map((steps) => (
              <Button
                key={steps}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAdd(steps)}
                disabled={isAdding}
                className="text-sm"
              >
                +{steps.toLocaleString()}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div className="space-y-2">
          <Label htmlFor="custom-steps" className="text-sm font-medium text-foreground">
            Custom Amount
          </Label>
          <div className="flex gap-2">
            <Input
              id="custom-steps"
              type="number"
              placeholder="Enter steps..."
              value={stepInput}
              onChange={(e) => setStepInput(e.target.value)}
              min="1"
              max="50000"
              disabled={isAdding}
            />
            <Button 
              onClick={handleCustomAdd}
              disabled={isAdding || !stepInput}
              size="sm"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Helpful Tips */}
        <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
          <p className="text-xs text-primary/80 mb-2 font-medium">💡 Step Reference</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Short walk (10 min)</span>
              <Badge variant="outline" className="text-xs">~1,000 steps</Badge>
            </div>
            <div className="flex justify-between">
              <span>Mile walk (~20 min)</span>
              <Badge variant="outline" className="text-xs">~2,000 steps</Badge>
            </div>
            <div className="flex justify-between">
              <span>Long walk (1 hour)</span>
              <Badge variant="outline" className="text-xs">~6,000 steps</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};