
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trophy, Users, Target, MapPin, TrendingUp } from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { ActiveChallengeView } from './ActiveChallengeView';
import { useApp } from '@/contexts/AppContext';
import { useUserStats } from '@/contexts/UserStatsContext';

export const ActiveChallengeWidget = () => {
  const { playSelect } = useSoundEffects();
  const { userProfile } = useApp();
  const { stats: userStats } = useUserStats();
  
  const userDepartment = userProfile.department;
  const userSteps = userStats?.today_steps || 0;

  const handleOpenChallenge = () => {
    playSelect();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 hover:scale-105">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full">
                  <Trophy className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-800 text-sm">Walking Challenge LIVE!</h3>
                  <p className="text-xs text-purple-600">{userDepartment} • Your steps: {userSteps.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs bg-white/50 px-2 py-1 rounded-lg">
                  <span className="text-purple-700 font-semibold">View Stats →</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-600" />
            Department Walking Challenge - LIVE
          </DialogTitle>
        </DialogHeader>
        
        <ActiveChallengeView userDepartment={userDepartment} />
      </DialogContent>
    </Dialog>
  );
};
