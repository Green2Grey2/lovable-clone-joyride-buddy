import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useGestures';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  Zap, 
  Heart,
  Flame,
  Crown
} from 'lucide-react';

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocity: { x: number; y: number };
  gravity: number;
  life: number;
}

interface CelebrationProps {
  isVisible: boolean;
  onComplete?: () => void;
  type?: 'achievement' | 'milestone' | 'streak' | 'challenge' | 'levelup';
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  duration?: number;
}

export const ConfettiExplosion: React.FC<{
  isActive: boolean;
  intensity?: 'low' | 'medium' | 'high';
  colors?: string[];
}> = ({ 
  isActive, 
  intensity = 'medium',
  colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F']
}) => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const { preferences } = useUserPreferences();

  const particleCount = {
    low: 30,
    medium: 60,
    high: 100
  }[intensity];

  useEffect(() => {
    if (!isActive || !preferences.showAnimations) return;

    const newParticles: ConfettiParticle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        velocity: {
          x: (Math.random() - 0.5) * 10,
          y: Math.random() * 3 + 2
        },
        gravity: Math.random() * 0.1 + 0.05,
        life: 1
      });
    }
    
    setParticles(newParticles);

    const animateParticles = () => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.velocity.x,
          y: particle.y + particle.velocity.y,
          velocity: {
            ...particle.velocity,
            y: particle.velocity.y + particle.gravity
          },
          rotation: particle.rotation + 5,
          life: particle.life - 0.008
        })).filter(particle => particle.life > 0 && particle.y < window.innerHeight + 50)
      );
    };

    const interval = setInterval(animateParticles, 16);

    return () => {
      clearInterval(interval);
      setParticles([]);
    };
  }, [isActive, particleCount, colors, preferences.showAnimations]);

  if (!preferences.showAnimations) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            backgroundColor: particle.color,
            width: particle.size,
            height: particle.size,
            transform: `rotate(${particle.rotation}deg)`,
            opacity: particle.life
          }}
        />
      ))}
    </div>
  );
};

export const FireworksBurst: React.FC<{
  isActive: boolean;
  centerX?: number;
  centerY?: number;
}> = ({ isActive, centerX = 0.5, centerY = 0.3 }) => {
  const [bursts, setBursts] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const { preferences } = useUserPreferences();

  useEffect(() => {
    if (!isActive || !preferences.showAnimations) return;

    const newBursts = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: (centerX + (Math.random() - 0.5) * 0.4) * window.innerWidth,
      y: (centerY + (Math.random() - 0.5) * 0.3) * window.innerHeight,
      delay: i * 200
    }));

    setBursts(newBursts);

    const timeout = setTimeout(() => setBursts([]), 3000);
    return () => clearTimeout(timeout);
  }, [isActive, centerX, centerY, preferences.showAnimations]);

  if (!preferences.showAnimations) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {bursts.map(burst => (
        <motion.div
          key={burst.id}
          className="absolute"
          style={{ left: burst.x, top: burst.y }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0],
          }}
          transition={{ 
            duration: 0.8,
            delay: burst.delay / 1000,
            ease: "easeOut"
          }}
        >
          <div className="w-32 h-32 rounded-full bg-gradient-radial from-yellow-400 via-orange-500 to-transparent" />
        </motion.div>
      ))}
    </div>
  );
};

