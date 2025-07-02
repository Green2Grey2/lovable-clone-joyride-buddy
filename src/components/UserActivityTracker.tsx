
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserActivity } from '@/hooks/useUserActivity';

export const UserActivityTracker = () => {
  const { user } = useAuth();
  
  // Only track activity when user is authenticated
  useUserActivity();
  
  return null; // This component doesn't render anything
};
