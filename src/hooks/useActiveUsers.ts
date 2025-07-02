import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';

interface ActiveUser {
  user_id: string;
  name: string;
  email: string;
  department: string;
  last_seen: string;
  page_path: string;
  user_agent: string;
}

export const useActiveUsers = () => {
  const { isAdmin } = useUserRole();
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchActiveUsers = async () => {
    if (!isAdmin()) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      // Get users active within the last 5 minutes
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('user_sessions')
        .select('user_id, last_seen, page_path, user_agent')
        .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString())
        .order('last_seen', { ascending: false });

      if (sessionsError) throw sessionsError;

      if (!sessionsData || sessionsData.length === 0) {
        setActiveUsers([]);
        setLastRefresh(new Date());
        setLoading(false);
        return;
      }

      // Get the user IDs from sessions
      const userIds = sessionsData.map(session => session.user_id);

      // Fetch profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, department')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combine session and profile data
      const formattedUsers = sessionsData.map(session => {
        const profile = profilesData?.find(p => p.id === session.user_id);
        return {
          user_id: session.user_id,
          name: profile?.name || 'Unknown',
          email: profile?.email || 'No email',
          department: profile?.department || 'Unknown',
          last_seen: session.last_seen,
          page_path: session.page_path || '/',
          user_agent: session.user_agent || 'Unknown'
        };
      });

      setActiveUsers(formattedUsers);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching active users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin()) {
      fetchActiveUsers();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchActiveUsers, 30 * 1000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  return {
    activeUsers,
    loading,
    lastRefresh,
    fetchActiveUsers,
    isAdmin: isAdmin()
  };
};