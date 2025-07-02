import React, { useState } from 'react';
import { ActivityHeatMap } from '@/components/visualizations/ActivityHeatMap';
import { ProgressChart } from '@/components/visualizations/ProgressChart';
import { ComparativeAnalytics } from '@/components/visualizations/ComparativeAnalytics';
import { PersonalRecords } from '@/components/visualizations/PersonalRecords';
import { WorkoutTimer } from '@/components/visualizations/WorkoutTimer';
import { HeartRateZones } from '@/components/visualizations/HeartRateZones';
import { SocialLeaderboard } from '@/components/visualizations/SocialLeaderboard';
import { AIWorkoutInsights } from '@/components/visualizations/AIWorkoutInsights';
import { FloatingBottomNav } from '@/components/FloatingBottomNav';
import { Button } from '@/components/ui/button';
import { ChartBar, Calendar, Trophy, Timer, TrendingUp, Heart, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const Analytics = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'zones' | 'social'>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBar },
    { id: 'records', label: 'Records', icon: Trophy },
    { id: 'zones', label: 'Zones', icon: Heart },
    { id: 'social', label: 'Social', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground mb-4">Analytics & Insights</h1>
          
          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap transition-smooth",
                    activeTab === tab.id && "shadow-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Heat Map */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Activity Overview
                </h2>
                <ActivityHeatMap />
              </div>

              {/* Progress Charts Grid */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Progress Tracking
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <ProgressChart metric="steps" type="area" />
                  <ProgressChart metric="calories" type="bar" />
                  <ProgressChart metric="duration" type="line" />
                  <ProgressChart metric="distance" type="area" />
                </div>
              </div>

              {/* Comparative Analytics */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <ChartBar className="h-5 w-5 text-primary" />
                  Comparative Analysis
                </h2>
                <ComparativeAnalytics />
              </div>
              
              {/* AI Insights */}
              <div>
                <AIWorkoutInsights />
              </div>
            </div>
          )}

          {activeTab === 'records' && (
            <div className="space-y-6">
              <PersonalRecords />
              
              {/* Achievement Timeline */}
              <div className="card-modern glass dark:glass-dark p-6">
                <h3 className="text-lg font-semibold mb-4">Achievement Timeline</h3>
                <div className="space-y-4">
                  {[
                    { date: 'Today', achievement: 'New calorie record!', value: '650 cal' },
                    { date: '3 days ago', achievement: 'Longest workout', value: '45 min' },
                    { date: '1 week ago', achievement: '7-day streak achieved', value: '🔥' },
                    { date: '2 weeks ago', achievement: 'First 10k steps', value: '10,234' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{item.achievement}</p>
                        <p className="text-xs text-muted-foreground">{item.date}</p>
                      </div>
                      <span className="text-sm font-semibold text-primary">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'zones' && (
            <div className="space-y-6">
              <HeartRateZones currentHeartRate={135} age={30} />
              
              {/* Zone Training Tips */}
              <div className="card-modern glass dark:glass-dark p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Zone Training Guide
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
                    <h4 className="font-semibold text-sm mb-2">Endurance Building</h4>
                    <p className="text-xs text-muted-foreground mb-2">Stay in Zone 2 (Fat Burn) for 45-60 minutes</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-gradient-to-r from-green-400 to-green-600" />
                      </div>
                      <span className="text-xs font-medium">75%</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
                    <h4 className="font-semibold text-sm mb-2">HIIT Training</h4>
                    <p className="text-xs text-muted-foreground mb-2">Alternate Zone 4-5 with Zone 2 recovery</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-1/2 bg-gradient-to-r from-orange-500 to-red-500" />
                      </div>
                      <span className="text-xs font-medium">50%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-6">
              <SocialLeaderboard />
              
              {/* Community Challenges */}
              <div className="card-modern glass dark:glass-dark p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Active Challenges
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'Summer Steps Challenge', participants: 234, daysLeft: 5, progress: 72 },
                    { name: 'Department vs Department', participants: 89, daysLeft: 12, progress: 45 },
                    { name: '1000 Mile Club', participants: 156, daysLeft: 30, progress: 28 },
                  ].map((challenge, i) => (
                    <div key={i} className="p-4 rounded-xl bg-gradient-to-r from-muted/20 to-muted/10 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{challenge.name}</h4>
                        <span className="text-xs text-muted-foreground">{challenge.daysLeft} days left</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{challenge.participants} participants</span>
                          <span className="font-medium">{challenge.progress}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
                            style={{ width: `${challenge.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </div>

      {/* Mobile Navigation */}
      <FloatingBottomNav />
    </div>
  );
};

export default Analytics;