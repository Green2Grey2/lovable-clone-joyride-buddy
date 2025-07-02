import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';
import { activityTrackingService } from '@/utils/activityTrackingService';
import { toast } from 'sonner';

export const TestFlagActivity = () => {
  const [activityType, setActivityType] = useState('walking');
  const [steps, setSteps] = useState(50000); // Exceeds limit
  const [duration, setDuration] = useState(600); // 10 hours - exceeds limit  
  const [calories, setCalories] = useState(2000); // Exceeds limit
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await activityTrackingService.recordActivity({
        type: activityType,
        steps,
        duration,
        calories,
        notes: 'Test activity to trigger flagging system'
      });

      if (result) {
        toast.success('Activity recorded successfully');
      } else {
        toast.error('Activity was flagged and rejected');
      }
    } catch (error) {
      console.error('Error submitting activity:', error);
      toast.error('Failed to submit activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto bg-red-50 border-red-200">
      <CardHeader>
        <CardTitle className="text-red-600 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Test Flagging System
        </CardTitle>
        <p className="text-sm text-red-600">
          This form submits suspicious activity data to test the flagging system
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="activity-type">Activity Type</Label>
          <Select value={activityType} onValueChange={setActivityType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="walking">Walking</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="cycling">Cycling</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="steps">Steps (Limit: 40,000 for walking)</Label>
          <Input
            id="steps"
            type="number"
            value={steps}
            onChange={(e) => setSteps(parseInt(e.target.value))}
            className="border-red-300"
          />
        </div>

        <div>
          <Label htmlFor="duration">Duration in minutes (Limit: 480 for walking)</Label>
          <Input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="border-red-300"
          />
        </div>

        <div>
          <Label htmlFor="calories">Calories (Limit: 1,200 for walking)</Label>
          <Input
            id="calories"
            type="number"
            value={calories}
            onChange={(e) => setCalories(parseInt(e.target.value))}
            className="border-red-300"
          />
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          {loading ? 'Submitting...' : 'Submit Suspicious Activity'}
        </Button>

        <p className="text-xs text-red-600">
          This will trigger validation, fail the limits check, and create an admin notification flag.
        </p>
      </CardContent>
    </Card>
  );
};