export const FloatingElements: React.FC<{
  isActive: boolean;
  elements?: React.ReactNode[];
  count?: number;
}> = ({ 
  isActive, 
  elements = [<Star key="star" className="w-6 h-6 text-yellow-400" />],
  count = 10 
}) => {
  const { preferences } = useUserPreferences();

  if (!preferences.showAnimations) return null;

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-40">
          {Array.from({ length: count }).map((_, index) => (
            <motion.div
              key={index}
              className="absolute"
              initial={{
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 50,
                opacity: 0,
                scale: 0
              }}
              animate={{
                y: -50,
                opacity: [0, 1, 1, 0],
                scale: [0, 1, 1, 0],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 2,
                ease: "easeOut"
              }}
            >
              {elements[index % elements.length]}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

export const CelebrationModal: React.FC<CelebrationProps> = ({
  isVisible,
  onComplete,
  type = 'achievement',
  title,
  description,
  icon,
  duration = 3000
}) => {
  const { successPattern } = useHapticFeedback();
  const { preferences } = useUserPreferences();
  const [showConfetti, setShowConfetti] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);

  const celebrationConfig = {
    achievement: {
      title: title || 'Achievement Unlocked!',
      icon: icon || <Trophy className="w-16 h-16 text-yellow-500" />,
      bgGradient: 'from-yellow-400 to-orange-500',
      confetti: true,
      fireworks: false,
      intensity: 'medium' as const
    },
    milestone: {
      title: title || 'Milestone Reached!',
      icon: icon || <Target className="w-16 h-16 text-blue-500" />,
      bgGradient: 'from-blue-400 to-purple-500',
      confetti: true,
      fireworks: true,
      intensity: 'high' as const
    },
    streak: {
      title: title || 'Streak Bonus!',
      icon: icon || <Flame className="w-16 h-16 text-red-500" />,
      bgGradient: 'from-red-400 to-pink-500',
      confetti: false,
      fireworks: false,
      intensity: 'low' as const
    },
    challenge: {
      title: title || 'Challenge Complete!',
      icon: icon || <Award className="w-16 h-16 text-green-500" />,
      bgGradient: 'from-green-400 to-emerald-500',
      confetti: true,
      fireworks: true,
      intensity: 'high' as const
    },
    levelup: {
      title: title || 'Level Up!',
      icon: icon || <Crown className="w-16 h-16 text-purple-500" />,
      bgGradient: 'from-purple-400 to-indigo-500',
      confetti: true,
      fireworks: true,
      intensity: 'high' as const
    }
  };

  const config = celebrationConfig[type];

  useEffect(() => {
    if (isVisible) {
      if (preferences.hapticEnabled) {
        successPattern();
      }
      
      if (config.confetti) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
      
      if (config.fireworks) {
        setTimeout(() => setShowFireworks(true), 500);
        setTimeout(() => setShowFireworks(false), 2500);
      }

      if (duration > 0) {
        const timer = setTimeout(() => {
          onComplete?.();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, config, preferences.hapticEnabled, duration, onComplete, successPattern]);

  return (
    <>
      {/* Celebration Effects */}
      <ConfettiExplosion isActive={showConfetti} intensity={config.intensity} />
      <FireworksBurst isActive={showFireworks} />
      <FloatingElements 
        isActive={isVisible && type === 'streak'} 
        elements={[
          <Flame key="flame" className="w-8 h-8 text-orange-400" />,
          <Zap key="zap" className="w-8 h-8 text-yellow-400" />
        ]}
        count={8}
      />

      {/* Modal */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onComplete}
          >
            <motion.div
              className={cn(
                "bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl",
                "relative overflow-hidden"
              )}
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ 
                scale: [0.5, 1.1, 1],
                opacity: 1,
                y: 0
              }}
              exit={{ scale: 0.5, opacity: 0, y: 50 }}
              transition={{ 
                type: "spring",
                duration: 0.6,
                bounce: 0.4
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background Gradient */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-10",
                config.bgGradient
              )} />

              {/* Content */}
              <div className="relative z-10 space-y-6">
                {/* Icon with Pulse Animation */}
                <motion.div
                  className="flex justify-center"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {config.icon}
                </motion.div>

                {/* Title */}
                <motion.h2
                  className="text-2xl font-bold text-gray-900"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {config.title}
                </motion.h2>

                {/* Description */}
                {description && (
                  <motion.p
                    className="text-gray-600"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {description}
                  </motion.p>
                )}

                {/* Hearts Animation for Special Achievements */}
                {type === 'milestone' && (
                  <motion.div
                    className="flex justify-center space-x-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {Array.from({ length: 3 }).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      >
                        <Heart className="w-6 h-6 text-red-400 fill-current" />
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Tap to Continue */}
                <motion.p
                  className="text-sm text-gray-400 mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  Tap anywhere to continue
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Hook for triggering celebrations
export const useCelebration = () => {
  const [celebration, setCelebration] = useState<{
    isVisible: boolean;
    type: CelebrationProps['type'];
    title?: string;
    description?: string;
  }>({
    isVisible: false,
    type: 'achievement'
  });

  const celebrate = (config: Omit<CelebrationProps, 'isVisible' | 'onComplete'>) => {
    setCelebration({
      isVisible: true,
      ...config
    });
  };

  const hideCelebration = () => {
    setCelebration(prev => ({ ...prev, isVisible: false }));
  };

  return {
    celebration,
    celebrate,
    hideCelebration,
    CelebrationComponent: () => (
      <CelebrationModal
        {...celebration}
        onComplete={hideCelebration}
      />
    )
  };
};