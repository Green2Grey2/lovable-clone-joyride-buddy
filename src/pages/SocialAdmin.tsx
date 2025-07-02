import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Users, Target, Calendar, Award, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { FloatingBottomNav } from '@/components/FloatingBottomNav';

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'weekend' | 'tournament';
  targetValue: number;
  metric: 'steps' | 'active_minutes' | 'workouts';
  startDate: string;
  endDate: string;
  isActive: boolean;
  participants: number;
  rewards: string[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  type: 'milestone' | 'streak' | 'seasonal' | 'special';
  requirement: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isActive: boolean;
  earnedBy: number;
}

const SocialAdmin = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: '1',
      name: 'Weekend Warriors',
      description: 'Get 15,000 steps each day this weekend',
      type: 'weekend',
      targetValue: 15000,
      metric: 'steps',
      startDate: '2025-01-04',
      endDate: '2025-01-05',
      isActive: true,
      participants: 45,
      rewards: ['Weekend Warrior Badge', '100 Points']
    },
    {
      id: '2',
      name: 'Step Tournament Quarter-Finals',
      description: 'Compete in the quarterly step championship',
      type: 'tournament',
      targetValue: 50000,
      metric: 'steps',
      startDate: '2025-01-01',
      endDate: '2025-01-07',
      isActive: true,
      participants: 128,
      rewards: ['Tournament Badge', 'Champion Title', '500 Points']
    }
  ]);

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      name: 'New Year Resolution',
      description: 'Complete 31 workouts in January',
      type: 'seasonal',
      requirement: '31 workouts in January',
      icon: 'calendar',
      rarity: 'rare',
      isActive: true,
      earnedBy: 12
    },
    {
      id: '2',
      name: 'Century Club',
      description: 'Reach 100,000 total steps',
      type: 'milestone',
      requirement: '100,000 total steps',
      icon: 'target',
      rarity: 'epic',
      isActive: true,
      earnedBy: 8
    },
    {
      id: '3',
      name: 'Fire Streak',
      description: 'Maintain a 30-day activity streak',
      type: 'streak',
      requirement: '30 consecutive days active',
      icon: 'zap',
      rarity: 'legendary',
      isActive: true,
      earnedBy: 3
    }
  ]);

  const [newChallenge, setNewChallenge] = useState<Partial<Challenge>>({
    type: 'weekly',
    metric: 'steps',
    isActive: true
  });

  const [newAchievement, setNewAchievement] = useState<Partial<Achievement>>({
    type: 'milestone',
    rarity: 'common',
    isActive: true
  });

  const addChallenge = () => {
    if (newChallenge.name && newChallenge.description && newChallenge.targetValue) {
      const challenge: Challenge = {
        id: Date.now().toString(),
        name: newChallenge.name,
        description: newChallenge.description,
        type: newChallenge.type as Challenge['type'],
        targetValue: newChallenge.targetValue,
        metric: newChallenge.metric as Challenge['metric'],
        startDate: newChallenge.startDate || '',
        endDate: newChallenge.endDate || '',
        isActive: newChallenge.isActive || true,
        participants: 0,
        rewards: []
      };
      setChallenges([...challenges, challenge]);
      setNewChallenge({ type: 'weekly', metric: 'steps', isActive: true });
    }
  };

  const addAchievement = () => {
    if (newAchievement.name && newAchievement.description && newAchievement.requirement) {
      const achievement: Achievement = {
        id: Date.now().toString(),
        name: newAchievement.name,
        description: newAchievement.description,
        type: newAchievement.type as Achievement['type'],
        requirement: newAchievement.requirement,
        icon: newAchievement.icon || 'award',
        rarity: newAchievement.rarity as Achievement['rarity'],
        isActive: newAchievement.isActive || true,
        earnedBy: 0
      };
      setAchievements([...achievements, achievement]);
      setNewAchievement({ type: 'milestone', rarity: 'common', isActive: true });
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-green-100 text-green-800';
      case 'weekly': return 'bg-blue-100 text-blue-800';
      case 'weekend': return 'bg-orange-100 text-orange-800';
      case 'tournament': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-32">
      <div className="bg-white sticky top-0 z-30 border-b border-gray-100">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-bold text-[#1D244D] mb-1 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-[#735CF7]" />
            Social & Gamification Admin
          </h1>
          <p className="text-[#8A94A6] text-sm">Manage challenges, achievements, and social features</p>
        </div>
      </div>

      <div className="px-6 py-8">
        <Tabs defaultValue="challenges" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="challenges">Team Challenges</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="social">Social Feed</TabsTrigger>
          </TabsList>

          <TabsContent value="challenges" className="space-y-6">
            {/* Add New Challenge */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Challenge
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Challenge Name"
                    value={newChallenge.name || ''}
                    onChange={(e) => setNewChallenge({ ...newChallenge, name: e.target.value })}
                  />
                  <Select
                    value={newChallenge.type}
                    onValueChange={(value) => setNewChallenge({ ...newChallenge, type: value as Challenge['type'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily Challenge</SelectItem>
                      <SelectItem value="weekly">Weekly Challenge</SelectItem>
                      <SelectItem value="weekend">Weekend Challenge</SelectItem>
                      <SelectItem value="tournament">Tournament</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  placeholder="Challenge Description"
                  value={newChallenge.description || ''}
                  onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                />
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    type="number"
                    placeholder="Target Value"
                    value={newChallenge.targetValue || ''}
                    onChange={(e) => setNewChallenge({ ...newChallenge, targetValue: Number(e.target.value) })}
                  />
                  <Select
                    value={newChallenge.metric}
                    onValueChange={(value) => setNewChallenge({ ...newChallenge, metric: value as Challenge['metric'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="steps">Steps</SelectItem>
                      <SelectItem value="active_minutes">Active Minutes</SelectItem>
                      <SelectItem value="workouts">Workouts</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newChallenge.isActive}
                      onCheckedChange={(checked) => setNewChallenge({ ...newChallenge, isActive: checked })}
                    />
                    <span className="text-sm">Active</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="date"
                    placeholder="Start Date"
                    value={newChallenge.startDate || ''}
                    onChange={(e) => setNewChallenge({ ...newChallenge, startDate: e.target.value })}
                  />
                  <Input
                    type="date"
                    placeholder="End Date"
                    value={newChallenge.endDate || ''}
                    onChange={(e) => setNewChallenge({ ...newChallenge, endDate: e.target.value })}
                  />
                </div>
                <Button onClick={addChallenge} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Challenge
                </Button>
              </CardContent>
            </Card>

            {/* Existing Challenges */}
            <div className="space-y-4">
              {challenges.map((challenge) => (
                <Card key={challenge.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#735CF7] to-[#00A3FF] rounded-lg flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#1D244D]">{challenge.name}</h3>
                          <p className="text-sm text-[#8A94A6]">{challenge.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getChallengeTypeColor(challenge.type)}>
                          {challenge.type}
                        </Badge>
                        <Switch checked={challenge.isActive} />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-[#8A94A6]">Target:</span>
                        <p className="font-semibold">{challenge.targetValue.toLocaleString()} {challenge.metric}</p>
                      </div>
                      <div>
                        <span className="text-[#8A94A6]">Participants:</span>
                        <p className="font-semibold">{challenge.participants}</p>
                      </div>
                      <div>
                        <span className="text-[#8A94A6]">Start:</span>
                        <p className="font-semibold">{challenge.startDate}</p>
                      </div>
                      <div>
                        <span className="text-[#8A94A6]">End:</span>
                        <p className="font-semibold">{challenge.endDate}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View Results
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            {/* Add New Achievement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Create New Achievement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Achievement Name"
                    value={newAchievement.name || ''}
                    onChange={(e) => setNewAchievement({ ...newAchievement, name: e.target.value })}
                  />
                  <Select
                    value={newAchievement.type}
                    onValueChange={(value) => setNewAchievement({ ...newAchievement, type: value as Achievement['type'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="milestone">Milestone</SelectItem>
                      <SelectItem value="streak">Streak</SelectItem>
                      <SelectItem value="seasonal">Seasonal</SelectItem>
                      <SelectItem value="special">Special Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  placeholder="Achievement Description"
                  value={newAchievement.description || ''}
                  onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                />
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    placeholder="Requirement"
                    value={newAchievement.requirement || ''}
                    onChange={(e) => setNewAchievement({ ...newAchievement, requirement: e.target.value })}
                  />
                  <Input
                    placeholder="Icon Name"
                    value={newAchievement.icon || ''}
                    onChange={(e) => setNewAchievement({ ...newAchievement, icon: e.target.value })}
                  />
                  <Select
                    value={newAchievement.rarity}
                    onValueChange={(value) => setNewAchievement({ ...newAchievement, rarity: value as Achievement['rarity'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="common">Common</SelectItem>
                      <SelectItem value="rare">Rare</SelectItem>
                      <SelectItem value="epic">Epic</SelectItem>
                      <SelectItem value="legendary">Legendary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={addAchievement} className="w-full">
                  <Award className="h-4 w-4 mr-2" />
                  Create Achievement
                </Button>
              </CardContent>
            </Card>

            {/* Existing Achievements */}
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <Card key={achievement.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-lg flex items-center justify-center">
                          <Award className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#1D244D]">{achievement.name}</h3>
                          <p className="text-sm text-[#8A94A6]">{achievement.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getRarityColor(achievement.rarity)}>
                          {achievement.rarity}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800">
                          {achievement.type}
                        </Badge>
                        <Switch checked={achievement.isActive} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-[#8A94A6]">Requirement:</span>
                        <p className="font-semibold">{achievement.requirement}</p>
                      </div>
                      <div>
                        <span className="text-[#8A94A6]">Earned by:</span>
                        <p className="font-semibold">{achievement.earnedBy} users</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View Holders
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Social Feed Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Auto-share Achievements</h3>
                    <p className="text-sm text-[#8A94A6]">Automatically post when users earn achievements</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Milestone Celebrations</h3>
                    <p className="text-sm text-[#8A94A6]">Celebrate major milestones with special posts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Challenge Updates</h3>
                    <p className="text-sm text-[#8A94A6]">Share challenge progress and winners</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Weekly Leaderboards</h3>
                    <p className="text-sm text-[#8A94A6]">Post weekly top performers</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feed Moderation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Recent Posts</p>
                      <p className="text-sm text-[#8A94A6]">324 posts in the last 24 hours</p>
                    </div>
                    <Button size="sm">Review</Button>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Flagged Content</p>
                      <p className="text-sm text-[#8A94A6]">2 posts pending review</p>
                    </div>
                    <Button size="sm" variant="outline" className="text-orange-600">Review</Button>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">User Reports</p>
                      <p className="text-sm text-[#8A94A6]">0 active reports</p>
                    </div>
                    <Button size="sm" variant="outline">View All</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <FloatingBottomNav />
    </div>
  );
};

export default SocialAdmin;
