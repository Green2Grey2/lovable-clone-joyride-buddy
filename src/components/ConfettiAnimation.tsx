
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Sparkles } from 'lucide-react';

interface ConfettiAnimationProps {
  userName: string;
  eventName: string;
  onComplete: () => void;
}

export const ConfettiAnimation = ({ userName, eventName, onComplete }: ConfettiAnimationProps) => {
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(false);
      onComplete();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!showAnimation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 max-w-sm mx-4">
        <CardContent className="p-8 text-center">
          <div className="animate-bounce mb-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          </div>
          
          <div className="space-y-2 mb-4">
            <h2 className="text-2xl font-bold text-green-700 animate-pulse">
              🎉 Checked In! 🎉
            </h2>
            <p className="text-lg font-semibold text-gray-700">
              Welcome, {userName}!
            </p>
            <p className="text-sm text-gray-600">
              You're now registered for {eventName}
            </p>
          </div>

          <div className="flex justify-center space-x-1 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <Sparkles key={i} className="h-6 w-6 text-yellow-400" />
            ))}
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            This window will close automatically...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
