import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users } from 'lucide-react';
import { ActiveUserCard } from './ActiveUserCard';

interface ActiveUser {
  user_id: string;
  name: string;
  email: string;
  department: string;
  last_seen: string;
  page_path: string;
  user_agent: string;
}

interface ActiveUsersTableProps {
  users: ActiveUser[];
  loading: boolean;
}

export const ActiveUsersTable: React.FC<ActiveUsersTableProps> = ({ users, loading }) => {
  if (loading && users.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-2">Loading active users...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No users currently active</p>
        <p className="text-sm text-muted-foreground mt-1">Users are considered active if seen within the last 5 minutes</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Current Page</TableHead>
            <TableHead>Browser</TableHead>
            <TableHead>Last Seen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.user_id}>
              <ActiveUserCard user={user} />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};