
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Calendar, Users } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: 'Trophy' | 'Target' | 'Calendar' | 'Users';
  earned: boolean;
  earnedDate?: string;
}

interface AchievementBadgeProps {
  achievement: Achievement;
}

const iconMap = {
  Trophy: Trophy,
  Target: Target,
  Calendar: Calendar,
  Users: Users,
};

export const AchievementBadge = ({ achievement }: AchievementBadgeProps) => {
  const IconComponent = iconMap[achievement.icon];
  
  return (
    <div className={`p-4 rounded-xl border-2 transform transition-all duration-300 hover:scale-105 ${
      achievement.earned 
        ? 'bg-gradient-to-br from-yellow-50/90 to-orange-50/90 border-yellow-300/60 shadow-lg hover:shadow-xl backdrop-blur-sm' 
        : 'bg-gradient-to-br from-gray-50/80 to-gray-100/60 border-gray-200/50 shadow-md backdrop-blur-sm'
    }`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-full ${
          achievement.earned 
            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg' 
            : 'bg-gray-300'
        }`}>
          <IconComponent className={`h-5 w-5 ${
            achievement.earned ? 'text-white' : 'text-gray-500'
          }`} />
        </div>
        <Badge 
          variant={achievement.earned ? 'default' : 'secondary'}
          className={achievement.earned 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md' 
            : 'bg-gray-200 text-gray-600'
          }
        >
          {achievement.earned ? '✓ Earned' : '🔒 Locked'}
        </Badge>
      </div>
      <h3 className="font-bold text-base text-gray-800 mb-2">{achievement.name}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{achievement.description}</p>
      {achievement.earned && achievement.earnedDate && (
        <div className="mt-3 p-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border border-yellow-200/50">
          <p className="text-xs font-semibold text-yellow-700">🎉 Earned: {achievement.earnedDate}</p>
        </div>
      )}
    </div>
  );
};
