
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, Bell, HelpCircle, LogOut, Target, Trophy, Shield, UserCog } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { toast } from 'sonner';

export const ProfileDropdown = () => {
  const navigate = useNavigate();
  const { userProfile } = useApp();
  const { signOut } = useAuth();
  const { isManager, isAdmin } = useUserRole();
  const { playSelect, playSoftClick } = useSoundEffects();

  const handleMenuClick = (action: () => void) => {
    playSelect();
    action();
  };

  const handleLogout = async () => {
    playSoftClick();
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-10 h-10 bg-gradient-to-br from-[#735CF7] to-[#00A3FF] rounded-full flex items-center justify-center p-0 hover:scale-110 transition-all duration-200"
          soundEnabled={false}
        >
          <span className="text-white font-semibold text-sm">{userProfile.name.charAt(0)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mr-4" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userProfile.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userProfile.department} Team
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleMenuClick(() => navigate('/profile'))}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleMenuClick(() => navigate('/awards'))}>
          <Trophy className="mr-2 h-4 w-4" />
          <span>Awards</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleMenuClick(() => console.log('Goals - Coming soon!'))}>
          <Target className="mr-2 h-4 w-4" />
          <span>Goals</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleMenuClick(() => console.log('Settings - Coming soon!'))}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleMenuClick(() => console.log('Help - Coming soon!'))}>
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help & Support</span>
        </DropdownMenuItem>
        
        {/* Role-based menu items */}
        {(isManager() || isAdmin()) && <DropdownMenuSeparator />}
        
        {isManager() && (
          <DropdownMenuItem onClick={() => handleMenuClick(() => navigate('/manager'))}>
            <UserCog className="mr-2 h-4 w-4" />
            <span>Manager Dashboard</span>
          </DropdownMenuItem>
        )}
        
        {isAdmin() && (
          <DropdownMenuItem onClick={() => handleMenuClick(() => navigate('/admin'))}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Admin Dashboard</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
