
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Calendar, Target, Zap, Crown, Medal, Award, Timer, TrendingUp } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'weekend' | 'tournament' | 'team_vs_team' | 'relay';
  status: 'upcoming' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  participants: number;
  maxParticipants?: number;
  currentProgress: number;
  targetValue: number;
  metric: 'steps' | 'active_minutes' | 'workouts' | 'distance';
  rewards: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  isUserParticipating: boolean;
  leaderboard?: Array<{
    rank: number;
    name: string;
    department: string;
    value: number;
  }>;
}

export const EnhancedTeamChallenges = () => {
  const { userProfile } = useApp();
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchChallenges();
    }
  }, [user]);

  const fetchChallenges = async () => {
    if (!user) return;
    
    try {
      const { data: challengesData, error } = await supabase
        .from('challenges')
        .select(`
          *,
          challenge_participants(user_id)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedChallenges: Challenge[] = challengesData?.map(challenge => ({
        id: challenge.id,
        name: challenge.title,
        description: challenge.description || '',
        type: 'weekly', // Default type
        status: new Date(challenge.end_date) > new Date() ? 'active' : 'completed',
        startDate: new Date(challenge.start_date).toLocaleDateString(),
        endDate: new Date(challenge.end_date).toLocaleDateString(),
        participants: challenge.challenge_participants?.length || 0,
        maxParticipants: undefined,
        currentProgress: 0, // TODO: Calculate from user activities
        targetValue: challenge.target_value || 0,
        metric: challenge.type === 'steps' ? 'steps' : 'active_minutes',
        rewards: ['Challenge Badge', '100 Fitness Points'],
        difficulty: 'medium',
        isUserParticipating: challenge.challenge_participants?.some(p => p.user_id === user.id) || false,
      })) || [];

      setChallenges(processedChallenges);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('challenge_participants')
        .insert([{
          challenge_id: challengeId,
          user_id: user.id
        }]);

      if (error) throw error;

      setChallenges(challenges.map(challenge => {
        if (challenge.id === challengeId) {
          return {
            ...challenge,
            isUserParticipating: true,
            participants: challenge.participants + 1
          };
        }
        return challenge;
      }));

      toast.success('Successfully joined challenge!');
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast.error('Failed to join challenge');
    }
  };

  const leaveChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('challenge_participants')
        .delete()
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id);

      if (error) throw error;

      setChallenges(challenges.map(challenge => {
        if (challenge.id === challengeId) {
          return {
            ...challenge,
            isUserParticipating: false,
            participants: Math.max(0, challenge.participants - 1)
          };
        }
        return challenge;
      }));

      toast.success('Successfully left challenge');
    } catch (error) {
      console.error('Error leaving challenge:', error);
      toast.error('Failed to leave challenge');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Team Challenges
          </h2>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading challenges...</p>
        </div>
      </div>
    );
  }

  // Keep the mock data structure but replace with real data
  const mockChallenges = [
    {
      id: '1',
      name: 'Weekend Warriors Blitz',
      description: 'Get 20,000 steps each day this weekend. Saturday & Sunday only!',
      type: 'weekend',
      status: 'active',
      startDate: '2025-01-04',
      endDate: '2025-01-05',
      participants: 45,
      maxParticipants: 100,
      currentProgress: 15800,
      targetValue: 20000,
      metric: 'steps',
      rewards: ['Weekend Warrior Badge', 'Limited Edition Weekend Trophy', '200 Fitness Points'],
      difficulty: 'medium',
      isUserParticipating: true,
      leaderboard: [
        { rank: 1, name: 'Alex Chen', department: 'Engineering', value: 19500 },
        { rank: 2, name: 'Sarah Johnson', department: 'Engineering', value: 18200 },
        { rank: 3, name: 'Mike Rivera', department: 'Marketing', value: 17800 }
      ]
    },
    {
      id: '2',
      name: 'Step Championship Tournament',
      description: 'Quarterly step tournament - climb the brackets to become champion!',
      type: 'tournament',
      status: 'active',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      participants: 128,
      maxParticipants: 128,
      currentProgress: 45000,
      targetValue: 100000,
      metric: 'steps',
      rewards: ['Champion Crown', 'Tournament Trophy', '1000 Fitness Points', 'Special Title'],
      difficulty: 'extreme',
      isUserParticipating: false,
      leaderboard: [
        { rank: 1, name: 'Emma Davis', department: 'Design', value: 85000 },
        { rank: 2, name: 'Tom Wilson', department: 'Sales', value: 82500 },
        { rank: 3, name: 'Lisa Wang', department: 'Engineering', value: 78900 }
      ]
    },
    {
      id: '3',
      name: 'Engineering vs Marketing Showdown',
      description: 'Department battle! Which team can log more active minutes this week?',
      type: 'team_vs_team',
      status: 'active',
      startDate: '2025-01-01',
      endDate: '2025-01-07',
      participants: 24,
      currentProgress: 1200,
      targetValue: 2000,
      metric: 'active_minutes',
      rewards: ['Team Victory Badge', 'Department Trophy', '300 Fitness Points'],
      difficulty: 'hard',
      isUserParticipating: true
    },
    {
      id: '4',
      name: 'Daily Sprint Challenge',
      description: 'Hit 12,000 steps today! Simple but effective.',
      type: 'daily',
      status: 'active',
      startDate: '2025-01-02',
      endDate: '2025-01-02',
      participants: 67,
      currentProgress: 8450,
      targetValue: 12000,
      metric: 'steps',
      rewards: ['Daily Achiever Badge', '50 Fitness Points'],
      difficulty: 'easy',
      isUserParticipating: true
    },
    {
      id: '5',
      name: 'New Year Resolution Relay',
      description: 'Team relay - pass the baton by completing your daily goal!',
      type: 'relay',
      status: 'upcoming',
      startDate: '2025-01-06',
      endDate: '2025-01-12',
      participants: 0,
      maxParticipants: 40,
      currentProgress: 0,
      targetValue: 10000,
      metric: 'steps',
      rewards: ['Relay Champion Badge', 'Team Spirit Trophy', '400 Fitness Points'],
      difficulty: 'medium',
      isUserParticipating: false
    }
  ] as Challenge[];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200';
      case 'medium': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200';
      case 'hard': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200';
      case 'extreme': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tournament': return <Crown className="h-4 w-4" />;
      case 'weekend': return <Calendar className="h-4 w-4" />;
      case 'team_vs_team': return <Users className="h-4 w-4" />;
      case 'relay': return <Zap className="h-4 w-4" />;
      case 'daily': return <Timer className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 dark:bg-green-600';
      case 'upcoming': return 'bg-blue-500 dark:bg-blue-600';
      case 'completed': return 'bg-muted-foreground';
      default: return 'bg-muted-foreground';
    }
  };

  // Use real challenges if available, otherwise fall back to mock data
  const displayChallenges = challenges.length > 0 ? challenges : mockChallenges;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          Team Challenges
        </h2>
        <Badge className="bg-primary text-primary-foreground">
          {displayChallenges.filter(c => c.isUserParticipating).length} Active
        </Badge>
      </div>

      <div className="grid gap-6">
        {displayChallenges.map((challenge) => (
          <Card key={challenge.id} className="bg-card border-0 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center text-primary-foreground`}>
                    {getTypeIcon(challenge.type)}
                  </div>
                  <div>
                    <CardTitle className="text-foreground mb-1 flex items-center gap-2">
                      {challenge.name}
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(challenge.status)}`}></div>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {challenge.type.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Progress Section */}
              {challenge.status === 'active' && challenge.isUserParticipating && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Your Progress</span>
                    <span className="text-sm font-bold text-primary">
                      {challenge.currentProgress.toLocaleString()} / {challenge.targetValue.toLocaleString()} {challenge.metric}
                    </span>
                  </div>
                  <Progress 
                    value={(challenge.currentProgress / challenge.targetValue) * 100} 
                    className="h-3"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {Math.round((challenge.currentProgress / challenge.targetValue) * 100)}% complete
                  </p>
                </div>
              )}

              {/* Challenge Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Participants:</span>
                    <span className="font-semibold text-foreground">
                      {challenge.participants}{challenge.maxParticipants ? `/${challenge.maxParticipants}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Target:</span>
                    <span className="font-semibold text-foreground">
                      {challenge.targetValue.toLocaleString()} {challenge.metric}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-semibold text-foreground">
                      {challenge.startDate} - {challenge.endDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="outline" className="text-xs">
                      {challenge.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Rewards */}
              <div>
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Rewards
                </h4>
                <div className="flex flex-wrap gap-2">
                  {challenge.rewards.map((reward, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {reward}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Leaderboard for active challenges */}
              {challenge.leaderboard && challenge.status === 'active' && (
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Top Performers
                  </h4>
                  <div className="space-y-2">
                    {challenge.leaderboard.slice(0, 3).map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            entry.rank === 1 ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200' :
                            entry.rank === 2 ? 'bg-secondary text-secondary-foreground' :
                            'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200'
                          }`}>
                            {entry.rank}
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{entry.name}</p>
                            <p className="text-xs text-muted-foreground">{entry.department}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-[#1D244D] text-sm">
                          {entry.value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                {challenge.status === 'upcoming' && !challenge.isUserParticipating && (
                  <Button 
                    className="flex-1" 
                    onClick={() => joinChallenge(challenge.id)}
                    disabled={challenge.maxParticipants ? challenge.participants >= challenge.maxParticipants : false}
                  >
                    Join Challenge
                  </Button>
                )}
                {challenge.status === 'active' && !challenge.isUserParticipating && (
                  <Button 
                    className="flex-1" 
                    onClick={() => joinChallenge(challenge.id)}
                    disabled={challenge.maxParticipants ? challenge.participants >= challenge.maxParticipants : false}
                  >
                    Join Now
                  </Button>
                )}
                {challenge.isUserParticipating && challenge.status !== 'completed' && (
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => leaveChallenge(challenge.id)}
                  >
                    Leave Challenge
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
