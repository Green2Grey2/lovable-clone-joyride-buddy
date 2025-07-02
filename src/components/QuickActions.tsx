
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trophy, Users, Target, Calendar } from 'lucide-react';
import { AchievementBadge } from './AchievementBadge';
import { TeamChallenge } from './TeamChallenge';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: 'Trophy' | 'Target' | 'Calendar' | 'Users';
  earned: boolean;
  earnedDate?: string;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  targetSteps: number;
  currentSteps: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'upcoming';
}

interface QuickActionsProps {
  achievements: Achievement[];
  challenges: Challenge[];
}

export const QuickActions = ({ achievements, challenges }: QuickActionsProps) => {
  const recentAchievements = achievements.filter(a => a.earned).slice(0, 3);
  const activeChallenges = challenges.filter(c => c.status === 'active').slice(0, 2);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Quick Achievements Preview */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
              <Trophy className="h-5 w-5 text-purple-600" />
              Recent Achievements
            </CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-purple-600 hover:bg-purple-100/50">
                  View All
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    All Achievements
                  </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {achievements.map((achievement) => (
                    <AchievementBadge key={achievement.id} achievement={achievement} />
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAchievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-white/30">
                <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full">
                  <Trophy className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-800">{achievement.name}</p>
                  <p className="text-xs text-gray-600">{achievement.earnedDate}</p>
                </div>
              </div>
            ))}
            {recentAchievements.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No achievements yet. Keep walking! 🚶‍♂️</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Challenges Preview */}
      <Card className="bg-gradient-to-br from-green-500/10 to-teal-500/10 border-green-200/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Active Challenges
            </CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-100/50">
                  View All
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                    Team Challenges
                  </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {challenges.map((challenge) => (
                    <TeamChallenge key={challenge.id} challenge={challenge} />
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeChallenges.map((challenge) => (
              <div key={challenge.id} className="p-4 bg-white/50 rounded-lg border border-white/30">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm text-gray-800">{challenge.name}</h4>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((challenge.currentSteps / challenge.targetSteps) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{challenge.currentSteps.toLocaleString()} steps</span>
                  <span>{challenge.targetSteps.toLocaleString()} goal</span>
                </div>
              </div>
            ))}
            {activeChallenges.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No active challenges. Join one! 🎯</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
