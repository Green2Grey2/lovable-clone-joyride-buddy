import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export const SimpleStepTracker = () => {
  const { user } = useAuth();
  const [todaySteps, setTodaySteps] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load today's steps on component mount
  useEffect(() => {
    if (user) {
      loadTodaySteps();
    }
  }, [user]);

  const loadTodaySteps = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_steps')
        .select('steps')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading steps:', error);
        return;
      }

      setTodaySteps(data?.steps || 0);
    } catch (error) {
      console.error('Error loading today steps:', error);
    }
  };

  const addSteps = async (stepsToAdd: number) => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const newTotal = todaySteps + stepsToAdd;

      const { error } = await supabase
        .from('daily_steps')
        .upsert({
          user_id: user.id,
          date: today,
          steps: newTotal
        });

      if (error) {
        console.error('Error adding steps:', error);
        toast.error('Failed to add steps');
        return;
      }

      setTodaySteps(newTotal);
      toast.success(`Added ${stepsToAdd.toLocaleString()} steps! Total: ${newTotal.toLocaleString()}`);
    } catch (error) {
      console.error('Error adding steps:', error);
      toast.error('Failed to add steps');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please sign in to track your steps</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold mb-2">Today's Steps</h3>
          <div className="text-3xl font-bold text-primary">
            {todaySteps.toLocaleString()}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center mb-4">
            Quick add steps:
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            {[1000, 2500, 5000, 10000].map((steps) => (
              <Button
                key={steps}
                variant="outline"
                size="lg"
                onClick={() => addSteps(steps)}
                disabled={isLoading}
                className="h-12 text-base font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                {steps.toLocaleString()}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};