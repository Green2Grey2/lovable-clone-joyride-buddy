
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface HeroActionCardProps {
  activeActivity: any;
  onPrimaryAction: () => void;
}

export const HeroActionCard = React.memo(({ 
  activeActivity, 
  onPrimaryAction 
}: HeroActionCardProps) => {
  return (
    <Card className="bg-gradient-to-br from-[#735CF7] to-[#00A3FF] border-0 rounded-3xl overflow-hidden relative h-56 shadow-[0px_20px_40px_rgba(115,92,247,0.3)]">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-pulse-subtle"></div>
        <div className="absolute bottom-6 left-6 w-24 h-24 bg-white/20 rounded-full blur-2xl animate-pulse-subtle [animation-delay:1s]"></div>
      </div>
      <CardContent className="relative z-10 p-8 h-full flex flex-col justify-center">
        <h2 className="text-white text-4xl font-bold mb-3 drop-shadow-lg">
          {activeActivity ? `Keep Going! 💪` : 'Burn your Calories'}
        </h2>
        <p className="text-white/90 text-xl mb-6 drop-shadow-sm">
          {activeActivity ? `You're currently ${activeActivity.name.toLowerCase()}` : 'Stay active, stay healthy'}
        </p>
        <Button 
          size="lg"
          className="bg-white text-[#735CF7] hover:bg-white/95 hover:scale-110 active:scale-105 font-bold text-lg px-8 py-4 rounded-2xl shadow-[0px_10px_25px_rgba(255,255,255,0.4)] hover:shadow-[0px_15px_35px_rgba(255,255,255,0.5)] transition-all duration-300 w-fit"
          onClick={onPrimaryAction}
          soundEnabled={false}
        >
          {activeActivity ? '🏃‍♀️ View Activity' : '🔥 Start Workout'}
        </Button>
      </CardContent>
    </Card>
  );
});

HeroActionCard.displayName = 'HeroActionCard';
