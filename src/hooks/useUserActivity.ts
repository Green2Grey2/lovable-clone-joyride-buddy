
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useUserActivity = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Update user session on mount and page changes
    const updateSession = async () => {
      try {
        await supabase.rpc('update_user_session', {
          _user_id: user.id,
          _session_id: 'web-session',
          _page_path: window.location.pathname,
          _user_agent: navigator.userAgent
        });
      } catch (error) {
        console.error('Error updating user session:', error);
      }
    };

    // Update session immediately
    updateSession();

    // Set up periodic updates every 2 minutes
    const interval = setInterval(updateSession, 2 * 60 * 1000);

    // Update session on page visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateSession();
      }
    };

    // Update session on route changes
    const handleRouteChange = () => {
      updateSession();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [user]);
};
