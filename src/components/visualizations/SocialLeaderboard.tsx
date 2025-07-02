import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Award, TrendingUp, Users, Crown, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  score: number;
  metric: string;
  rank: number;
  change: number;
  isCurrentUser: boolean;
  department?: string;
  streak?: number;
}

export const SocialLeaderboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'steps' | 'calories' | 'duration' | 'streak'>('steps');
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('week');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number>(0);

  useEffect(() => {
    if (user) {
      loadLeaderboard();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('leaderboard-updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'activities'
        }, () => {
          loadLeaderboard();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, activeTab, timeframe]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      
      // Get date range based on timeframe
      const now = new Date();
      let days = 7;
      
      if (timeframe === 'today') {
        days = 1;
      } else if (timeframe === 'week') {
        days = 7;
      } else {
        days = 30;
      }

      // Get aggregated data for all users using the social feed function
      const { data: socialFeed } = await supabase.rpc('get_social_feed', {
        p_limit: 100
      });

      // Get user profiles and stats
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name, avatar_url, department');

      const { data: stats } = await supabase
        .from('user_stats')
        .select('user_id, current_streak, today_steps, weekly_steps, monthly_steps, calories_burned');

      if (!profiles || !stats) return;

      // Create leaderboard entries from user stats
      const entries: LeaderboardEntry[] = stats
        .map(userStat => {
          const profile = profiles.find(p => p.user_id === userStat.user_id);
          
          let score = 0;
          switch (activeTab) {
            case 'steps':
              score = timeframe === 'today' ? (userStat.today_steps || 0) :
                     timeframe === 'week' ? (userStat.weekly_steps || 0) :
                     (userStat.monthly_steps || 0);
              break;
            case 'calories':
              score = userStat.calories_burned || 0;
              break;
            case 'duration':
              // Approximate duration from steps (rough calculation)
              score = Math.round((userStat.today_steps || 0) / 100) * (timeframe === 'today' ? 1 : timeframe === 'week' ? 7 : 30);
              break;
            case 'streak':
              score = userStat.current_streak || 0;
              break;
          }
          
          return {
            id: userStat.user_id,
            user_id: userStat.user_id,
            username: profile?.name || 'Anonymous',
            avatar_url: profile?.avatar_url,
            score,
            metric: activeTab,
            rank: 0,
            change: Math.floor(Math.random() * 5) - 2, // Simulated rank change
            isCurrentUser: userStat.user_id === user?.id,
            department: profile?.department,
            streak: userStat.current_streak
          };
        })
        .filter(entry => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }));

      setLeaderboard(entries);
      
      const currentUserEntry = entries.find(e => e.isCurrentUser);
      if (currentUserEntry) {
        setUserRank(currentUserEntry.rank);
      } else {
        setUserRank(0);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-orange-600" />;
      default: return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50';
      case 2: return 'from-gray-400/20 to-gray-500/20 border-gray-400/50';
      case 3: return 'from-orange-500/20 to-orange-600/20 border-orange-500/50';
      default: return 'from-muted/20 to-muted/10';
    }
  };

  const formatScore = (score: number, metric: string): string => {
    switch (metric) {
      case 'steps':
        return score.toLocaleString();
      case 'calories':
        return `${score.toLocaleString()} cal`;
      case 'duration':
        return `${Math.floor(score / 60)}h ${score % 60}m`;
      case 'streak':
        return `${score} days`;
      default:
        return score.toString();
    }
  };

  return (
    <Card className="card-modern glass dark:glass-dark overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Social Leaderboard
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Compete with your community
            </p>
          </div>
          <div className="flex gap-2">
            {(['today', 'week', 'month'] as const).map(t => (
              <Button
                key={t}
                size="sm"
                variant={timeframe === t ? 'default' : 'outline'}
                onClick={() => setTimeframe(t)}
                className="capitalize"
              >
                {t}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Metric Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="steps">Steps</TabsTrigger>
            <TabsTrigger value="calories">Calories</TabsTrigger>
            <TabsTrigger value="duration">Duration</TabsTrigger>
            <TabsTrigger value="streak">Streak</TabsTrigger>
          </TabsList>

          {/* User Rank Card */}
          {userRank > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {getRankIcon(userRank)}
                    {userRank <= 3 && (
                      <div className="absolute -inset-2 bg-primary/20 rounded-full animate-pulse" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">Your Rank</p>
                    <p className="text-sm text-muted-foreground">
                      Top {Math.round((userRank / leaderboard.length) * 100)}% of users
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="font-bold text-lg">#{userRank}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Leaderboard List */}
          <TabsContent value={activeTab} className="space-y-2">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-16 bg-muted/20 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {leaderboard.slice(0, 10).map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "relative p-3 rounded-xl border transition-all duration-300",
                      "hover:scale-[1.02] cursor-pointer",
                      entry.isCurrentUser && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                      `bg-gradient-to-r ${getRankColor(entry.rank)}`
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank */}
                      <div className="w-8 flex justify-center">
                        {getRankIcon(entry.rank)}
                      </div>

                      {/* User Info */}
                      <Avatar className="h-10 w-10 border-2 border-background">
                        <AvatarImage src={entry.avatar_url} />
                        <AvatarFallback>
                          {entry.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <p className="font-semibold text-sm flex items-center gap-2">
                          {entry.username}
                          {entry.isCurrentUser && (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </p>
                        {entry.department && (
                          <p className="text-xs text-muted-foreground">{entry.department}</p>
                        )}
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <p className="font-bold text-sm">
                          {formatScore(entry.score, entry.metric)}
                        </p>
                        {entry.change !== 0 && (
                          <p className={cn(
                            "text-xs flex items-center gap-1 justify-end",
                            entry.change > 0 ? "text-green-500" : "text-red-500"
                          )}>
                            <TrendingUp className={cn(
                              "h-3 w-3",
                              entry.change < 0 && "rotate-180"
                            )} />
                            {Math.abs(entry.change)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Live indicator for recent activity */}
                    {index === 0 && (
                      <div className="absolute top-2 right-2">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-xs text-green-500">Live</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </TabsContent>
        </Tabs>

        {/* Challenge Button */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Weekly Challenge</p>
              <p className="text-xs text-muted-foreground">Join 47 others competing</p>
            </div>
            <Button size="sm" className="gradient-health text-primary-foreground">
              <Users className="h-4 w-4 mr-1" />
              Join
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};