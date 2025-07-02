
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Award, Target } from 'lucide-react';

interface StreakCelebrationProps {
  currentStreak: number;
  longestStreak: number;
  weeklyGoalHits: number;
}

export const StreakCelebration = ({ currentStreak, longestStreak, weeklyGoalHits }: StreakCelebrationProps) => {
  const getStreakMessage = () => {
    if (currentStreak >= 30) {
      return {
        title: "Legendary Streak! 🏆",
        message: "You're absolutely crushing it!",
        color: "from-yellow-400 to-orange-500",
        textColor: "text-yellow-700"
      };
    } else if (currentStreak >= 14) {
      return {
        title: "Two Week Champion! 🔥",
        message: "Your consistency is inspiring!",
        color: "from-orange-400 to-red-500",
        textColor: "text-orange-700"
      };
    } else if (currentStreak >= 7) {
      return {
        title: "Week Long Warrior! ⚡",
        message: "You're building amazing habits!",
        color: "from-purple-400 to-pink-500",
        textColor: "text-purple-700"
      };
    } else if (currentStreak >= 3) {
      return {
        title: "Great Momentum! 💪",
        message: "Keep the streak alive!",
        color: "from-blue-400 to-indigo-500",
        textColor: "text-blue-700"
      };
    } else if (currentStreak >= 1) {
      return {
        title: "Getting Started! ✨",
        message: "Every journey begins with a single step!",
        color: "from-green-400 to-teal-500",
        textColor: "text-green-700"
      };
    }
    
    return {
      title: "Ready to Start? 🚀",
      message: "Your fitness journey awaits!",
      color: "from-gray-400 to-gray-500",
      textColor: "text-gray-700"
    };
  };

  const streakData = getStreakMessage();

  return (
    <Card className="bg-white border-0 rounded-3xl shadow-[0px_15px_40px_rgba(115,92,247,0.12)] overflow-hidden">
      <CardContent className="p-0">
        <div className={`bg-gradient-to-r ${streakData.color} p-6 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">{streakData.title}</h3>
            <p className="text-white/90 text-sm">{streakData.message}</p>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#1D244D]">{currentStreak}</p>
              <p className="text-xs text-[#8A94A6]">Current</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Award className="h-6 w-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#1D244D]">{longestStreak}</p>
              <p className="text-xs text-[#8A94A6]">Best Ever</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Target className="h-6 w-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#1D244D]">{weeklyGoalHits}</p>
              <p className="text-xs text-[#8A94A6]">Goals Hit</p>
            </div>
          </div>
          
          {currentStreak > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8A94A6]">Next milestone</span>
                <Badge variant="outline" className={`${streakData.textColor} border-current`}>
                  {currentStreak < 7 ? `${7 - currentStreak} days to week` :
                   currentStreak < 14 ? `${14 - currentStreak} days to 2 weeks` :
                   currentStreak < 30 ? `${30 - currentStreak} days to month` :
                   'Legendary status! 🎉'}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
