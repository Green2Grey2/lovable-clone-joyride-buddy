
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, TrendingUp, Target, Crown, Medal, Award } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useApp } from '@/contexts/AppContext';

interface ActiveChallengeViewProps {
  userDepartment: string;
}

export const ActiveChallengeView = ({ userDepartment }: ActiveChallengeViewProps) => {
  const { challengeData } = useApp();
  
  const userDept = challengeData.departments.find(d => d.name === userDepartment);
  const topThree = challengeData.departments.slice(0, 3);
  const maxSteps = Math.max(...challengeData.departments.map(dept => dept.totalSteps));

  // Calculate challenge progress
  const getChallengeSettings = () => {
    const saved = localStorage.getItem('walkingChallengeSettings');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      startDate: '2025-08-01',
      endDate: '2025-08-31',
      isActive: false
    };
  };

  const settings = getChallengeSettings();
  const startDate = new Date(settings.startDate + 'T00:00:00');
  const endDate = new Date(settings.endDate + 'T23:59:59');
  const now = new Date();
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysPassed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, totalDays - daysPassed);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <Trophy className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏃‍♀️';
    }
  };

  return (
    <div className="space-y-6">
      {/* Challenge Progress Header */}
      <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
        <h3 className="text-lg font-semibold text-purple-800 mb-2">Challenge Progress</h3>
        <div className="flex justify-center items-center gap-6 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-700">{daysPassed}</div>
            <div className="text-purple-600">Days Complete</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-700">{daysLeft}</div>
            <div className="text-purple-600">Days Left</div>
          </div>
        </div>
        <Progress 
          value={(daysPassed / totalDays) * 100} 
          className="mt-4 h-2"
        />
      </div>

      {/* Podium - Top 3 Departments */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Trophy className="h-5 w-5" />
            🏆 Podium - Top 3 Departments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {topThree.map((dept, index) => (
              <div key={dept.id} className={`text-center p-4 rounded-lg ${
                dept.rank === 1 ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-400' :
                dept.rank === 2 ? 'bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-400' :
                'bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-400'
              }`}>
                <div className="text-4xl mb-2">{getRankEmoji(dept.rank)}</div>
                <div className="flex justify-center mb-2">{getRankIcon(dept.rank)}</div>
                <h3 className="font-bold text-gray-800">{dept.name}</h3>
                <p className="text-sm font-semibold text-gray-700">{dept.totalSteps.toLocaleString()} steps</p>
                <p className="text-xs text-gray-600">{dept.participantCount} participants</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Your Department Stats */}
      {userDept && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Users className="h-5 w-5" />
              Your Department: {userDept.name} {getRankEmoji(userDept.rank)}
            </CardTitle>
            <p className="text-sm text-blue-600">Currently ranked #{userDept.rank}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white p-3 rounded-lg">
                <div className="text-xl font-bold text-blue-700">{userDept.totalSteps.toLocaleString()}</div>
                <div className="text-xs text-blue-600">Total Steps</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-xl font-bold text-blue-700">{userDept.averageSteps.toLocaleString()}</div>
                <div className="text-xs text-blue-600">Avg Steps/Day</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="text-xl font-bold text-blue-700">{userDept.participantCount}</div>
                <div className="text-xs text-blue-600">Team Members</div>
              </div>
            </div>

            {/* Department Members Table */}
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Top Performers in Your Department
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Steps</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userDept.members.slice(0, 5).map((member, index) => (
                    <TableRow key={member.userId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {member.rank <= 3 ? getRankIcon(member.rank) : <span>#{member.rank}</span>}
                        </div>
                      </TableCell>
                      <TableCell>{member.name}</TableCell>
                      <TableCell className="font-semibold">{member.steps.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Departments Leaderboard */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-800">
            <Trophy className="h-5 w-5" />
            Complete Department Leaderboard
          </CardTitle>
          <p className="text-sm text-emerald-600">
            Total Participants: {challengeData.totalParticipants} • 
            Combined Steps: {challengeData.departments.reduce((sum, dept) => sum + dept.totalSteps, 0).toLocaleString()}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {challengeData.departments.map((dept) => (
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
                      {dept.name === userDepartment && <Badge variant="secondary" className="text-xs">Your Dept</Badge>}
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
                  <span>Progress vs Leader</span>
                  <span>{((dept.totalSteps / maxSteps) * 100).toFixed(1)}%</span>
                </div>
                <Progress 
                  value={(dept.totalSteps / maxSteps) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
