
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole, AppRole } from '@/hooks/useUserRole';
import { Users, Search, UserX, UserCheck, Filter, Building2, Edit3 } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  department: string;
  created_at: string;
  role: AppRole;
  isActive: boolean;
}

export const UserManagement = () => {
  const { isAdmin } = useUserRole();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [newDepartment, setNewDepartment] = useState('');

  useEffect(() => {
    if (isAdmin()) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      // Get profiles with role information
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, department, created_at');

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Get available departments
      const { data: departmentSettings, error: deptError } = await supabase
        .from('department_settings')
        .select('department_name')
        .eq('is_active', true);

      if (deptError) throw deptError;

      const usersWithRoles = profiles?.map(profile => {
        const userRole = roles?.find(role => role.user_id === profile.id);
        return {
          id: profile.id,
          name: profile.name || 'Unknown User',
          email: profile.email || 'No email',
          department: profile.department || 'No department',
          created_at: profile.created_at || '',
          role: (userRole?.role || 'user') as AppRole,
          isActive: true // This would come from auth.users in a real implementation
        };
      }) || [];

      setUsers(usersWithRoles);
      setAvailableDepartments(departmentSettings?.map(d => d.department_name) || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserDepartment = async (userId: string, newDept: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ department: newDept })
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, department: newDept } : user
      ));
      
      toast.success('User department updated successfully');
      setEditingUser(null);
      setNewDepartment('');
    } catch (error) {
      console.error('Error updating department:', error);
      toast.error('Failed to update department');
    }
  };

  const removeUserFromDepartment = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ department: null })
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, department: 'No department' } : user
      ));
      
      toast.success('User removed from department');
    } catch (error) {
      console.error('Error removing from department:', error);
      toast.error('Failed to remove from department');
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    // In a real implementation, this would update the user's active status
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isActive: !currentStatus } : user
    ));
    toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || user.department === departmentFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesDepartment && matchesRole;
  });

  const departments = [...new Set(users.map(user => user.department))];

  if (!isAdmin()) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Admin access required for user management</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading users...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.department}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : user.role === 'manager' ? 'secondary' : 'outline'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'destructive'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleUserStatus(user.id, user.isActive)}
                      >
                        {user.isActive ? (
                          <>
                            <UserX className="h-4 w-4 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingUser(user);
                              setNewDepartment(user.department === 'No department' ? '' : user.department);
                            }}
                          >
                            <Building2 className="h-4 w-4 mr-1" />
                            Dept
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Manage Department for {user.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Current Department</Label>
                              <div className="text-lg font-semibold">{user.department}</div>
                            </div>
                            
                            <div>
                              <Label htmlFor="department-select">New Department</Label>
                              <Select 
                                value={newDepartment} 
                                onValueChange={setNewDepartment}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a department" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableDepartments.map(dept => (
                                    <SelectItem key={dept} value={dept}>
                                      {dept}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex justify-between">
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  removeUserFromDepartment(user.id);
                                  setEditingUser(null);
                                }}
                                disabled={user.department === 'No department'}
                              >
                                Remove from Department
                              </Button>
                              
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    setEditingUser(null);
                                    setNewDepartment('');
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => updateUserDepartment(user.id, newDepartment)}
                                  disabled={!newDepartment || newDepartment === user.department}
                                >
                                  Update Department
                                </Button>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{filteredUsers.length}</div>
              <div className="text-sm text-gray-600">Total Filtered</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {filteredUsers.filter(u => u.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {filteredUsers.filter(u => u.role === 'admin').length}
              </div>
              <div className="text-sm text-gray-600">Admins</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {filteredUsers.filter(u => u.role === 'manager').length}
              </div>
              <div className="text-sm text-gray-600">Managers</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
