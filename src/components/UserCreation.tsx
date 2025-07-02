
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export const UserCreation = () => {
  const { isAdmin } = useUserRole();
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    department: '',
    role: 'user' as 'user' | 'manager' | 'admin'
  });

  const createUser = async () => {
    if (!newUser.email || !newUser.name) {
      toast.error('Email and name are required');
      return;
    }

    setLoading(true);
    try {
      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';

      // Create user with proper metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: tempPassword,
        options: {
          data: {
            name: newUser.name,
            department: newUser.department || 'Fitness'
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) throw new Error('Failed to create user');

      // The trigger will automatically create profile and default role
      // If role is not default, update it
      if (newUser.role !== 'user') {
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: newUser.role })
          .eq('user_id', authData.user.id);

        if (roleError) throw roleError;
      }

      // Create initial stats for the user
      const { error: statsError } = await supabase
        .from('user_stats')
        .insert([{
          user_id: authData.user.id,
          today_steps: 0,
          weekly_steps: 0,
          current_streak: 0,
          water_intake: 0,
          calories_burned: 0,
          heart_rate: 75
        }]);

      if (statsError) {
        console.warn('Could not create initial stats:', statsError);
      }

      toast.success(`User created successfully! Temporary password: ${tempPassword}`);
      
      // Reset form
      setNewUser({
        email: '',
        name: '',
        department: '',
        role: 'user'
      });

    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin()) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Admin access required</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Create New User
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
            placeholder="john.doe@company.com"
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={newUser.name}
            onChange={(e) => setNewUser({...newUser, name: e.target.value})}
            placeholder="John Doe"
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            value={newUser.department}
            onChange={(e) => setNewUser({...newUser, department: e.target.value})}
            placeholder="Engineering"
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="role">Role</Label>
          <Select value={newUser.role} onValueChange={(value: 'user' | 'manager' | 'admin') => setNewUser({...newUser, role: value})}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={createUser} 
          disabled={loading || !newUser.email || !newUser.name}
          className="w-full"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating User...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Create User
            </>
          )}
        </Button>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> A temporary password will be generated and displayed after user creation. 
            Make sure to share it with the new user so they can log in and change their password.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
