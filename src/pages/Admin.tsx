import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, LogOut, Activity, Shield, UserCog, Settings, Calendar, QrCode, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { FloatingBottomNav } from '@/components/FloatingBottomNav';
import { AdminRoleManager } from '@/components/AdminRoleManager';
import { SystemSettings } from '@/components/SystemSettings';
import { UserManagement } from '@/components/UserManagement';
import { EventManagement } from '@/components/EventManagement';
import { QRCodeScanner } from '@/components/QRCodeScanner';
import { UserCreation } from '@/components/UserCreation';
import { SystemHealthCheck } from '@/components/SystemHealthCheck';
import { supabase } from '@/integrations/supabase/client';
import { ActiveUsersMonitor } from '@/components/ActiveUsersMonitor';

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useUserRole();
  const { signOut } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    admins: 0,
    managers: 0,
    regularUsers: 0,
    totalEvents: 0,
    activeEvents: 0,
    totalAttendances: 0
  });

  useEffect(() => {
    if (isAdmin()) {
      fetchStats();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      // Get total users from profiles
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get role counts
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role');

      const roleCounts = roles?.reduce((acc, { role }) => {
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get event stats
      const { count: totalEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      const { count: activeEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const { count: totalAttendances } = await supabase
        .from('event_attendances')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: totalUsers || 0,
        admins: roleCounts.admin || 0,
        managers: roleCounts.manager || 0,
        regularUsers: roleCounts.user || 0,
        totalEvents: totalEvents || 0,
        activeEvents: activeEvents || 0,
        totalAttendances: totalAttendances || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">You need admin privileges to access this page.</p>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="glass dark:glass-dark backdrop-blur-xl sticky top-0 z-30 border-b border-border/50">
        <div className="px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Admin Dashboard</h1>
              <p className="text-muted-foreground text-sm">Olive View UCLA Medical Center</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                <Activity className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">User View</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Add Active Users Monitor */}
        <ActiveUsersMonitor />

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="glass dark:glass-dark p-1 rounded-lg shadow-premium grid w-full grid-cols-3 sm:grid-cols-7">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Events</span>
            </TabsTrigger>
            <TabsTrigger value="scanner" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              <span className="hidden sm:inline">Scanner</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              <span className="hidden sm:inline">Roles</span>
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Health</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
              <Card className="card-modern glass dark:glass-dark">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
                    <Users className="h-4 w-4" />
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.totalUsers}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Active employees</p>
                </CardContent>
              </Card>
              
              <Card className="card-modern glass dark:glass-dark">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-foreground">Regular Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.regularUsers}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Standard access</p>
                </CardContent>
              </Card>
              
              <Card className="card-modern glass dark:glass-dark">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-foreground">Managers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.managers}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Department managers</p>
                </CardContent>
              </Card>

              <Card className="card-modern glass dark:glass-dark">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-foreground">Admins</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.admins}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">System administrators</p>
                </CardContent>
              </Card>

              <Card className="card-modern glass dark:glass-dark">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-foreground">Total Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.totalEvents}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">All events</p>
                </CardContent>
              </Card>

              <Card className="card-modern glass dark:glass-dark">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-foreground">Active Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.activeEvents}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Currently active</p>
                </CardContent>
              </Card>

              <Card className="card-modern glass dark:glass-dark">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-foreground">Check-ins</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.totalAttendances}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Total attendances</p>
                </CardContent>
              </Card>
            </div>

            <Card className="card-modern glass dark:glass-dark">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Centralized user statistics implemented</p>
                      <p className="text-sm text-muted-foreground">All user activity data now flows through unified system</p>
                    </div>
                    <span className="text-xs text-muted-foreground">Just now</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Mobile responsiveness enhanced</p>
                      <p className="text-sm text-muted-foreground">All admin components optimized for mobile devices</p>
                    </div>
                    <span className="text-xs text-muted-foreground">Just now</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">System health monitoring added</p>
                      <p className="text-sm text-muted-foreground">Comprehensive system status checking implemented</p>
                    </div>
                    <span className="text-xs text-muted-foreground">Just now</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab - Now includes both user management and user creation */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div>
                <UserCreation />
              </div>
              <div>
                <UserManagement />
              </div>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <EventManagement />
          </TabsContent>

          {/* QR Scanner Tab */}
          <TabsContent value="scanner" className="space-y-6">
            <QRCodeScanner />
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-6">
            <AdminRoleManager />
          </TabsContent>

          {/* Health Check Tab */}
          <TabsContent value="health" className="space-y-6">
            <SystemHealthCheck />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <SystemSettings />
          </TabsContent>
        </Tabs>
      </div>

      <FloatingBottomNav />
    </div>
  );
};

export default Admin;
