import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { activityTrackingService } from '@/utils/activityTrackingService';
import { toast } from 'sonner';

export const QuickStepEntry = () => {
  const [steps, setSteps] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  
  const handleLogSteps = async () => {
    const stepCount = Number(steps);
    if (stepCount <= 0) {
      toast.error('Please enter a valid number of steps');
      return;
    }
    
    setIsLogging(true);
    const success = await activityTrackingService.recordQuickSteps(stepCount);
    if (success) {
      setSteps('');
    }
    setIsLogging(false);
  };

  const handlePresetClick = (preset: number) => {
    setSteps(preset.toString());
  };

  return (
    <Card className="gradient-primary border-0 shadow-brand">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-inverse">Quick Step Entry</h3>
        <div className="flex gap-3">
          <Input 
            type="number" 
            placeholder="Today's steps"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            className="text-2xl font-bold h-14 bg-background/90 border-white/20 text-foreground placeholder:text-muted-foreground"
          />
          <Button 
            size="lg"
            onClick={handleLogSteps}
            disabled={isLogging || !steps}
            loading={isLogging}
            loadingText="Logging..."
            className="px-8 bg-background/10 text-inverse border-white/20 hover:bg-background/20"
          >
            Log Steps
          </Button>
        </div>
        
        {/* Quick preset buttons */}
        <div className="flex gap-2 mt-4">
          {[5000, 8000, 10000, 12000].map(preset => (
            <Button
              key={preset}
              variant="outline"
              size="sm"
              onClick={() => handlePresetClick(preset)}
              className="bg-background/10 text-inverse border-white/20 hover:bg-background/20"
            >
              {preset.toLocaleString()}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};