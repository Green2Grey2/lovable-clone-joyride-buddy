import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Department {
  id: string;
  name: string;
  member_count: number;
  max_size: number;
}

interface DepartmentSelectorProps {
  selectedDepartment?: string;
  onDepartmentSelect: (departmentName: string) => void;
  showMemberCount?: boolean;
}

export const DepartmentSelector = ({ 
  selectedDepartment, 
  onDepartmentSelect, 
  showMemberCount = true 
}: DepartmentSelectorProps) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      // Get unique departments with member counts
      const { data, error } = await supabase
        .from('profiles')
        .select('department')
        .not('department', 'is', null);

      if (error) throw error;

      // Count members per department and create department objects
      const departmentCounts = data?.reduce((acc: Record<string, number>, profile) => {
        const dept = profile.department;
        if (dept) {
          acc[dept] = (acc[dept] || 0) + 1;
        }
        return acc;
      }, {}) || {};

      // Create department objects with default max_size of 100
      const departmentList: Department[] = Object.entries(departmentCounts).map(([name, count]) => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        member_count: count,
        max_size: 100 // Default size limit
      }));

      // Add some default departments if none exist
      if (departmentList.length === 0) {
        departmentList.push(
          { id: 'engineering', name: 'Engineering', member_count: 0, max_size: 100 },
          { id: 'marketing', name: 'Marketing', member_count: 0, max_size: 100 },
          { id: 'sales', name: 'Sales', member_count: 0, max_size: 100 },
          { id: 'design', name: 'Design', member_count: 0, max_size: 100 },
          { id: 'operations', name: 'Operations', member_count: 0, max_size: 100 },
          { id: 'hr', name: 'Human Resources', member_count: 0, max_size: 100 },
          { id: 'finance', name: 'Finance', member_count: 0, max_size: 100 }
        );
      }

      setDepartments(departmentList);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDepartmentClick = (departmentName: string) => {
    onDepartmentSelect(departmentName);
    toast.success(`Selected ${departmentName} department`);
  };

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
    <Card className="card-modern">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Select Your Department
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose the department you belong to
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

        {/* Department List */}
        <div className="grid gap-2 max-h-64 overflow-y-auto">
          {filteredDepartments.map((department) => (
            <Button
              key={department.id}
              variant={selectedDepartment === department.name ? "default" : "outline"}
              className="w-full justify-between h-auto p-4"
              onClick={() => handleDepartmentClick(department.name)}
            >
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4" />
                <span className="font-medium">{department.name}</span>
              </div>
              {showMemberCount && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {department.member_count}/{department.max_size}
                  </Badge>
                  {department.member_count >= department.max_size && (
                    <Badge variant="destructive" className="text-xs">
                      Full
                    </Badge>
                  )}
                </div>
              )}
            </Button>
          ))}
        </div>

        {filteredDepartments.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            No departments found matching "{searchTerm}"
          </div>
        )}

        {selectedDepartment && (
          <div className="bg-primary/10 rounded-lg p-3 mt-4">
            <p className="text-sm font-medium text-primary">
              Selected: {selectedDepartment}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};