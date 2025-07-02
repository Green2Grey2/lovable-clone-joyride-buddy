
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useActiveUsers } from '@/hooks/useActiveUsers';
import { ActiveUsersTable } from '@/components/admin/ActiveUsersTable';
import { ActivityTrackingInfo } from '@/components/admin/ActivityTrackingInfo';

export const ActiveUsersMonitor = () => {
  const { activeUsers, loading, lastRefresh, fetchActiveUsers, isAdmin } = useActiveUsers();

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Admin access required</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Active Users
            <Badge variant="secondary">{activeUsers.length}</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchActiveUsers}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ActiveUsersTable users={activeUsers} loading={loading} />
        <ActivityTrackingInfo />
      </CardContent>
    </Card>
  );
};
