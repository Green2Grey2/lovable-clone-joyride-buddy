
import { useState } from 'react';
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
  
  const [challenges, setChallenges] = useState<Challenge[]>([
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
  ]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'hard': return 'bg-orange-100 text-orange-800';
      case 'extreme': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      case 'active': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const joinChallenge = (challengeId: string) => {
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
  };

  const leaveChallenge = (challengeId: string) => {
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
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#1D244D] flex items-center gap-2">
          <Trophy className="h-6 w-6 text-[#735CF7]" />
          Team Challenges
        </h2>
        <Badge className="bg-[#735CF7] text-white">
          {challenges.filter(c => c.isUserParticipating).length} Active
        </Badge>
      </div>

      <div className="grid gap-6">
        {challenges.map((challenge) => (
          <Card key={challenge.id} className="bg-white border-0 rounded-3xl shadow-[0px_10px_30px_rgba(115,92,247,0.1)] hover:shadow-[0px_15px_35px_rgba(115,92,247,0.15)] transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-br from-[#735CF7] to-[#00A3FF] rounded-2xl flex items-center justify-center text-white`}>
                    {getTypeIcon(challenge.type)}
                  </div>
                  <div>
                    <CardTitle className="text-[#1D244D] mb-1 flex items-center gap-2">
                      {challenge.name}
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(challenge.status)}`}></div>
                    </CardTitle>
                    <p className="text-sm text-[#8A94A6]">{challenge.description}</p>
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
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#1D244D]">Your Progress</span>
                    <span className="text-sm font-bold text-[#735CF7]">
                      {challenge.currentProgress.toLocaleString()} / {challenge.targetValue.toLocaleString()} {challenge.metric}
                    </span>
                  </div>
                  <Progress 
                    value={(challenge.currentProgress / challenge.targetValue) * 100} 
                    className="h-3"
                  />
                  <p className="text-xs text-[#8A94A6] mt-2">
                    {Math.round((challenge.currentProgress / challenge.targetValue) * 100)}% complete
                  </p>
                </div>
              )}

              {/* Challenge Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#8A94A6]" />
                    <span className="text-[#8A94A6]">Participants:</span>
                    <span className="font-semibold text-[#1D244D]">
                      {challenge.participants}{challenge.maxParticipants ? `/${challenge.maxParticipants}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-[#8A94A6]" />
                    <span className="text-[#8A94A6]">Target:</span>
                    <span className="font-semibold text-[#1D244D]">
                      {challenge.targetValue.toLocaleString()} {challenge.metric}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#8A94A6]" />
                    <span className="text-[#8A94A6]">Duration:</span>
                    <span className="font-semibold text-[#1D244D]">
                      {challenge.startDate} - {challenge.endDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-[#8A94A6]" />
                    <span className="text-[#8A94A6]">Status:</span>
                    <Badge variant="outline" className="text-xs">
                      {challenge.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Rewards */}
              <div>
                <h4 className="font-semibold text-[#1D244D] mb-2 flex items-center gap-2">
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
                  <h4 className="font-semibold text-[#1D244D] mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Top Performers
                  </h4>
                  <div className="space-y-2">
                    {challenge.leaderboard.slice(0, 3).map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            entry.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                            entry.rank === 2 ? 'bg-gray-100 text-gray-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {entry.rank}
                          </div>
                          <div>
                            <p className="font-medium text-[#1D244D] text-sm">{entry.name}</p>
                            <p className="text-xs text-[#8A94A6]">{entry.department}</p>
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
