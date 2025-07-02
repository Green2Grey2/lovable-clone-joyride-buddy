import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Users, Trophy, TrendingUp, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CollaborativeGoal {
  id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  department: string;
  start_date: string;
  end_date: string;
  created_by: string;
  participants: number;
  is_active: boolean;
}

export const CollaborativeGoals = () => {
  const { user } = useAuth();
  const { userProfile } = useApp();
  const [goals, setGoals] = useState<CollaborativeGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    target_value: 0,
    unit: "steps",
    duration_days: 7
  });

  useEffect(() => {
    loadGoals();
    subscribeToGoals();
  }, [userProfile?.department]);

  const loadGoals = async () => {
    if (!userProfile?.department) return;

    try {
      const { data, error } = await supabase
        .from('collaborative_goals')
        .select(`
          *,
          goal_participants!inner(count)
        `)
        .eq('department', userProfile.department)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedGoals = await Promise.all((data || []).map(async (goal) => {
        // Get current progress
        const { data: progressData } = await supabase
          .from('goal_progress')
          .select('progress_value')
          .eq('goal_id', goal.id);

        const currentValue = progressData?.reduce((sum, p) => sum + p.progress_value, 0) || 0;

        // Get participant count
        const { count } = await supabase
          .from('goal_participants')
          .select('*', { count: 'exact', head: true })
          .eq('goal_id', goal.id);

        return {
          ...goal,
          current_value: currentValue,
          participants: count || 0
        };
      }));

      setGoals(processedGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
      toast.error('Failed to load collaborative goals');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToGoals = () => {
    if (!userProfile?.department) return;

    const channel = supabase
      .channel('collaborative-goals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goal_progress',
          filter: `department=eq.${userProfile.department}`
        },
        () => {
          loadGoals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleCreateGoal = async () => {
    if (!newGoal.title || !newGoal.target_value) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + newGoal.duration_days);

      const { data, error } = await supabase
        .from('collaborative_goals')
        .insert({
          title: newGoal.title,
          description: newGoal.description,
          target_value: newGoal.target_value,
          unit: newGoal.unit,
          department: userProfile?.department,
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
          created_by: user?.id,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      // Automatically join the goal
      await joinGoal(data.id);

      toast.success("Collaborative goal created!");
      setCreateOpen(false);
      setNewGoal({
        title: "",
        description: "",
        target_value: 0,
        unit: "steps",
        duration_days: 7
      });
      loadGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error("Failed to create goal");
    }
  };

  const joinGoal = async (goalId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('goal_participants')
        .insert({
          goal_id: goalId,
          user_id: user.id
        });

      if (error && error.code !== '23505') { // Ignore duplicate key error
        throw error;
      }

      toast.success("Joined collaborative goal!");
      loadGoals();
    } catch (error) {
      console.error('Error joining goal:', error);
      toast.error("Failed to join goal");
    }
  };

  const getProgressPercentage = (goal: CollaborativeGoal) => {
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Department Goals</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Collaborative Goal</DialogTitle>
              <DialogDescription>
                Set a goal for your entire department to work towards together
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g., 1 Million Steps Challenge"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Describe the goal and how to participate..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target">Target Value</Label>
                  <Input
                    id="target"
                    type="number"
                    value={newGoal.target_value}
                    onChange={(e) => setNewGoal({ ...newGoal, target_value: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 1000000"
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Select
                    value={newGoal.unit}
                    onValueChange={(value) => setNewGoal({ ...newGoal, unit: value })}
                  >
                    <SelectTrigger id="unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="steps">Steps</SelectItem>
                      <SelectItem value="miles">Miles</SelectItem>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="activities">Activities</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="duration">Duration (days)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={newGoal.duration_days}
                  onChange={(e) => setNewGoal({ ...newGoal, duration_days: parseInt(e.target.value) || 7 })}
                  min="1"
                  max="90"
                />
              </div>
              <Button onClick={handleCreateGoal} className="w-full">
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              No active collaborative goals for your department
            </p>
            <Button onClick={() => setCreateOpen(true)} variant="outline">
              Create the first goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        goals.map((goal) => (
          <Card key={goal.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {goal.title}
                  </CardTitle>
                  <CardDescription>{goal.description}</CardDescription>
                </div>
                <Badge variant="secondary">
                  {getDaysRemaining(goal.end_date)} days left
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {goal.current_value.toLocaleString()} / {goal.target_value.toLocaleString()} {goal.unit}
                    </span>
                  </div>
                  <Progress value={getProgressPercentage(goal)} className="h-3" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {goal.participants} participants
                  </div>
                  
                  {getProgressPercentage(goal) >= 100 ? (
                    <Badge className="gap-1">
                      <Trophy className="h-3 w-3" />
                      Goal Achieved!
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {getProgressPercentage(goal).toFixed(0)}%
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};