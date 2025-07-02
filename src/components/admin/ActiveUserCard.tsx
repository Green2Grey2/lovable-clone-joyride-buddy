import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ActiveUser {
  user_id: string;
  name: string;
  email: string;
  department: string;
  last_seen: string;
  page_path: string;
  user_agent: string;
}

interface ActiveUserCardProps {
  user: ActiveUser;
}

export const ActiveUserCard: React.FC<ActiveUserCardProps> = ({ user }) => {
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  const getBrowserFromUserAgent = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  return (
    <>
      <td>
        <div>
          <div className="font-medium">{user.name}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>
      </td>
      <td>
        <Badge variant="outline">{user.department}</Badge>
      </td>
      <td>
        <code className="text-sm bg-muted px-2 py-1 rounded">
          {user.page_path}
        </code>
      </td>
      <td>{getBrowserFromUserAgent(user.user_agent)}</td>
      <td>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          {getTimeAgo(user.last_seen)}
        </div>
      </td>
    </>
  );
};