
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStats } from '@/contexts/UserStatsContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Activity, Database, Users, Shield, CheckCircle, AlertTriangle, X } from 'lucide-react';

interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: string;
}

export const SystemHealthCheck = () => {
  const { user } = useAuth();
  const { stats } = useUserStats();
  const { role, isAdmin } = useUserRole();
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(false);

  const runHealthChecks = async () => {
    setLoading(true);
    const checks: HealthCheck[] = [];

    try {
      // Check authentication
      checks.push({
        name: 'Authentication',
        status: user ? 'pass' : 'fail',
        message: user ? 'User authenticated successfully' : 'No authenticated user',
        details: user ? `User ID: ${user.id}` : undefined
      });

      // Check user role system
      checks.push({
        name: 'User Roles',
        status: role ? 'pass' : 'warn',
        message: role ? `Role assigned: ${role}` : 'No role assigned',
        details: role ? `Is Admin: ${isAdmin()}` : undefined
      });

      // Check user stats
      checks.push({
        name: 'User Statistics',
        status: stats ? 'pass' : 'warn',
        message: stats ? 'Stats loaded successfully' : 'No stats available',
        details: stats ? `Steps: ${stats.today_steps}, Streak: ${stats.current_streak}` : undefined
      });

      // Check database connectivity
      try {
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        checks.push({
          name: 'Database Connection',
          status: error ? 'fail' : 'pass',
          message: error ? 'Database connection failed' : 'Database accessible',
          details: error ? error.message : 'Connection healthy'
        });
      } catch (error) {
        checks.push({
          name: 'Database Connection',
          status: 'fail',
          message: 'Database connection error',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Check events system
      try {
        const { data: events, error } = await supabase.from('events').select('count').limit(1);
        checks.push({
          name: 'Events System',
          status: error ? 'fail' : 'pass',
          message: error ? 'Events system unavailable' : 'Events system operational',
          details: error ? error.message : 'Can access events table'
        });
      } catch (error) {
        checks.push({
          name: 'Events System',
          status: 'fail',
          message: 'Events system error',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Check notifications system
      if (user) {
        try {
          const { data, error } = await supabase
            .from('notifications')
            .select('count')
            .eq('user_id', user.id)
            .limit(1);
          
          checks.push({
            name: 'Notifications',
            status: error ? 'fail' : 'pass',
            message: error ? 'Notifications unavailable' : 'Notifications working',
            details: error ? error.message : 'Can access notifications'
          });
        } catch (error) {
          checks.push({
            name: 'Notifications',
            status: 'fail',
            message: 'Notifications system error',
            details: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Check admin functionality (if admin)
      if (isAdmin()) {
        try {
          const { data, error } = await supabase.from('user_roles').select('count').limit(1);
          checks.push({
            name: 'Admin Functions',
            status: error ? 'fail' : 'pass',
            message: error ? 'Admin functions limited' : 'Admin functions available',
            details: error ? error.message : 'Can access user roles'
          });
        } catch (error) {
          checks.push({
            name: 'Admin Functions',
            status: 'fail',
            message: 'Admin system error',
            details: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

    } catch (error) {
      checks.push({
        name: 'System Error',
        status: 'fail',
        message: 'Unexpected system error during health check',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setHealthChecks(checks);
    setLoading(false);
  };

  useEffect(() => {
    runHealthChecks();
  }, [user, stats, role]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'fail':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge variant="default" className="bg-green-100 text-green-800">Pass</Badge>;
      case 'warn':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'fail':
        return <Badge variant="destructive">Fail</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const overallStatus = healthChecks.some(c => c.status === 'fail') ? 'fail' : 
                      healthChecks.some(c => c.status === 'warn') ? 'warn' : 'pass';

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Health Check
          </CardTitle>
          <div className="flex items-center gap-2">
            {getStatusBadge(overallStatus)}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={runHealthChecks}
              disabled={loading}
              className="ml-2"
            >
              {loading ? 'Checking...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {healthChecks.map((check, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="flex-shrink-0">
                {getStatusIcon(check.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{check.name}</h4>
                  {getStatusBadge(check.status)}
                </div>
                <p className="text-sm text-gray-600 mt-1">{check.message}</p>
                {check.details && (
                  <p className="text-xs text-gray-500 mt-1 font-mono">{check.details}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {healthChecks.length === 0 && !loading && (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No health checks run yet</p>
            <Button onClick={runHealthChecks} className="mt-2">
              Run Health Check
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
