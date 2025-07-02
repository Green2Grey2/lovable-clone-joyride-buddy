import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertTriangle, ChevronDown, ChevronRight, Eye, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface FlaggedNotification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export const FlaggedActivities = () => {
  const { user } = useAuth();
  const [flaggedActivities, setFlaggedActivities] = useState<FlaggedNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchFlaggedActivities();
    }
  }, [user]);

  const fetchFlaggedActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('id, title, message, created_at, is_read')
        .eq('user_id', user?.id)
        .eq('type', 'activity_flag')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFlaggedActivities(data || []);
    } catch (error) {
      console.error('Error fetching flagged activities:', error);
      toast.error('Failed to load flagged activities');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setFlaggedActivities(prev =>
        prev.map(item =>
          item.id === notificationId ? { ...item, is_read: true } : item
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
      // Mark as read when expanded
      const notification = flaggedActivities.find(item => item.id === id);
      if (notification && !notification.is_read) {
        markAsRead(id);
      }
    }
    setExpandedItems(newExpanded);
  };

  const parseActivityDetails = (message: string) => {
    // Parse the message to extract activity details
    const activityMatch = message.match(/Activity: (\w+), (\d+)min, (\d+)cal/);
    const reasonMatch = message.match(/flagged: ([^.]+)\./);
    
    return {
      reason: reasonMatch?.[1] || 'Unknown reason',
      activityType: activityMatch?.[1] || 'Unknown',
      duration: activityMatch?.[2] || '0',
      calories: activityMatch?.[3] || '0'
    };
  };

  if (loading) {
    return (
      <Card className="card-modern glass dark:glass-dark">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Flagged Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-modern glass dark:glass-dark">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Flagged Activities
            {flaggedActivities.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {flaggedActivities.filter(item => !item.is_read).length} unread
              </Badge>
            )}
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchFlaggedActivities}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Review suspicious activity submissions flagged by the system
        </p>
      </CardHeader>
      <CardContent>
        {flaggedActivities.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No flagged activities found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Suspicious activities will appear here when detected
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {flaggedActivities.map((item) => {
              const isExpanded = expandedItems.has(item.id);
              const details = parseActivityDetails(item.message);
              
              return (
                <Collapsible key={item.id}>
                  <CollapsibleTrigger asChild>
                    <div
                      className={`w-full p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md ${
                        item.is_read 
                          ? 'bg-muted/20 border-border' 
                          : 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800'
                      }`}
                      onClick={() => toggleExpanded(item.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <div>
                            <p className="font-medium text-foreground">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{details.reason}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!item.is_read && (
                            <Badge variant="destructive" className="text-xs">New</Badge>
                          )}
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(item.created_at), 'MMM d, HH:mm')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="mt-2 p-4 bg-muted/30 rounded-lg border border-border/50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Activity Details
                          </h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Type:</span>
                              <span className="font-medium capitalize">{details.activityType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Duration:</span>
                              <span className="font-medium">{details.duration} minutes</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Calories:</span>
                              <span className="font-medium">{details.calories} cal</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Flag Reason
                          </h4>
                          <p className="text-sm text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/30 p-2 rounded">
                            {details.reason}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Actions
                          </h4>
                          <div className="space-y-2">
                            <Button variant="outline" size="sm" className="w-full">
                              Review User Profile
                            </Button>
                            <Button variant="outline" size="sm" className="w-full">
                              View Activity History
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <h4 className="font-medium text-sm text-foreground mb-2">Full Message</h4>
                        <p className="text-sm text-muted-foreground bg-background/50 p-3 rounded border">
                          {item.message}
                        </p>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};