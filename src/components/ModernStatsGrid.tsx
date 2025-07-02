
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Calendar, TrendingUp, Share2 } from 'lucide-react';

interface StatsGridProps {
  todaySteps: number;
  weeklySteps: number;
  monthlySteps: number;
  achievementCount: number;
  onShareSteps: () => void;
}

export const ModernStatsGrid = ({ 
  todaySteps, 
  weeklySteps, 
  monthlySteps, 
  achievementCount,
  onShareSteps 
}: StatsGridProps) => {
  const dailyGoal = 10000;
  const dailyProgress = Math.min((todaySteps / dailyGoal) * 100, 100);
  
  return (
    <div className="grid grid-cols-2 gap-4 md:gap-6">
      {/* Today's Steps - Main focus */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-200/50 backdrop-blur-sm hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="p-2 md:p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
              <Target className="h-4 w-4 md:h-6 md:w-6 text-white" />
            </div>
            <Button
              onClick={onShareSteps}
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:bg-blue-100/50 h-8 w-8 p-0"
            >
              <Share2 className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
          <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 md:mb-2">
            {todaySteps.toLocaleString()}
          </div>
          <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3">Today's Steps</p>
          <Progress 
            value={dailyProgress} 
            className="h-1.5 md:h-2 mb-1 md:mb-2 bg-gray-200"
          />
          <p className="text-xs text-gray-500">Goal: {dailyGoal.toLocaleString()}</p>
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200/50 backdrop-blur-sm hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
        <CardContent className="p-4 md:p-6">
          <div className="p-2 md:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full w-fit mb-3 md:mb-4">
            <Calendar className="h-4 w-4 md:h-6 md:w-6 text-white" />
          </div>
          <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1 md:mb-2">
            {weeklySteps.toLocaleString()}
          </div>
          <p className="text-xs md:text-sm text-gray-600 mb-1">This Week</p>
          <p className="text-xs text-gray-500">
            Avg: {Math.round(weeklySteps / 7).toLocaleString()}/day
          </p>
        </CardContent>
      </Card>

      {/* Monthly Progress */}
      <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200/50 backdrop-blur-sm hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
        <CardContent className="p-4 md:p-6">
          <div className="p-2 md:p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-full w-fit mb-3 md:mb-4">
            <TrendingUp className="h-4 w-4 md:h-6 md:w-6 text-white" />
          </div>
          <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1 md:mb-2">
            {monthlySteps.toLocaleString()}
          </div>
          <p className="text-xs md:text-sm text-gray-600 mb-1">This Month</p>
          <p className="text-xs text-gray-500">Keep it up! 🔥</p>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-200/50 backdrop-blur-sm hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
        <CardContent className="p-4 md:p-6">
          <div className="p-2 md:p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full w-fit mb-3 md:mb-4">
            <Trophy className="h-4 w-4 md:h-6 md:w-6 text-white" />
          </div>
          <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent mb-1 md:mb-2">
            {achievementCount}
          </div>
          <p className="text-xs md:text-sm text-gray-600 mb-1">Achievements</p>
          <p className="text-xs text-gray-500">Unlock more! 🏆</p>
        </CardContent>
      </Card>
    </div>
  );
};
