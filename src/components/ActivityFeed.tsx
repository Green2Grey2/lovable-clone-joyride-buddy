import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, Trophy, Target, Footprints, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface ActivityItem {
  id: string;
  user_id: string;
  type: 'achievement' | 'milestone' | 'activity' | 'challenge' | 'streak_achievement' | 'step_milestone';
  title: string;
  description: string;
  data: any;
  created_at: string;
  likes: number;
  user: {
    name: string;
    avatar_url?: string;
    department?: string;
  };
  liked_by_me?: boolean;
}

export const ActivityFeed = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { playClick } = useSoundEffects();

  useEffect(() => {
    loadActivities();
    subscribeToActivities();
  }, []);

  const loadActivities = async (pageNum: number = 1) => {
    try {
      const { data, error } = await supabase.rpc('get_social_feed', {
        p_user_id: user?.id,
        p_limit: 10,
        p_offset: (pageNum - 1) * 10
      });

      if (error) throw error;

      const processedData = data?.map(item => ({
        id: item.id,
        user_id: item.user_id,
        type: item.type as 'achievement' | 'milestone' | 'activity' | 'challenge' | 'streak_achievement' | 'step_milestone',
        title: item.title,
        description: item.description,
        data: item.data,
        created_at: item.created_at,
        likes: Number(item.like_count || 0),
        user: {
          name: item.user_name || 'Unknown User',
          avatar_url: undefined,
          department: item.user_department || 'Unknown'
        },
        liked_by_me: item.liked_by_me || false
      })) || [];

      if (pageNum === 1) {
        setActivities(processedData);
      } else {
        setActivities(prev => [...prev, ...processedData]);
      }

      setHasMore((data?.length || 0) === 10);
    } catch (error) {
      console.error('Error loading activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToActivities = () => {
    const channel = supabase
      .channel('social-activities')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'social_activities'
        },
        async () => {
          // Reload the first page when new activities are added
          loadActivities(1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleLike = async (activityId: string, liked: boolean) => {
    if (!user) return;

    try {
      if (liked) {
        await supabase
          .from('activity_likes')
          .delete()
          .eq('activity_id', activityId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('activity_likes')
          .insert({
            activity_id: activityId,
            user_id: user.id
          });
      }

      // Update local state
      setActivities(prev =>
        prev.map(activity =>
          activity.id === activityId
            ? {
                ...activity,
                liked_by_me: !liked,
                likes: liked ? activity.likes - 1 : activity.likes + 1
              }
            : activity
        )
      );

      playClick();
    } catch (error) {
      console.error('Error liking activity:', error);
      toast.error('Failed to like activity');
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'streak_achievement':
        return <Flame className="h-5 w-5 text-orange-500" />;
      case 'step_milestone':
        return <Target className="h-5 w-5 text-blue-500" />;
      case 'milestone':
        return <Target className="h-5 w-5 text-green-500" />;
      case 'activity':
        return <Footprints className="h-5 w-5 text-green-500" />;
      case 'challenge':
        return <Flame className="h-5 w-5 text-orange-500" />;
      default:
        return <Trophy className="h-5 w-5 text-primary" />;
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadActivities(nextPage);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card key={activity.id} className="overflow-hidden hover-lift">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={activity.user.avatar_url} />
                <AvatarFallback>
                  {activity.user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{activity.user.name}</p>
                  {getActivityIcon(activity.type)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {activity.user.department} • {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="font-medium mb-1">{activity.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {activity.description}
            </p>
            
            {/* Enhanced achievement display */}
            {activity.type === 'achievement' && activity.data && (
              <div className="bg-gradient-to-r from-yellow-50 via-yellow-100 to-orange-50 dark:from-yellow-900/20 dark:via-yellow-800/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 p-4 rounded-lg mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-200 dark:bg-yellow-800 rounded-full">
                    <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-yellow-900 dark:text-yellow-100 text-base">
                      🏆 {activity.data.achievement_name || 'New Achievement!'}
                    </p>
                    {activity.data.points && (
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        +{activity.data.points} points earned
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Enhanced streak milestone display */}
            {activity.type === 'streak_achievement' && activity.data && (
              <div className="bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 dark:from-orange-900/20 dark:via-red-900/20 dark:to-pink-900/20 border border-orange-200 dark:border-orange-700 p-4 rounded-lg mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-200 dark:bg-orange-800 rounded-full">
                    <Flame className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-orange-900 dark:text-orange-100 text-base">
                      🔥 {activity.data.streak_days}-Day Streak!
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Consistency level: Expert
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Enhanced step milestone display */}
            {activity.type === 'step_milestone' && activity.data && (
              <div className="bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-900/20 dark:via-cyan-900/20 dark:to-teal-900/20 border border-blue-200 dark:border-blue-700 p-4 rounded-lg mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-full">
                    <Target className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900 dark:text-blue-100 text-base">
                      👟 {activity.data.steps?.toLocaleString() || activity.data.milestone} Steps Reached!
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Daily goal achievement
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Generic milestone display for other types */}
            {activity.type === 'milestone' && !activity.type.includes('step') && activity.data?.value && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 p-3 rounded-lg mb-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  🎯 {activity.data.value} {activity.data.unit || 'achieved'}!
                </p>
              </div>
            )}
            
            {/* Heart interaction */}
            <div className="flex items-center pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 hover:bg-accent/10 transition-smooth"
                onClick={() => handleLike(activity.id, activity.liked_by_me || false)}
              >
                <Heart
                  className={`h-4 w-4 mr-1 transition-colors ${
                    activity.liked_by_me ? 'fill-red-500 text-red-500' : 'text-muted-foreground hover:text-red-400'
                  }`}
                />
                <span className={activity.liked_by_me ? 'text-red-500' : 'text-muted-foreground'}>
                  {activity.likes}
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {hasMore && activities.length > 0 && (
        <div className="text-center py-4">
          <Button
            variant="outline"
            onClick={loadMore}
            className="rounded-full"
          >
            Load More
          </Button>
        </div>
      )}
      
      {activities.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No activities yet. Complete some activities to see them here!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};