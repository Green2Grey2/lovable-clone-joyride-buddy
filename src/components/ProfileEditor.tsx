
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';

interface ProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileEditor = ({ isOpen, onClose }: ProfileEditorProps) => {
  const { userProfile, updateProfile } = useApp();
  const [formData, setFormData] = useState(userProfile);

  const handleSave = () => {
    updateProfile(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl animate-in fade-in-0 zoom-in-95 duration-200">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-2xl font-bold text-foreground animate-in slide-in-from-top-2 duration-300">
            Edit Profile ✏️
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="animate-in slide-in-from-left-2 duration-300 delay-75">
            <Label htmlFor="name" className="transition-colors duration-200 hover:text-primary">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="rounded-xl transition-all duration-200 focus:ring-2"
            />
          </div>
          
          <div className="animate-in slide-in-from-left-2 duration-300 delay-100">
            <Label htmlFor="email" className="transition-colors duration-200 hover:text-primary">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="rounded-xl transition-all duration-200 focus:ring-2"
            />
          </div>
          
          <div className="animate-in slide-in-from-left-2 duration-300 delay-150">
            <Label htmlFor="department" className="transition-colors duration-200 hover:text-primary">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="rounded-xl transition-all duration-200 focus:ring-2"
            />
          </div>
          
          <div className="animate-in slide-in-from-left-2 duration-300 delay-200">
            <Label htmlFor="weeklyGoal" className="transition-colors duration-200 hover:text-primary">Weekly Step Goal</Label>
            <Input
              id="weeklyGoal"
              type="number"
              value={formData.weeklyGoal}
              onChange={(e) => setFormData({ ...formData, weeklyGoal: parseInt(e.target.value) })}
              className="rounded-xl transition-all duration-200 focus:ring-2"
            />
          </div>
        </div>
        
        <div className="flex gap-3 pt-4 animate-in slide-in-from-bottom-2 duration-300 delay-250">
          <Button 
            variant="outline" 
            className="flex-1 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-primary to-primary/60 text-primary-foreground rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
