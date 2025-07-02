import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Heart, Zap, Flame, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

interface HeartRateZone {
  name: string;
  min: number;
  max: number;
  color: string;
  icon: React.ElementType;
  description: string;
  benefits: string[];
  percentage: number;
}

interface HeartRateZonesProps {
  currentHeartRate?: number;
  maxHeartRate?: number;
  age?: number;
}

export const HeartRateZones: React.FC<HeartRateZonesProps> = ({
  currentHeartRate = 0,
  maxHeartRate,
  age = 30
}) => {
  const { user } = useAuth();
  const [calculatedMaxHR, setCalculatedMaxHR] = useState(maxHeartRate || 220 - age);
  const [activeZone, setActiveZone] = useState<number>(-1);
  const [timeInZones, setTimeInZones] = useState<number[]>([15, 35, 30, 15, 5]);

  const zones: HeartRateZone[] = [
    {
      name: 'Recovery',
      min: 0.5,
      max: 0.6,
      color: 'from-blue-400 to-blue-600',
      icon: Heart,
      description: 'Light activity, warming up',
      benefits: ['Improves overall health', 'Aids recovery', 'Burns fat'],
      percentage: timeInZones[0]
    },
    {
      name: 'Fat Burn',
      min: 0.6,
      max: 0.7,
      color: 'from-green-400 to-green-600',
      icon: Flame,
      description: 'Moderate activity, fat burning',
      benefits: ['Maximum fat burn', 'Builds endurance', 'Improves fitness'],
      percentage: timeInZones[1]
    },
    {
      name: 'Cardio',
      min: 0.7,
      max: 0.8,
      color: 'from-yellow-400 to-orange-500',
      icon: Activity,
      description: 'Hard activity, cardio training',
      benefits: ['Improves cardiovascular fitness', 'Increases stamina', 'Burns calories'],
      percentage: timeInZones[2]
    },
    {
      name: 'Peak',
      min: 0.8,
      max: 0.9,
      color: 'from-orange-500 to-red-500',
      icon: Zap,
      description: 'Very hard activity, performance',
      benefits: ['Increases performance', 'Builds speed', 'Maximum calorie burn'],
      percentage: timeInZones[3]
    },
    {
      name: 'Maximum',
      min: 0.9,
      max: 1.0,
      color: 'from-red-500 to-red-700',
      icon: Trophy,
      description: 'Maximum effort, short bursts',
      benefits: ['Peak performance', 'Increases power', 'Competitive training'],
      percentage: timeInZones[4]
    }
  ];

  useEffect(() => {
    if (currentHeartRate > 0) {
      const zoneIndex = zones.findIndex(zone => {
        const minHR = zone.min * calculatedMaxHR;
        const maxHR = zone.max * calculatedMaxHR;
        return currentHeartRate >= minHR && currentHeartRate <= maxHR;
      });
      setActiveZone(zoneIndex);
    }
  }, [currentHeartRate, calculatedMaxHR]);

  const getZoneWidth = (zone: HeartRateZone): number => {
    const minHR = zone.min * calculatedMaxHR;
    const maxHR = zone.max * calculatedMaxHR;
    
    if (currentHeartRate <= 0) return 0;
    if (currentHeartRate < minHR) return 0;
    if (currentHeartRate >= maxHR) return 100;
    
    return ((currentHeartRate - minHR) / (maxHR - minHR)) * 100;
  };

  return (
    <Card className="card-modern glass dark:glass-dark overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Heart Rate Zones</CardTitle>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500 animate-pulse" />
            <span className="text-2xl font-bold text-foreground">
              {currentHeartRate > 0 ? currentHeartRate : '--'}
            </span>
            <span className="text-sm text-muted-foreground">bpm</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Zone Bars */}
        <div className="space-y-3">
          {zones.map((zone, index) => {
            const Icon = zone.icon;
            const isActive = index === activeZone;
            const width = getZoneWidth(zone);
            
            return (
              <motion.div
                key={zone.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative rounded-xl p-3 transition-all duration-300",
                  isActive ? "scale-105 shadow-lg" : "scale-100",
                  "bg-gradient-to-r from-muted/20 to-muted/10"
                )}
              >
                {/* Background gradient */}
                <div className={cn(
                  "absolute inset-0 rounded-xl opacity-20 bg-gradient-to-r",
                  zone.color
                )} />
                
                {/* Progress bar */}
                <AnimatePresence>
                  {isActive && width > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      exit={{ width: 0 }}
                      className={cn(
                        "absolute inset-0 rounded-xl bg-gradient-to-r opacity-30",
                        zone.color
                      )}
                    />
                  )}
                </AnimatePresence>
                
                {/* Content */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg bg-gradient-to-br",
                      zone.color,
                      isActive && "animate-pulse"
                    )}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{zone.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(zone.min * calculatedMaxHR)} - {Math.round(zone.max * calculatedMaxHR)} bpm
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{zone.percentage}%</p>
                    <p className="text-xs text-muted-foreground">time</p>
                  </div>
                </div>
                
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeZone"
                    className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-8 bg-gradient-to-b from-primary to-primary/60 rounded-full shadow-glow"
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Zone Details */}
        <AnimatePresence mode="wait">
          {activeZone >= 0 && (
            <motion.div
              key={activeZone}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/50"
            >
              <h4 className="font-semibold mb-2">{zones[activeZone].name} Zone</h4>
              <p className="text-sm text-muted-foreground mb-3">{zones[activeZone].description}</p>
              <div className="space-y-1">
                {zones[activeZone].benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-xs text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Weekly Zone Distribution */}
        <div className="mt-6">
          <h4 className="text-sm font-semibold mb-3">Weekly Zone Distribution</h4>
          <div className="flex h-8 rounded-xl overflow-hidden">
            {zones.map((zone, index) => (
              <motion.div
                key={zone.name}
                initial={{ width: 0 }}
                animate={{ width: `${zone.percentage}%` }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={cn("relative bg-gradient-to-r", zone.color)}
              >
                {zone.percentage > 10 && (
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                    {zone.percentage}%
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Training Tip */}
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-xs text-center">
            💡 <span className="font-medium">Pro tip:</span> Aim for 20-30 minutes in your target zone for optimal results
          </p>
        </div>
      </CardContent>
    </Card>
  );
};