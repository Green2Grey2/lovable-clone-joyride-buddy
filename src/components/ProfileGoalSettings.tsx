import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Target, Save, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface GoalSettings {
  daily_step_goal: number;
  weekly_step_goal: number;
  monthly_step_goal: number;
}

export const ProfileGoalSettings = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<GoalSettings>({
    daily_step_goal: 5000,
    weekly_step_goal: 35000,
    monthly_step_goal: 150000
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('daily_step_goal, weekly_step_goal, monthly_step_goal')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setGoals({
          daily_step_goal: data.daily_step_goal || 5000,
          weekly_step_goal: data.weekly_step_goal || 35000,
          monthly_step_goal: data.monthly_step_goal || 150000
        });
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to load goal settings');
    } finally {
      setLoading(false);
    }
  };

  const saveGoals = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          daily_step_goal: goals.daily_step_goal,
          weekly_step_goal: goals.weekly_step_goal,
          monthly_step_goal: goals.monthly_step_goal
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Goal settings saved successfully!');
    } catch (error) {
      console.error('Error saving goals:', error);
      toast.error('Failed to save goal settings');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setGoals({
      daily_step_goal: 5000,
      weekly_step_goal: 35000,
      monthly_step_goal: 150000
    });
    toast.info('Reset to default values');
  };

  const handleGoalChange = (type: keyof GoalSettings, value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue >= 0 && numValue <= 100000) {
      setGoals(prev => ({ ...prev, [type]: numValue }));
    }
  };

  if (loading) {
    return (
      <Card className="card-modern">
        <CardContent className="p-6">
          <div className="text-center">Loading goal settings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Step Goals
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Customize your daily, weekly, and monthly step targets
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Daily Goal */}
        <div className="space-y-2">
          <Label htmlFor="daily-goal" className="text-sm font-medium">
            Daily Step Goal
          </Label>
          <Input
            id="daily-goal"
            type="number"
            value={goals.daily_step_goal}
            onChange={(e) => handleGoalChange('daily_step_goal', e.target.value)}
            min="1000"
            max="50000"
            step="500"
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            Recommended: 5,000 - 10,000 steps per day
          </p>
        </div>

        <Separator />

        {/* Weekly Goal */}
        <div className="space-y-2">
          <Label htmlFor="weekly-goal" className="text-sm font-medium">
            Weekly Step Goal
          </Label>
          <Input
            id="weekly-goal"
            type="number"
            value={goals.weekly_step_goal}
            onChange={(e) => handleGoalChange('weekly_step_goal', e.target.value)}
            min="7000"
            max="350000"
            step="1000"
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            Recommended: 35,000 - 70,000 steps per week
          </p>
        </div>

        <Separator />

        {/* Monthly Goal */}
        <div className="space-y-2">
          <Label htmlFor="monthly-goal" className="text-sm font-medium">
            Monthly Step Goal
          </Label>
          <Input
            id="monthly-goal"
            type="number"
            value={goals.monthly_step_goal}
            onChange={(e) => handleGoalChange('monthly_step_goal', e.target.value)}
            min="30000"
            max="1500000"
            step="5000"
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            Recommended: 150,000 - 300,000 steps per month
          </p>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button onClick={saveGoals} disabled={saving} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Goals'}
          </Button>
          <Button variant="outline" onClick={resetToDefaults} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
        </div>

        {/* Current Goal Summary */}
        <div className="bg-muted/50 rounded-lg p-4 mt-4">
          <h4 className="text-sm font-semibold mb-2">Current Goals Summary</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="text-center">
              <p className="font-medium text-primary">{goals.daily_step_goal.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Daily</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-primary">{goals.weekly_step_goal.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Weekly</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-primary">{goals.monthly_step_goal.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Monthly</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};