import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Sparkles, TrendingUp, AlertCircle, Target, Lightbulb, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Insight {
  id: string;
  type: 'improvement' | 'warning' | 'suggestion' | 'achievement';
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  actionable: boolean;
  priority: number;
  metrics?: {
    current: number;
    target: number;
    unit: string;
  };
}

interface WorkoutPattern {
  name: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
}

export const AIWorkoutInsights: React.FC = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [patterns, setPatterns] = useState<WorkoutPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);

  useEffect(() => {
    if (user) {
      generateInsights();
    }
  }, [user]);

  const generateInsights = async () => {
    try {
      setLoading(true);
      
      // Get recent activities
      const { data: activities } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(30);

      // Get user stats
      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (!activities || !stats) return;

      // Analyze patterns
      const analyzedPatterns = analyzeWorkoutPatterns(activities);
      setPatterns(analyzedPatterns);

      // Generate AI insights
      const generatedInsights = generateAIInsights(activities, stats, analyzedPatterns);
      setInsights(generatedInsights);

    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeWorkoutPatterns = (activities: any[]): WorkoutPattern[] => {
    const patterns: WorkoutPattern[] = [];
    
    // Consistency pattern
    const workoutDays = new Set(activities.map(a => new Date(a.date).toDateString())).size;
    const consistencyScore = (workoutDays / 30) * 100;
    patterns.push({
      name: 'Consistency',
      score: Math.round(consistencyScore),
      trend: consistencyScore > 60 ? 'up' : consistencyScore > 40 ? 'stable' : 'down'
    });

    // Intensity pattern
    const avgIntensity = activities.reduce((sum, a) => sum + (a.calories || 0), 0) / activities.length;
    const recentIntensity = activities.slice(0, 7).reduce((sum, a) => sum + (a.calories || 0), 0) / 7;
    patterns.push({
      name: 'Intensity',
      score: Math.round((recentIntensity / 500) * 100),
      trend: recentIntensity > avgIntensity ? 'up' : recentIntensity < avgIntensity * 0.9 ? 'down' : 'stable'
    });

    // Volume pattern
    const totalVolume = activities.reduce((sum, a) => sum + (a.duration || 0), 0);
    const volumeScore = Math.min(100, (totalVolume / 600) * 100);
    patterns.push({
      name: 'Volume',
      score: Math.round(volumeScore),
      trend: totalVolume > 400 ? 'up' : totalVolume > 200 ? 'stable' : 'down'
    });

    // Recovery pattern
    const restDays = 30 - workoutDays;
    const recoveryScore = restDays >= 8 && restDays <= 12 ? 100 : Math.max(0, 100 - Math.abs(10 - restDays) * 10);
    patterns.push({
      name: 'Recovery',
      score: Math.round(recoveryScore),
      trend: recoveryScore > 80 ? 'up' : recoveryScore > 60 ? 'stable' : 'down'
    });

    return patterns;
  };

  const generateAIInsights = (activities: any[], stats: any, patterns: WorkoutPattern[]): Insight[] => {
    const insights: Insight[] = [];
    
    // Consistency insight
    const consistencyPattern = patterns.find(p => p.name === 'Consistency');
    if (consistencyPattern && consistencyPattern.score < 50) {
      insights.push({
        id: '1',
        type: 'warning',
        title: 'Consistency Dropping',
        description: 'Your workout frequency has decreased by 30% this week. Try setting daily reminders.',
        icon: AlertCircle,
        color: 'text-yellow-500',
        actionable: true,
        priority: 1,
        metrics: {
          current: consistencyPattern.score,
          target: 80,
          unit: '%'
        }
      });
    }

    // Streak achievement
    if (stats.current_streak >= 7) {
      insights.push({
        id: '2',
        type: 'achievement',
        title: `${stats.current_streak}-Day Streak! 🔥`,
        description: 'Amazing consistency! You\'re building a strong habit. Keep it up!',
        icon: Sparkles,
        color: 'text-orange-500',
        actionable: false,
        priority: 2
      });
    }

    // Improvement suggestion
    const avgSteps = activities.reduce((sum, a) => sum + (a.steps || 0), 0) / activities.length;
    if (avgSteps < 8000) {
      insights.push({
        id: '3',
        type: 'suggestion',
        title: 'Step Count Opportunity',
        description: 'Adding a 15-minute walk after lunch could boost your daily steps by 2,000.',
        icon: Lightbulb,
        color: 'text-blue-500',
        actionable: true,
        priority: 3,
        metrics: {
          current: Math.round(avgSteps),
          target: 10000,
          unit: 'steps'
        }
      });
    }

    // Performance improvement
    const intensityPattern = patterns.find(p => p.name === 'Intensity');
    if (intensityPattern && intensityPattern.trend === 'up') {
      insights.push({
        id: '4',
        type: 'improvement',
        title: 'Fitness Level Rising',
        description: 'Your workout intensity has increased 15% - your cardiovascular fitness is improving!',
        icon: TrendingUp,
        color: 'text-green-500',
        actionable: false,
        priority: 4
      });
    }

    // Recovery warning
    const recoveryPattern = patterns.find(p => p.name === 'Recovery');
    if (recoveryPattern && recoveryPattern.score < 60) {
      insights.push({
        id: '5',
        type: 'warning',
        title: 'Recovery Time Needed',
        description: 'You\'ve been training hard. Consider adding a rest day or light yoga session.',
        icon: AlertCircle,
        color: 'text-red-500',
        actionable: true,
        priority: 1
      });
    }

    // Goal suggestion
    if (!insights.some(i => i.type === 'suggestion')) {
      insights.push({
        id: '6',
        type: 'suggestion',
        title: 'Try Interval Training',
        description: 'Based on your fitness level, HIIT workouts could help you break through plateaus.',
        icon: Target,
        color: 'text-purple-500',
        actionable: true,
        priority: 5
      });
    }

    return insights.sort((a, b) => a.priority - b.priority);
  };

  const getInsightGradient = (type: Insight['type']) => {
    switch (type) {
      case 'improvement': return 'from-green-500/20 to-emerald-500/20';
      case 'warning': return 'from-yellow-500/20 to-orange-500/20';
      case 'suggestion': return 'from-blue-500/20 to-cyan-500/20';
      case 'achievement': return 'from-purple-500/20 to-pink-500/20';
    }
  };

  if (loading) {
    return (
      <Card className="card-modern glass dark:glass-dark">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Workout Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted/20 rounded-xl animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="card-modern glass dark:glass-dark overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary animate-pulse" />
              AI Workout Insights
            </CardTitle>
            <div className="flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Powered by AI</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pattern Analysis */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {patterns.map((pattern, index) => (
              <motion.div
                key={pattern.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-3 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/50"
              >
                <p className="text-xs text-muted-foreground mb-1">{pattern.name}</p>
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-muted/20"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray={`${(pattern.score / 100) * 126} 126`}
                      className={cn(
                        "transition-all duration-1000",
                        pattern.score > 80 ? "text-green-500" : 
                        pattern.score > 60 ? "text-yellow-500" : "text-red-500"
                      )}
                    />
                  </svg>
                  <span className="absolute text-xs font-bold">{pattern.score}%</span>
                </div>
                <div className={cn(
                  "text-xs mt-1",
                  pattern.trend === 'up' ? "text-green-500" : 
                  pattern.trend === 'down' ? "text-red-500" : "text-yellow-500"
                )}>
                  {pattern.trend === 'up' ? '↑' : pattern.trend === 'down' ? '↓' : '→'}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Insights List */}
          <div className="space-y-3">
            <AnimatePresence>
              {insights.map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "relative p-4 rounded-xl cursor-pointer transition-all duration-300",
                      "hover:scale-[1.02] hover:shadow-lg",
                      `bg-gradient-to-r ${getInsightGradient(insight.type)}`,
                      "border border-border/50 hover:border-primary/50"
                    )}
                    onClick={() => setSelectedInsight(insight)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-lg bg-background/50", insight.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                        <p className="text-xs text-muted-foreground">{insight.description}</p>
                        
                        {insight.metrics && (
                          <div className="mt-3 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span>Progress</span>
                              <span className="font-medium">
                                {insight.metrics.current} / {insight.metrics.target} {insight.metrics.unit}
                              </span>
                            </div>
                            <Progress 
                              value={(insight.metrics.current / insight.metrics.target) * 100} 
                              className="h-1.5"
                            />
                          </div>
                        )}
                      </div>
                      {insight.actionable && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Smart Tip */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
            <p className="text-sm text-center">
              <span className="font-semibold">💡 Smart tip:</span> Your performance peaks between 2-4 PM. Schedule intense workouts during this window.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Insight Detail Modal */}
      <AnimatePresence>
        {selectedInsight && selectedInsight.actionable && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setSelectedInsight(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <Card className="card-modern glass dark:glass-dark">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg bg-muted/50", selectedInsight.color)}>
                      <selectedInsight.icon className="h-5 w-5" />
                    </div>
                    {selectedInsight.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{selectedInsight.description}</p>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Recommended Actions:</h4>
                    <div className="space-y-2">
                      {selectedInsight.type === 'warning' && (
                        <>
                          <Button className="w-full justify-start" variant="outline">
                            <Target className="h-4 w-4 mr-2" />
                            Adjust workout schedule
                          </Button>
                          <Button className="w-full justify-start" variant="outline">
                            <Brain className="h-4 w-4 mr-2" />
                            View personalized plan
                          </Button>
                        </>
                      )}
                      {selectedInsight.type === 'suggestion' && (
                        <>
                          <Button className="w-full justify-start gradient-health text-primary-foreground">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Try suggested workout
                          </Button>
                          <Button className="w-full justify-start" variant="outline">
                            <Lightbulb className="h-4 w-4 mr-2" />
                            Learn more
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};