import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useHapticFeedback } from '@/hooks/useGestures';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface WorkoutPhase {
  name: string;
  duration: number; // seconds
  type: 'work' | 'rest' | 'prepare';
  color: string;
}

interface WorkoutTimerProps {
  phases?: WorkoutPhase[];
  onComplete?: () => void;
  autoStart?: boolean;
}

export const WorkoutTimer: React.FC<WorkoutTimerProps> = ({
  phases = [
    { name: 'Prepare', duration: 10, type: 'prepare', color: 'text-yellow-500' },
    { name: 'Work', duration: 30, type: 'work', color: 'text-green-500' },
    { name: 'Rest', duration: 10, type: 'rest', color: 'text-blue-500' },
  ],
  onComplete,
  autoStart = false
}) => {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(phases[0].duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isCountdown, setIsCountdown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);
  
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const { mediumTap, successPattern, errorPattern } = useHapticFeedback();
  const { playClick, playSuccess, playError } = useSoundEffects();

  const currentPhase = phases[currentPhaseIndex];
  const progress = ((currentPhase.duration - timeRemaining) / currentPhase.duration) * 100;

  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = performance.now();
      const animate = (currentTime: number) => {
        const deltaTime = (currentTime - lastTimeRef.current) / 1000;
        lastTimeRef.current = currentTime;

        setTimeRemaining(prev => {
          const newTime = Math.max(0, prev - deltaTime);
          
          if (newTime === 0) {
            handlePhaseComplete();
            return phases[currentPhaseIndex + 1]?.duration || 0;
          }
          
          return newTime;
        });

        setTotalElapsed(prev => prev + deltaTime);
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, currentPhaseIndex]);

  const startCountdown = () => {
    setIsCountdown(true);
    setCountdownValue(3);
    
    let count = 3;
    const countdownInterval = setInterval(() => {
      if (soundEnabled) {
        playClick();
      }
      mediumTap();
      
      count--;
      setCountdownValue(count);
      
      if (count === 0) {
        clearInterval(countdownInterval);
        setIsCountdown(false);
        setIsRunning(true);
        if (soundEnabled) {
          playSuccess();
        }
        successPattern();
      }
    }, 1000);
  };

  const announcePhase = (phase: WorkoutPhase) => {
    if (soundEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(phase.name);
      utterance.rate = 1.2;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handlePhaseComplete = () => {
    if (soundEnabled) {
      if (currentPhase.type === 'work') {
        playSuccess();
      } else {
        playClick();
      }
    }
    
    if (currentPhase.type === 'work') {
      successPattern();
    } else {
      mediumTap();
    }

    if (currentPhaseIndex < phases.length - 1) {
      const nextPhaseIndex = currentPhaseIndex + 1;
      const nextPhase = phases[nextPhaseIndex];
      
      setCurrentPhaseIndex(nextPhaseIndex);
      
      // Start countdown for work phases
      if (nextPhase.type === 'work') {
        setIsRunning(false);
        setTimeout(() => {
          announcePhase(nextPhase);
          startCountdown();
        }, 500);
      } else {
        // Announce non-work phases immediately
        setTimeout(() => announcePhase(nextPhase), 100);
      }
    } else {
      setIsRunning(false);
      if (onComplete) onComplete();
      errorPattern(); // Completion pattern
      if (soundEnabled && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Workout Complete');
        utterance.rate = 1.2;
        utterance.volume = 0.8;
        speechSynthesis.speak(utterance);
      }
    }
  };

  const toggleTimer = () => {
    if (!isRunning && !isCountdown) {
      startCountdown();
    } else {
      setIsRunning(!isRunning);
    }
    mediumTap();
    if (soundEnabled) playClick();
  };

  const resetTimer = () => {
    setIsRunning(false);
    setCurrentPhaseIndex(0);
    setTimeRemaining(phases[0].duration);
    setTotalElapsed(0);
    mediumTap();
    if (soundEnabled) playClick();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseGradient = () => {
    switch (currentPhase.type) {
      case 'work': return 'from-green-500/20 to-emerald-500/20';
      case 'rest': return 'from-blue-500/20 to-cyan-500/20';
      case 'prepare': return 'from-yellow-500/20 to-orange-500/20';
    }
  };

  return (
    <Card className="card-modern glass dark:glass-dark overflow-hidden">
      <CardContent className="p-6">
        {/* Timer Display */}
        <div className="relative w-80 h-80 max-w-xs max-h-xs mx-auto mb-6">
          {/* Background circle */}
          <svg 
            className="w-full h-full transform -rotate-90" 
            viewBox="0 0 200 200"
            preserveAspectRatio="xMidYMid meet"
          >
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/20"
            />
            {/* Progress circle */}
            <motion.circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className={currentPhase.color}
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 90}`}
              animate={{
                strokeDashoffset: `${2 * Math.PI * 90 * (1 - progress / 100)}`
              }}
              transition={{
                duration: 0.5,
                ease: "linear"
              }}
            />
          </svg>
          
          {/* Timer text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {isCountdown ? (
                <motion.div
                  key="countdown"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  className="text-center"
                >
                  <h3 className="text-lg font-semibold mb-1 text-orange-500">
                    Get Ready
                  </h3>
                  <p className="text-6xl font-bold text-orange-500">
                    {countdownValue}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={currentPhase.name}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="text-center"
                >
                  <h3 className={cn("text-lg font-semibold mb-1", currentPhase.color)}>
                    {currentPhase.name}
                  </h3>
                  <p className="text-5xl font-bold text-foreground">
                    {formatTime(timeRemaining)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Phase indicators */}
        <div className="flex justify-center gap-2 mb-6">
          {phases.map((phase, index) => (
            <div
              key={index}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentPhaseIndex 
                  ? `w-8 ${phase.type === 'work' ? 'bg-green-500' : phase.type === 'rest' ? 'bg-blue-500' : 'bg-yellow-500'}`
                  : index < currentPhaseIndex
                  ? 'w-4 bg-muted-foreground/50'
                  : 'w-4 bg-muted/50'
              )}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            size="icon"
            variant="outline"
            onClick={resetTimer}
            className="rounded-full"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button
            size="lg"
            onClick={toggleTimer}
            className={cn(
              "rounded-full w-20 h-20 text-lg font-semibold shadow-lg",
              `bg-gradient-to-br ${getPhaseGradient()}`,
              "hover:scale-105 transition-transform"
            )}
          >
            {isRunning ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8 ml-1" />
            )}
          </Button>
          
          <Button
            size="icon"
            variant="outline"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="rounded-full"
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Phase</p>
            <p className="text-sm font-semibold">
              {currentPhaseIndex + 1}/{phases.length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total Time</p>
            <p className="text-sm font-semibold">{formatTime(totalElapsed)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className="text-sm font-semibold">
              {formatTime(
                phases.slice(currentPhaseIndex).reduce((sum, p) => sum + p.duration, 0) - 
                (currentPhase.duration - timeRemaining)
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};