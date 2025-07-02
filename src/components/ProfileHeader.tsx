
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface ProfileHeaderProps {
  onGoalsEditorOpen: () => void;
}

export const ProfileHeader = React.memo(({ onGoalsEditorOpen }: ProfileHeaderProps) => {
  return (
    <div className="bg-card sticky top-0 z-30 border-b border-border">
      <div className="px-6 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Profile 👤
            </h1>
            <p className="text-muted-foreground text-sm">Manage your account and preferences</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-muted-foreground hover:bg-muted"
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
