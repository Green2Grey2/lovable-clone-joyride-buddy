import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Users, LogOut, UserCog, Key, Activity, TrendingUp, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { FloatingBottomNav } from '@/components/FloatingBottomNav';
import { ThemeToggle } from '@/components/ThemeToggle';

interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  totalSteps: number;
  status: 'active' | 'inactive';
  role: 'user' | 'manager';
}

const Manager = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'John Doe', email: 'john@company.com', department: 'Engineering', totalSteps: 234560, status: 'active', role: 'user' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@company.com', department: 'Engineering', totalSteps: 198340, status: 'active', role: 'manager' },
    { id: '3', name: 'Mike Chen', email: 'mike@company.com', department: 'Engineering', totalSteps: 167890, status: 'active', role: 'user' },
  ]);

  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const handlePasswordReset = (userId: string) => {
    console.log(`Password reset for user ${userId} to: ${newPassword}`);
    setResetPasswordUser(null);
    setNewPassword('');
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' as 'active' | 'inactive' }
        : user
    ));
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

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="glass dark:glass-dark backdrop-blur-xl sticky top-0 z-30 border-b border-border/50">
        <div className="px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Manager Dashboard</h1>
              <p className="text-muted-foreground text-sm">Manage your department team</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
              >
                <Activity className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">User View</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <Card className="card-modern glass dark:glass-dark">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
                <Users className="h-5 w-5 text-primary" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                {users.length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {users.filter(u => u.status === 'active').length} active
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-modern glass dark:glass-dark">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
                <TrendingUp className="h-5 w-5 text-primary" />
                Total Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                {users.reduce((sum, user) => sum + user.totalSteps, 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Department total</p>
            </CardContent>
          </Card>
          
          <Card className="card-modern glass dark:glass-dark sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
                <UserCog className="h-5 w-5 text-primary" />
                Average Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                {Math.round(users.reduce((sum, user) => sum + user.totalSteps, 0) / users.length).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Per team member</p>
            </CardContent>
          </Card>
        </div>

        {/* Team management */}
        <Card className="card-modern glass dark:glass-dark">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-5 sm:h-6 w-5 sm:w-6 text-primary" />
              Team Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mobile view - Card layout for small screens */}
            <div className="block sm:hidden space-y-4">
              {users.map((user) => (
                <Card key={user.id} className="bg-white/50 backdrop-blur-sm border border-white/30">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800">{user.name}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge variant={user.role === 'manager' ? 'default' : 'secondary'}
                                 className={user.role === 'manager' 
                                   ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs' 
                                   : 'bg-gray-200 text-gray-700 text-xs'
                                 }>
                            {user.role}
                          </Badge>
                          <Badge variant={user.status === 'active' ? 'default' : 'secondary'}
                                 className={user.status === 'active' 
                                   ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs' 
                                   : 'bg-gray-300 text-gray-600 text-xs'
                                 }>
                            {user.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-sm font-semibold text-gray-800">
                          {user.totalSteps.toLocaleString()} steps
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setResetPasswordUser(user)}
                              className="bg-white/80 hover:bg-blue-50 border-blue-200 text-blue-600 shadow-sm w-full"
                            >
                              <Key className="h-3 w-3 mr-1" />
                              Reset Password
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-md border border-white/30">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-bold text-gray-800">Reset Password</DialogTitle>
                              <DialogDescription className="text-gray-600">
                                Set a new password for {user.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <div>
                                <Label htmlFor="newPassword" className="text-gray-700 font-medium">New Password</Label>
                                <Input
                                  id="newPassword"
                                  type="password"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  className="mt-1 bg-white/80 border-gray-200"
                                  placeholder="Enter new password"
                                />
                              </div>
                              <div className="flex gap-2 pt-2">
                                <Button 
                                  onClick={() => handlePasswordReset(user.id)}
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg flex-1"
                                >
                                  Reset Password
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setResetPasswordUser(null)}
                                  className="bg-white/80 hover:bg-gray-50 flex-1"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleUserStatus(user.id)}
                          className={`shadow-sm w-full ${
                            user.status === 'active' 
                              ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-600' 
                              : 'bg-green-50 hover:bg-green-100 border-green-200 text-green-600'
                          }`}
                        >
                          {user.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop view - Table layout for larger screens */}
            <div className="hidden sm:block rounded-lg overflow-hidden border border-white/30">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-50/80 to-gray-100/60 backdrop-blur-sm">
                    <TableHead className="font-semibold text-gray-700">Name</TableHead>
                    <TableHead className="font-semibold text-gray-700">Email</TableHead>
                    <TableHead className="font-semibold text-gray-700">Role</TableHead>
                    <TableHead className="font-semibold text-gray-700">Total Steps</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, index) => (
                    <TableRow 
                      key={user.id}
                      className={`${index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/30'} backdrop-blur-sm hover:bg-blue-50/40 transition-colors`}
                    >
                      <TableCell className="font-medium text-gray-800">{user.name}</TableCell>
                      <TableCell className="text-gray-600">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'manager' ? 'default' : 'secondary'}
                               className={user.role === 'manager' 
                                 ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                                 : 'bg-gray-200 text-gray-700'
                               }>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-gray-800">
                        {user.totalSteps.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}
                               className={user.status === 'active' 
                                 ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                                 : 'bg-gray-300 text-gray-600'
                               }>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setResetPasswordUser(user)}
                                className="bg-white/80 hover:bg-blue-50 border-blue-200 text-blue-600 shadow-sm"
                              >
                                <Key className="h-3 w-3 mr-1" />
                                Reset Password
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-md border border-white/30">
                              <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-gray-800">Reset Password</DialogTitle>
                                <DialogDescription className="text-gray-600">
                                  Set a new password for {user.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 mt-4">
                                <div>
                                  <Label htmlFor="newPassword" className="text-gray-700 font-medium">New Password</Label>
                                  <Input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="mt-1 bg-white/80 border-gray-200"
                                    placeholder="Enter new password"
                                  />
                                </div>
                                <div className="flex gap-2 pt-2">
                                  <Button 
                                    onClick={() => handlePasswordReset(user.id)}
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
                                  >
                                    Reset Password
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setResetPasswordUser(null)}
                                    className="bg-white/80 hover:bg-gray-50"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleUserStatus(user.id)}
                            className={`shadow-sm ${
                              user.status === 'active' 
                                ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-600' 
                                : 'bg-green-50 hover:bg-green-100 border-green-200 text-green-600'
                            }`}
                          >
                            {user.status === 'active' ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <FloatingBottomNav />
    </div>
  );
};

export default Manager;
