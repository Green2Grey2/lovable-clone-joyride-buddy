
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Award, Star, Target, Zap, Crown, Medal, Calendar, Snowflake, Sun, Leaf, Flower } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'milestone' | 'challenge' | 'special';
  criteria: any;
  points: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  progress: number;
  data: any;
  achievement: Achievement;
}

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
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<ExtendedAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = async () => {
    try {
      // Get all achievements
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (achievementsError) throw achievementsError;

      // Get user's earned achievements
      const { data: userAchievements, error: userAchievementsError } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', userProfile.id);

      if (userAchievementsError) throw userAchievementsError;

      // Create a map of earned achievements
      const earnedMap = new Map(
        userAchievements?.map(ua => [ua.achievement_id, ua]) || []
      );

      // Transform achievements to ExtendedAchievement format
      const transformedAchievements = allAchievements?.map(achievement => {
        const userAchievement = earnedMap.get(achievement.id);
        const isEarned = !!userAchievement;
        
        // Map category to our extended categories
        let extendedCategory: 'steps' | 'workouts' | 'social' | 'consistency' | 'special_events';
        switch (achievement.category) {
          case 'streak':
            extendedCategory = 'consistency';
            break;
          case 'milestone':
            extendedCategory = 'steps';
            break;
          case 'special':
            extendedCategory = 'social';
            break;
          default:
            extendedCategory = 'special_events';
        }

        // Get rarity based on points
        let rarity: 'common' | 'rare' | 'epic' | 'legendary';
        if (achievement.points <= 20) rarity = 'common';
        else if (achievement.points <= 50) rarity = 'rare';
        else if (achievement.points <= 200) rarity = 'epic';
        else rarity = 'legendary';

        // Get color based on category using semantic tokens
        let color: string;
        switch (achievement.category) {
          case 'streak':
            color = 'from-destructive/80 to-destructive';
            break;
          case 'milestone':
            color = 'from-primary/60 to-primary';
            break;
          case 'special':
            color = 'from-secondary/60 to-secondary';
            break;
          default:
            color = 'from-accent/60 to-accent';
        }

        return {
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          type: achievement.category as any,
          category: extendedCategory,
          rarity,
          icon: achievement.icon,
          earned: isEarned,
          earnedDate: isEarned ? new Date(userAchievement.earned_at).toLocaleDateString() : undefined,
          progress: userAchievement?.progress || 0,
          total: (achievement.criteria as any)?.value || 100,
          color,
          celebrationMessage: isEarned ? `Congratulations on earning ${achievement.name}! 🎉` : undefined,
          points: achievement.points
        };
      }) || [];

      setAchievements(transformedAchievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast({
        title: "Error",
        description: "Failed to load achievements. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile.id) {
      fetchAchievements();
    }
  }, [userProfile.id]);

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
    Snowflake, Sun, Leaf, Flower, ...LucideIcons
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-muted text-muted-foreground border-border';
      case 'rare': return 'bg-primary/10 text-primary border-primary/20';
      case 'epic': return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'legendary': return 'bg-accent/10 text-accent-foreground border-accent/20';
      default: return 'bg-muted text-muted-foreground border-border';
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="bg-white border-0 rounded-3xl shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="h-8 w-8 mx-auto mb-2 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="gradient-primary text-white border-0 shadow-premium">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 opacity-80" />
            <div className="text-2xl font-bold">{earnedCount}</div>
            <div className="text-sm opacity-90">Earned</div>
          </CardContent>
        </Card>
        <Card className="gradient-accent text-white border-0 shadow-premium">
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 mx-auto mb-2 opacity-80" />
            <div className="text-2xl font-bold">{totalPoints}</div>
            <div className="text-sm opacity-90">Points</div>
          </CardContent>
        </Card>
        <Card className="gradient-secondary text-white border-0 shadow-premium">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 opacity-80" />
            <div className="text-2xl font-bold">{achievements.length - earnedCount}</div>
            <div className="text-sm opacity-90">To Unlock</div>
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full grid grid-cols-3 lg:grid-cols-6 glass dark:glass-dark rounded-2xl p-1 shadow-premium">
          {categories.map((category) => (
            <TabsTrigger 
              key={category.id} 
              value={category.id} 
              className="text-xs rounded-xl data-[state=active]:gradient-primary data-[state=active]:text-white flex items-center justify-center px-2 py-1.5 min-h-[2.5rem] text-center"
            >
              <span className="whitespace-nowrap">{category.name} ({category.count})</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={selectedCategory} className="mt-12">
          <div className="grid gap-4">
            {filteredAchievements.map((achievement) => {
              const IconComponent = iconMap[achievement.icon] || iconMap['award'] || Award;
              const progressPercentage = achievement.total ? (achievement.progress || 0) / achievement.total * 100 : 0;
              
              return (
                <Card 
                  key={achievement.id} 
                  className={`card-modern glass dark:glass-dark transition-all duration-300 ${
                    achievement.earned 
                      ? 'ring-2 ring-primary/30 hover:ring-primary/50' 
                      : 'hover:shadow-premium'
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
                            <h3 className="font-bold text-foreground mb-1 flex items-center gap-2">
                              {achievement.name}
                              {achievement.season && getSeasonIcon(achievement.season)}
                            </h3>
                            <p className="text-muted-foreground text-sm mb-2">{achievement.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getRarityColor(achievement.rarity)} text-xs font-medium border`}>
                              {achievement.rarity}
                            </Badge>
                            {achievement.earned && (
                              <Badge className="bg-primary/20 text-primary dark:text-primary text-xs">
                                ✓ Earned
                              </Badge>
                            )}
                          </div>
                        </div>

                        {achievement.earned ? (
                          <div className="space-y-2">
                            <p className="text-xs text-primary font-medium">
                              🎉 Earned {achievement.earnedDate} • +{achievement.points} points
                            </p>
                            {achievement.celebrationMessage && (
                              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                                <p className="text-sm text-primary font-medium">
                                  {achievement.celebrationMessage}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : achievement.total ? (
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="text-foreground font-medium">
                                {achievement.progress?.toLocaleString()} / {achievement.total?.toLocaleString()}
                              </span>
                            </div>
                            <div className="relative">
                              <Progress value={progressPercentage} className="h-3" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-bold text-foreground bg-background/90 px-2 py-0.5 rounded-full shadow-sm">
                                  {Math.round(progressPercentage)}%
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {achievement.points} points when completed
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">
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
