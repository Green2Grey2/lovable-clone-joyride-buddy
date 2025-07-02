
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Users, Trophy, MapPin } from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { DepartmentLeaderboard } from './DepartmentLeaderboard';
import { useChallengeSettings } from '@/hooks/useChallengeSettings';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const WalkingChallengeCountdown = () => {
  const { playSelect } = useSoundEffects();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isSignedUp, setIsSignedUp] = useState(false);
  const { challengeSettings } = useChallengeSettings();

  const challengeStartDate = new Date(challengeSettings.startDate + 'T00:00:00');
  const now = new Date();
  const challengeHasStarted = now >= challengeStartDate;

  useEffect(() => {
    if (challengeHasStarted) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = challengeStartDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [challengeStartDate, challengeHasStarted]);

  const handleSignUp = () => {
    playSelect();
    setIsSignedUp(true);
    console.log('User signed up for walking challenge');
  };

  const formatTime = (time: number) => time.toString().padStart(2, '0');
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (challengeHasStarted) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 hover:scale-105">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-800 text-sm">Department Walking Challenge</h3>
                  <p className="text-xs text-emerald-600">
                    Starts {formatDate(challengeSettings.startDate)} • Department vs Department
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs font-mono bg-white/50 px-2 py-1 rounded-lg">
                  <span className="text-emerald-700">{formatTime(timeLeft.days)}d</span>
                  <span className="text-emerald-600">:</span>
                  <span className="text-emerald-700">{formatTime(timeLeft.hours)}h</span>
                  <span className="text-emerald-600">:</span>
                  <span className="text-emerald-700">{formatTime(timeLeft.minutes)}m</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-600" />
            Department Walking Challenge
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Countdown Display */}
          <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
            <h3 className="text-lg font-semibold text-emerald-800 mb-4">Challenge Starts In:</h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="text-xl font-bold text-emerald-700">{formatTime(timeLeft.days)}</div>
                <div className="text-xs text-emerald-600">Days</div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="text-xl font-bold text-emerald-700">{formatTime(timeLeft.hours)}</div>
                <div className="text-xs text-emerald-600">Hours</div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="text-xl font-bold text-emerald-700">{formatTime(timeLeft.minutes)}</div>
                <div className="text-xs text-emerald-600">Minutes</div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="text-xl font-bold text-emerald-700">{formatTime(timeLeft.seconds)}</div>
                <div className="text-xs text-emerald-600">Seconds</div>
              </div>
            </div>
          </div>

          <DepartmentLeaderboard />

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-emerald-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800">Duration</h4>
                <p className="text-sm text-gray-600">
                  30 days from {formatDate(challengeSettings.startDate)} to {formatDate(challengeSettings.endDate)}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Trophy className="h-5 w-5 text-emerald-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800">Department Competition</h4>
                <p className="text-sm text-gray-600">Departments compete for the highest total steps. Individual goal: 10,000 steps daily</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-emerald-600 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800">Team Spirit</h4>
                <p className="text-sm text-gray-600">Your steps count towards your department's total. Work together to climb the leaderboard!</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            {isSignedUp ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold">🎉 You're signed up!</p>
                <p className="text-green-600 text-sm">We'll notify you when the challenge begins. Start training!</p>
              </div>
            ) : (
              <Button 
                onClick={handleSignUp}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3"
                soundEnabled={false}
              >
                Join Challenge for My Department 🚶‍♀️
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
