
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProfileCardProps {
  userProfile: {
    name: string;
    department: string;
    joinDate: string;
  };
}

export const ProfileCard = React.memo(({ userProfile }: ProfileCardProps) => {
  return (
    <Card className="bg-gradient-to-br from-primary to-primary/60 border-0 rounded-3xl text-primary-foreground">
      <CardContent className="p-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-background/20 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold">{userProfile.name.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">{userProfile.name}</h2>
            <p className="text-primary-foreground/80 mb-2">{userProfile.department} Team</p>
            <Badge className="bg-background/20 text-primary-foreground border-primary-foreground/30">
              Member since {userProfile.joinDate}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ProfileCard.displayName = 'ProfileCard';
