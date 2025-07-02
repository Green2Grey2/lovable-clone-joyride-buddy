
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, TrendingUp } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export const DepartmentLeaderboard = () => {
  const { challengeData } = useApp();
  const maxSteps = Math.max(...challengeData.departments.map(dept => dept.totalSteps));

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏃‍♀️';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-800">
          <Trophy className="h-5 w-5" />
          Department Leaderboard
        </CardTitle>
        <p className="text-sm text-emerald-600">Walking Challenge Rankings</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {challengeData.departments.map((dept, index) => (
          <div key={dept.id} className="bg-white rounded-lg p-4 shadow-sm border border-emerald-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${dept.color} flex items-center justify-center text-white font-bold text-sm`}>
                  {dept.rank}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    {dept.name}
                    <span className="text-lg">{getRankEmoji(dept.rank)}</span>
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {dept.participantCount} people
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {dept.averageSteps.toLocaleString()} avg/day
                    </span>
                  </div>
                </div>
              </div>
              <Badge variant={dept.rank <= 3 ? 'default' : 'secondary'} className="font-semibold">
                {dept.totalSteps.toLocaleString()} steps
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Progress</span>
                <span>{((dept.totalSteps / maxSteps) * 100).toFixed(1)}%</span>
              </div>
              <Progress 
                value={(dept.totalSteps / maxSteps) * 100} 
                className="h-2"
              />
            </div>
          </div>
        ))}
        
        <div className="mt-6 p-4 bg-white rounded-lg border border-emerald-200">
          <h4 className="font-semibold text-emerald-800 mb-2">Challenge Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Participants:</span>
              <span className="font-semibold ml-2">{challengeData.totalParticipants}</span>
            </div>
            <div>
              <span className="text-gray-600">Combined Steps:</span>
              <span className="font-semibold ml-2">{challengeData.departments.reduce((sum, dept) => sum + dept.totalSteps, 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
