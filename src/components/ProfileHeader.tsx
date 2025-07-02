
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface ProfileHeaderProps {
  onGoalsEditorOpen: () => void;
}

export const ProfileHeader = React.memo(({ onGoalsEditorOpen }: ProfileHeaderProps) => {
  return (
    <div className="bg-white sticky top-0 z-30 border-b border-gray-100">
      <div className="px-6 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#1D244D] mb-1">
              Profile 👤
            </h1>
            <p className="text-[#8A94A6] text-sm">Manage your account and preferences</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-[#8A94A6] hover:bg-gray-50"
            onClick={onGoalsEditorOpen}
            soundEnabled={false}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
});

ProfileHeader.displayName = 'ProfileHeader';
