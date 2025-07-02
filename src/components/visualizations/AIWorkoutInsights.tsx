import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Sparkles, TrendingUp, AlertCircle, Target, Lightbulb, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { activityTrackingService } from '@/utils/activityTrackingService';

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
      
      // Set up real-time subscriptions for workout insights
      const insightsChannel = supabase
        .channel('workout_insights_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'workout_insights',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            generateInsights(); // Refresh when new insights are generated
          }
        )
        .subscribe();

      // Set up real-time subscriptions for activity patterns
      const patternsChannel = supabase
        .channel('activity_patterns_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'activity_patterns',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            generateInsights(); // Refresh when patterns are updated
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(insightsChannel);
        supabase.removeChannel(patternsChannel);
      };
    }
  }, [user]);

  const generateInsights = async () => {
    try {
      setLoading(true);
      
      // Get real workout insights from database
      const dbInsights = await activityTrackingService.getWorkoutInsights(user?.id!);
      
      // Get activity patterns from database
      const dbPatterns = await activityTrackingService.getActivityPatterns(user?.id!, 'week');
      
      // Transform database insights to component format
      const transformedInsights = dbInsights.map((insight: any) => ({
        id: insight.id,
        type: mapInsightType(insight.insight_type),
        title: insight.title,
        description: insight.description,
        icon: getInsightIcon(insight.insight_type),
        color: getInsightColor(insight.insight_type),
        actionable: insight.actionable,
        priority: insight.priority,
        metrics: insight.metrics ? {
          current: insight.metrics.current || 0,
          target: insight.metrics.target || 100,
          unit: insight.metrics.unit || '%'
        } : undefined
      }));

      // Transform database patterns to component format
      const transformedPatterns = dbPatterns.map((pattern: any) => ({
        name: pattern.pattern_type.charAt(0).toUpperCase() + pattern.pattern_type.slice(1),
        score: pattern.score,
        trend: mapTrendFromDb(pattern.trend)
      }));

      setInsights(transformedInsights);
      setPatterns(transformedPatterns);

    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to map database values to component format
  const mapInsightType = (dbType: string): 'improvement' | 'warning' | 'suggestion' | 'achievement' => {
    switch (dbType) {
      case 'achievement': return 'achievement';
      case 'warning': return 'warning';
      case 'suggestion': return 'suggestion';
      default: return 'improvement';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'achievement': return Sparkles;
      case 'warning': return AlertCircle;
      case 'suggestion': return Lightbulb;
      default: return TrendingUp;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'text-orange-500';
      case 'warning': return 'text-red-500';
      case 'suggestion': return 'text-blue-500';
      default: return 'text-green-500';
    }
  };

  const mapTrendFromDb = (dbTrend: string): 'up' | 'down' | 'stable' => {
    switch (dbTrend) {
      case 'improving': return 'up';
      case 'declining': return 'down';
      case 'overtraining_risk': return 'down';
      case 'needs_attention': return 'down';
      default: return 'stable';
    }
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