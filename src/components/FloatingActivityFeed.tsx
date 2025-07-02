import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, X, ChevronDown, ChevronUp } from 'lucide-react';
import { ActivityFeed } from './ActivityFeed';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const FloatingActivityFeed = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      checkUnreadActivities();
      subscribeToNewActivities();
    }
  }, [user]);

  const checkUnreadActivities = async () => {
    if (!user) return;

    try {
      const lastViewedStr = localStorage.getItem('lastActivityViewTime');
      const lastViewed = lastViewedStr ? new Date(lastViewedStr) : new Date(0);

      const { count } = await supabase
        .from('social_activities')
        .select('*', { count: 'exact', head: true })
        .gt('created_at', lastViewed.toISOString())
        .neq('user_id', user.id);

      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error checking unread activities:', error);
    }
  };

  const subscribeToNewActivities = () => {
    const channel = supabase
      .channel('new-activities')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'social_activities',
          filter: `user_id=neq.${user?.id}`
        },
        () => {
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
    localStorage.setItem('lastActivityViewTime', new Date().toISOString());
  };

  if (!isOpen) {
    return (
      <Button
        onClick={handleOpen}
        className="fixed right-4 bottom-20 md:bottom-4 z-40 h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg hover:shadow-xl transition-all duration-200 p-0"
      >
        <Users className="h-6 w-6 text-white" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 min-w-[20px] p-0 flex items-center justify-center bg-red-500 text-white text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Card className={`fixed right-4 ${isMinimized ? 'bottom-20 md:bottom-4' : 'bottom-20 md:bottom-4 top-20 md:top-auto'} z-40 w-[calc(100vw-2rem)] max-w-md transition-all duration-300 shadow-xl ${isMinimized ? 'h-14' : 'md:h-[600px]'}`}>
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Activity Feed</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {!isMinimized && (
        <div className="overflow-y-auto h-[calc(100%-60px)] p-4">
          <ActivityFeed />
        </div>
      )}
    </Card>
  );
};