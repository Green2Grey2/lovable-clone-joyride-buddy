import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Trophy, Target, Footprints, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface ActivityItem {
  id: string;
  user_id: string;
  type: 'achievement' | 'milestone' | 'activity' | 'challenge';
  title: string;
  description: string;
  data: any;
  created_at: string;
  likes: number;
  comments: number;
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
      const { data, error } = await supabase
        .from('social_activities')
        .select(`
          *,
          user:profiles!user_id(name, avatar_url, department),
          activity_likes!left(user_id)
        `)
        .order('created_at', { ascending: false })
        .range((pageNum - 1) * 10, pageNum * 10 - 1);

      if (error) throw error;

      const processedData = data?.map(item => ({
        ...item,
        liked_by_me: item.activity_likes?.some((like: any) => like.user_id === user?.id)
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
        async (payload) => {
          // Fetch the complete activity with user data
          const { data } = await supabase
            .from('social_activities')
            .select(`
              *,
              user:profiles!user_id(name, avatar_url, department),
              activity_likes!left(user_id)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            const processedData = {
              ...data,
              liked_by_me: data.activity_likes?.some((like: any) => like.user_id === user?.id)
            };
            setActivities(prev => [processedData, ...prev]);
          }
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
      case 'milestone':
        return <Target className="h-5 w-5 text-blue-500" />;
      case 'activity':
        return <Footprints className="h-5 w-5 text-green-500" />;
      case 'challenge':
        return <Flame className="h-5 w-5 text-orange-500" />;
      default:
        return null;
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
            
            {/* Activity-specific content */}
            {activity.type === 'achievement' && activity.data?.badge && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg mb-3">
                <p className="text-sm font-medium text-orange-800">
                  🏆 Earned: {activity.data.badge}
                </p>
              </div>
            )}
            
            {activity.type === 'milestone' && activity.data?.value && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-lg mb-3">
                <p className="text-sm font-medium text-blue-800">
                  🎯 {activity.data.value} {activity.data.unit || 'achieved'}!
                </p>
              </div>
            )}
            
            {/* Interaction buttons */}
            <div className="flex items-center gap-4 pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3"
                onClick={() => handleLike(activity.id, activity.liked_by_me || false)}
              >
                <Heart
                  className={`h-4 w-4 mr-1 ${
                    activity.liked_by_me ? 'fill-red-500 text-red-500' : ''
                  }`}
                />
                {activity.likes}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3"
                disabled
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                {activity.comments}
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