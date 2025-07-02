
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, Clock, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface ActivitySelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActivitySelector = ({ isOpen, onClose }: ActivitySelectorProps) => {
  const navigate = useNavigate();
  const { startActivity } = useApp();
  const { playStartActivity, playCancel, playSwoosh } = useSoundEffects();

  const activities = [
    {
      id: 'walking',
      name: 'Walking',
      icon: '🚶‍♀️',
      description: 'Light cardio activity',
      duration: '30 min',
      calories: '150 cal'
    },
    {
      id: 'running',
      name: 'Running',
      icon: '🏃‍♀️',
      description: 'High intensity cardio',
      duration: '25 min',
      calories: '300 cal'
    },
    {
      id: 'cycling',
      name: 'Cycling',
      icon: '🚴‍♀️',
      description: 'Low impact cardio',
      duration: '45 min',
      calories: '250 cal'
    },
    {
      id: 'yoga',
      name: 'Yoga',
      icon: '🧘‍♀️',
      description: 'Flexibility and mindfulness',
      duration: '60 min',
      calories: '120 cal'
    }
  ];

  const handleStartActivity = (activity: any) => {
    console.log(`Starting ${activity.name} activity`);
    playStartActivity();
    startActivity(activity);
    onClose();
    navigate('/active-activity');
  };

  const handleClose = () => {
    playCancel();
    onClose();
  };

  const handleActivityHover = () => {
    playSwoosh();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl animate-in fade-in-0 zoom-in-95 duration-200 shadow-xl dark:shadow-primary/30">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-2xl font-bold text-foreground animate-in slide-in-from-top-2 duration-300">
            Start an Activity 🏃‍♀️
          </DialogTitle>
          <p className="text-muted-foreground animate-in slide-in-from-top-2 duration-300 delay-75">Choose an activity to begin tracking</p>
        </DialogHeader>
        
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className="bg-card border-2 border-border rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 cursor-pointer animate-in slide-in-from-left-2 group"
              style={{ animationDelay: `${100 + index * 50}ms` }}
              onClick={() => handleStartActivity(activity)}
              onMouseEnter={handleActivityHover}
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl transition-transform duration-200 group-hover:scale-110">{activity.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground text-xl transition-colors duration-200 group-hover:text-primary">{activity.name}</h3>
                  <p className="text-muted-foreground text-sm mb-3 transition-colors duration-200">{activity.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground transition-colors duration-200 group-hover:text-foreground/80">
                      <Clock className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                      <span className="font-medium">{activity.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground transition-colors duration-200 group-hover:text-foreground/80">
                      <Target className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                      <span className="font-medium">{activity.calories}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-primary to-blue-500 text-primary-foreground rounded-2xl px-6 py-3 transition-all duration-200 hover:scale-110 active:scale-105 hover:shadow-xl font-semibold text-base"
                  soundEnabled={false}
                >
                  <Play className="h-5 w-5 mr-2 transition-transform duration-200 group-hover:scale-110" />
                  Start
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="pt-4 animate-in slide-in-from-bottom-2 duration-300 delay-300">
          <Button 
            variant="outline" 
            className="w-full rounded-2xl py-3 text-base font-semibold transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-muted"
            onClick={handleClose}
            soundEnabled={false}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
