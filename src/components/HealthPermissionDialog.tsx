
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, Smartphone, Shield, CheckCircle } from 'lucide-react';
import { requestHealthDataPermission, saveHealthPermissionStatus } from '@/utils/healthDataPermissions';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface HealthPermissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HealthPermissionDialog = ({ isOpen, onClose }: HealthPermissionDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const { playConfirm, playCancel } = useSoundEffects();

  const handleRequestPermission = async () => {
    setIsLoading(true);
    try {
      const result = await requestHealthDataPermission();
      if (result.granted) {
        setPermissionGranted(true);
        saveHealthPermissionStatus(true);
        playConfirm();
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        console.error('Permission denied:', result.error);
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    playCancel();
    saveHealthPermissionStatus(false);
    onClose();
  };

  if (permissionGranted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md rounded-3xl text-center">
          <DialogHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-[#1D244D]">
              All Set! 🎉
            </DialogTitle>
          </DialogHeader>
          <p className="text-[#8A94A6] mb-6">
            Health data access granted! You'll now get more accurate calorie calculations and activity tracking.
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#735CF7] to-[#00A3FF] rounded-full flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-[#1D244D]">
            Access Health Data
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mb-6">
          <p className="text-[#8A94A6] text-center">
            To provide accurate calorie calculations and activity tracking, we'd like to access your device's health data.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Smartphone className="h-5 w-5 text-[#735CF7]" />
              <div>
                <p className="font-medium text-[#1D244D] text-sm">Steps & Activity</p>
                <p className="text-xs text-[#8A94A6]">Track your daily movement</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Heart className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium text-[#1D244D] text-sm">Heart Rate</p>
                <p className="text-xs text-[#8A94A6]">Monitor workout intensity</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-[#1D244D] text-sm">Privacy Protected</p>
                <p className="text-xs text-[#8A94A6]">Data stays on your device</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={handleRequestPermission}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#735CF7] to-[#00A3FF] text-white rounded-xl"
            soundEnabled={false}
          >
            {isLoading ? 'Requesting Permission...' : 'Allow Access'}
          </Button>
          
          <Button 
            variant="ghost"
            onClick={handleSkip}
            className="w-full text-[#8A94A6]"
            soundEnabled={false}
          >
            Skip for now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
