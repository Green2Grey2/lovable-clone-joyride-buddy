
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface GoalsEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoalsEditor = ({ isOpen, onClose }: GoalsEditorProps) => {
  const { userProfile, updateProfile } = useApp();
  const [weeklyGoal, setWeeklyGoal] = useState(userProfile.weeklyGoal);
  const [dailyGoal, setDailyGoal] = useState(Math.floor(userProfile.weeklyGoal / 7));
  const { playConfirm, playCancel, playSelect } = useSoundEffects();

  const handleSave = () => {
    updateProfile({ weeklyGoal });
    playConfirm();
    onClose();
  };

  const handleClose = () => {
    playCancel();
    onClose();
  };

  const handleInputChange = () => {
    playSelect();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl animate-in fade-in-0 zoom-in-95 duration-200">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-2xl font-bold text-foreground animate-in slide-in-from-top-2 duration-300">
            Goals & Targets 🎯
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="animate-in slide-in-from-left-2 duration-300 delay-75">
            <Label htmlFor="dailyGoal" className="transition-colors duration-200 hover:text-primary">Daily Step Goal</Label>
            <Input
              id="dailyGoal"
              type="number"
              value={dailyGoal}
              onChange={(e) => {
                handleInputChange();
                const daily = parseInt(e.target.value);
                setDailyGoal(daily);
                setWeeklyGoal(daily * 7);
              }}
              className="rounded-xl text-2xl font-bold text-center transition-all duration-200 focus:ring-2 hover:shadow-md"
            />
            <p className="text-sm text-muted-foreground mt-1 transition-colors duration-200 hover:text-muted-foreground/80">Recommended: 8,000-10,000 steps</p>
          </div>
          
          <div className="animate-in slide-in-from-left-2 duration-300 delay-100">
            <Label htmlFor="weeklyGoal" className="transition-colors duration-200 hover:text-primary">Weekly Step Goal</Label>
            <Input
              id="weeklyGoal"
              type="number"
              value={weeklyGoal}
              onChange={(e) => {
                handleInputChange();
                const weekly = parseInt(e.target.value);
                setWeeklyGoal(weekly);
                setDailyGoal(Math.floor(weekly / 7));
              }}
              className="rounded-xl text-2xl font-bold text-center transition-all duration-200 focus:ring-2 hover:shadow-md"
            />
            <p className="text-sm text-muted-foreground mt-1 transition-colors duration-200 hover:text-muted-foreground/80">This equals about {Math.floor(weeklyGoal / 7)} steps per day</p>
          </div>
        </div>
        
        <div className="flex gap-3 pt-4 animate-in slide-in-from-bottom-2 duration-300 delay-150">
          <Button 
            variant="outline" 
            className="flex-1 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={handleClose}
            soundEnabled={false}
          >
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-gradient-to-r from-primary to-primary/60 text-primary-foreground rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg">
            onClick={handleSave}
            soundEnabled={false}
          >
            Save Goals
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
