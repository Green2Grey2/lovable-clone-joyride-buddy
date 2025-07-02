import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Plus, Edit2, Users, Search, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Department {
  name: string;
  member_count: number;
  max_size: number;
}

interface DepartmentSetting {
  id: string;
  department_name: string;
  max_size: number;
  is_active: boolean;
  created_at: string;
}

export const DepartmentManagement = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentSettings, setDepartmentSettings] = useState<DepartmentSetting[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptMaxSize, setNewDeptMaxSize] = useState(100);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      
      // Get departments from profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('department')
        .not('department', 'is', null);

      if (profilesError) throw profilesError;

      // Count members per department
      const departmentCounts = profilesData?.reduce((acc: Record<string, number>, profile) => {
        const dept = profile.department;
        if (dept) {
          acc[dept] = (acc[dept] || 0) + 1;
        }
        return acc;
      }, {}) || {};

      // Get department settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('department_settings')
        .select('*')
        .eq('is_active', true);

      if (settingsError) {
        console.error('Department settings error:', settingsError);
        throw settingsError;
      }

      // Merge department data with settings
      const departmentList: Department[] = Object.entries(departmentCounts).map(([name, count]) => {
        const setting = settingsData?.find(s => s.department_name === name);
        return {
          name,
          member_count: count,
          max_size: setting?.max_size || 100
        };
      });

      // Add departments that exist in settings but have no members
      settingsData?.forEach(setting => {
        if (!departmentCounts[setting.department_name]) {
          departmentList.push({
            name: setting.department_name,
            member_count: 0,
            max_size: setting.max_size
          });
        }
      });

      setDepartments(departmentList);
      setDepartmentSettings(settingsData || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const createDepartmentSettingsTable = async () => {
    // This will be handled by a migration
    toast.info('Department settings table needs to be created. Please run the migration.');
  };

  const saveDepartmentSetting = async (name: string, maxSize: number) => {
    try {
      const { error } = await supabase
        .from('department_settings')
        .upsert({
          department_name: name,
          max_size: maxSize,
          is_active: true
        }, {
          onConflict: 'department_name'
        });

      if (error) throw error;

      toast.success(`Department ${name} settings saved`);
      fetchDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
      toast.error('Failed to save department settings');
    }
  };

  const handleAddDepartment = async () => {
    if (!newDeptName.trim()) {
      toast.error('Department name is required');
      return;
    }

    await saveDepartmentSetting(newDeptName.trim(), newDeptMaxSize);
    setNewDeptName('');
    setNewDeptMaxSize(100);
    setIsAddDialogOpen(false);
  };

  const handleEditDepartment = async () => {
    if (!editingDept) return;

    await saveDepartmentSetting(editingDept.name, editingDept.max_size);
    setEditingDept(null);
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card className="card-modern">
        <CardContent className="p-6">
          <div className="text-center">Loading departments...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="card-modern glass dark:glass-dark">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Department Management
            </CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Department
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Department</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dept-name">Department Name</Label>
                    <Input
                      id="dept-name"
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      placeholder="Enter department name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dept-size">Maximum Size</Label>
                    <Input
                      id="dept-size"
                      type="number"
                      value={newDeptMaxSize}
                      onChange={(e) => setNewDeptMaxSize(parseInt(e.target.value) || 100)}
                      min="1"
                      max="1000"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddDepartment}>
                      Add Department
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage departments, set size limits, and monitor membership
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Department Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="card-modern">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{departments.length}</div>
                <div className="text-sm text-muted-foreground">Total Departments</div>
              </CardContent>
            </Card>
            <Card className="card-modern">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {departments.reduce((sum, dept) => sum + dept.member_count, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Members</div>
              </CardContent>
            </Card>
            <Card className="card-modern">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {departments.filter(dept => dept.member_count >= dept.max_size).length}
                </div>
                <div className="text-sm text-muted-foreground">Full Departments</div>
              </CardContent>
            </Card>
          </div>

          {/* Department List */}
          <div className="space-y-3">
            {filteredDepartments.map((department) => (
              <Card key={department.name} className="card-modern">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-semibold">{department.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {department.member_count}/{department.max_size} members
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={department.member_count >= department.max_size ? "destructive" : "secondary"}
                      >
                        {department.member_count >= department.max_size ? 'Full' : 'Open'}
                      </Badge>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingDept(department)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit {department.name}</DialogTitle>
                          </DialogHeader>
                          {editingDept && (
                            <div className="space-y-4">
                              <div>
                                <Label>Department Name</Label>
                                <Input
                                  value={editingDept.name}
                                  disabled
                                  className="bg-muted"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Department name cannot be changed
                                </p>
                              </div>
                              <div>
                                <Label htmlFor="edit-size">Maximum Size</Label>
                                <Input
                                  id="edit-size"
                                  type="number"
                                  value={editingDept.max_size}
                                  onChange={(e) => setEditingDept({
                                    ...editingDept,
                                    max_size: parseInt(e.target.value) || 100
                                  })}
                                  min="1"
                                  max="1000"
                                />
                              </div>
                              <div>
                                <Label>Current Members</Label>
                                <div className="text-lg font-semibold">{editingDept.member_count}</div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setEditingDept(null)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleEditDepartment}>
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredDepartments.length === 0 && (
              <Card className="card-modern">
                <CardContent className="p-8 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No departments found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? `No departments match "${searchTerm}"` : 'No departments have been created yet'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};