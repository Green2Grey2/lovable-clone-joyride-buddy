
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Award, Star, Target, Zap, Crown, Medal, Calendar, Snowflake, Sun, Leaf, Flower } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface ExtendedAchievement {
  id: string;
  name: string;
  description: string;
  type: 'milestone' | 'streak' | 'seasonal' | 'special' | 'social' | 'challenge';
  category: 'steps' | 'workouts' | 'social' | 'consistency' | 'special_events';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  total?: number;
  color: string;
  season?: 'spring' | 'summer' | 'fall' | 'winter';
  celebrationMessage?: string;
  points: number;
}

export const ExpandedAchievementSystem = () => {
  const { userProfile } = useApp();
  
  const [achievements, setAchievements] = useState<ExtendedAchievement[]>([
    // Milestone Achievements
    {
      id: '1',
      name: 'First Steps',
      description: 'Take your first 1,000 steps',
      type: 'milestone',
      category: 'steps',
      rarity: 'common',
      icon: 'Target',
      earned: true,
      earnedDate: '3 days ago',
      color: 'from-green-400 to-green-600',
      celebrationMessage: 'Every journey begins with a single step! 🎉',
      points: 50
    },
    {
      id: '2',
      name: 'Century Club',
      description: 'Reach 100,000 total steps',
      type: 'milestone',
      category: 'steps',
      rarity: 'epic',
      icon: 'Crown',
      earned: false,
      progress: 45670,
      total: 100000,
      color: 'from-purple-400 to-purple-600',
      celebrationMessage: 'You are now royalty in the world of fitness! 👑',
      points: 500
    },
    
    // Streak Achievements
    {
      id: '3',
      name: 'Weekend Warrior',
      description: 'Stay active for 7 consecutive days',
      type: 'streak',
      category: 'consistency',
      rarity: 'rare',
      icon: 'Zap',
      earned: true,
      earnedDate: '1 week ago',
      color: 'from-orange-400 to-red-500',
      celebrationMessage: 'Your dedication is electric! ⚡',
      points: 200
    },
    {
      id: '4',
      name: 'Unstoppable Force',
      description: 'Maintain a 30-day activity streak',
      type: 'streak',
      category: 'consistency',
      rarity: 'legendary',
      icon: 'Medal',
      earned: false,
      progress: 12,
      total: 30,
      color: 'from-yellow-400 to-orange-500',
      celebrationMessage: 'Nothing can stop you now! You are a force of nature! 🔥',
      points: 1000
    },

    // Seasonal Achievements
    {
      id: '5',
      name: 'New Year, New Me',
      description: 'Complete 31 workouts in January',
      type: 'seasonal',
      category: 'workouts',
      rarity: 'rare',
      icon: 'Calendar',
      earned: false,
      progress: 8,
      total: 31,
      color: 'from-blue-400 to-cyan-500',
      season: 'winter',
      celebrationMessage: 'You crushed your New Year resolution! 🎊',
      points: 300
    },
    {
      id: '6',
      name: 'Spring Into Action',
      description: 'Walk 250,000 steps during spring season',
      type: 'seasonal',
      category: 'steps',
      rarity: 'epic',
      icon: 'Flower',
      earned: false,
      progress: 0,
      total: 250000,
      color: 'from-pink-400 to-rose-500',
      season: 'spring',
      celebrationMessage: 'You bloomed with activity this spring! 🌸',
      points: 600
    },
    {
      id: '7',
      name: 'Summer Solstice Strider',
      description: 'Hit your daily goal every day in June',
      type: 'seasonal',
      category: 'consistency',
      rarity: 'legendary',
      icon: 'Sun',
      earned: false,
      progress: 0,
      total: 30,
      color: 'from-yellow-300 to-orange-400',
      season: 'summer',
      celebrationMessage: 'You shined brighter than the summer sun! ☀️',
      points: 1200
    },

    // Social Achievements
    {
      id: '8',
      name: 'Team Player',
      description: 'Complete 3 team challenges',
      type: 'social',
      category: 'social',
      rarity: 'rare',
      icon: 'Trophy',
      earned: false,
      progress: 1,
      total: 3,
      color: 'from-indigo-400 to-purple-500',
      celebrationMessage: 'Teamwork makes the dream work! 🤝',
      points: 250
    },
    {
      id: '9',
      name: 'Motivational Speaker',
      description: 'Encourage 50 teammates in the activity feed',
      type: 'social',
      category: 'social',
      rarity: 'epic',
      icon: 'Star',
      earned: false,
      progress: 12,
      total: 50,
      color: 'from-cyan-400 to-blue-500',
      celebrationMessage: 'Your positivity lifts everyone up! 🌟',
      points: 400
    },

    // Special Event Achievements
    {
      id: '10',
      name: 'Department Champion',
      description: 'Lead your department to victory in a challenge',
      type: 'special',
      category: 'special_events',
      rarity: 'legendary',
      icon: 'Crown',
      earned: false,
      color: 'from-gold to-yellow-600',
      celebrationMessage: 'You are the champion your department needed! 🏆',
      points: 1500
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = [
    { id: 'all', name: 'All', count: achievements.length },
    { id: 'steps', name: 'Steps', count: achievements.filter(a => a.category === 'steps').length },
    { id: 'workouts', name: 'Workouts', count: achievements.filter(a => a.category === 'workouts').length },
    { id: 'consistency', name: 'Consistency', count: achievements.filter(a => a.category === 'consistency').length },
    { id: 'social', name: 'Social', count: achievements.filter(a => a.category === 'social').length },
    { id: 'seasonal', name: 'Seasonal', count: achievements.filter(a => a.type === 'seasonal').length }
  ];

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory || (selectedCategory === 'seasonal' && a.type === 'seasonal'));

  const earnedCount = achievements.filter(a => a.earned).length;
  const totalPoints = achievements.filter(a => a.earned).reduce((sum, a) => sum + a.points, 0);

  const iconMap: { [key: string]: any } = {
    Target, Trophy, Award, Star, Zap, Crown, Medal, Calendar, 
    Snowflake, Sun, Leaf, Flower
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeasonIcon = (season?: string) => {
    switch (season) {
      case 'spring': return <Flower className="h-3 w-3" />;
      case 'summer': return <Sun className="h-3 w-3" />;
      case 'fall': return <Leaf className="h-3 w-3" />;
      case 'winter': return <Snowflake className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-[#735CF7] to-[#00A3FF] text-white border-0">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 opacity-80" />
            <div className="text-2xl font-bold">{earnedCount}</div>
            <div className="text-sm opacity-90">Earned</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-white border-0">
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 mx-auto mb-2 opacity-80" />
            <div className="text-2xl font-bold">{totalPoints}</div>
            <div className="text-sm opacity-90">Points</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#FF7B5A] to-[#FF6B4A] text-white border-0">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 opacity-80" />
            <div className="text-2xl font-bold">{achievements.length - earnedCount}</div>
            <div className="text-sm opacity-90">To Unlock</div>
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full grid grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs">
              {category.name} ({category.count})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid gap-4">
            {filteredAchievements.map((achievement) => {
              const IconComponent = iconMap[achievement.icon] || Award;
              const progressPercentage = achievement.total ? (achievement.progress || 0) / achievement.total * 100 : 0;
              
              return (
                <Card 
                  key={achievement.id} 
                  className={`bg-white border-0 rounded-3xl shadow-[0px_10px_30px_rgba(115,92,247,0.1)] transition-all duration-300 ${
                    achievement.earned 
                      ? 'ring-2 ring-green-200 hover:ring-green-300' 
                      : 'hover:shadow-[0px_15px_35px_rgba(115,92,247,0.15)]'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${achievement.color} rounded-2xl flex items-center justify-center ${
                        !achievement.earned ? 'opacity-60' : ''
                      } shadow-lg`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-[#1D244D] mb-1 flex items-center gap-2">
                              {achievement.name}
                              {achievement.season && getSeasonIcon(achievement.season)}
                            </h3>
                            <p className="text-[#8A94A6] text-sm mb-2">{achievement.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getRarityColor(achievement.rarity)} text-xs font-medium border`}>
                              {achievement.rarity}
                            </Badge>
                            {achievement.earned && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                ✓ Earned
                              </Badge>
                            )}
                          </div>
                        </div>

                        {achievement.earned ? (
                          <div className="space-y-2">
                            <p className="text-xs text-green-600 font-medium">
                              🎉 Earned {achievement.earnedDate} • +{achievement.points} points
                            </p>
                            {achievement.celebrationMessage && (
                              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-sm text-green-800 font-medium">
                                  {achievement.celebrationMessage}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : achievement.total ? (
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-[#8A94A6]">Progress</span>
                              <span className="text-[#1D244D] font-medium">
                                {achievement.progress?.toLocaleString()} / {achievement.total?.toLocaleString()}
                              </span>
                            </div>
                            <div className="relative">
                              <Progress value={progressPercentage} className="h-3" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-bold text-[#1D244D] bg-white/90 px-2 py-0.5 rounded-full shadow-sm">
                                  {Math.round(progressPercentage)}%
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-[#8A94A6]">
                              {achievement.points} points when completed
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                              🏆 Complete the requirement to unlock • {achievement.points} points
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
