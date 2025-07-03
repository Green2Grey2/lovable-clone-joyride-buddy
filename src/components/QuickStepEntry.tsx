import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { activityTrackingService } from '@/utils/activityTrackingService';
import { toast } from 'sonner';
import { Footprints } from 'lucide-react';

export const QuickStepEntry = () => {
  const [steps, setSteps] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!steps || Number(steps) <= 0) {
      toast.error('Please enter valid steps');
      return;
    }

    setLoading(true);
    const success = await activityTrackingService.recordQuickSteps(Number(steps));
    if (success) {
      setSteps('');
    }
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit();
    }
  };

  return (
    <Card className="card-modern glass dark:glass-dark">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Footprints className="h-5 w-5 text-primary" />
          Quick Step Entry
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Enter today's steps"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="flex-1"
            min="1"
            max="100000"
          />
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !steps}
            className="btn-modern"
          >
            {loading ? 'Logging...' : 'Log Steps'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Quick entry bypasses validation - use for trusted step counts
        </p>
      </CardContent>
    </Card>
  );
};