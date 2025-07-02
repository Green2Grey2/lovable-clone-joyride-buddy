
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Droplets, Coffee, Apple, Plus, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export const QuickActionsFloat = React.memo(() => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { updateStats, userStats } = useApp();

  const quickActions = [
    {
      icon: Droplets,
      label: 'Water',
      color: 'from-blue-400 to-cyan-500',
      action: () => updateStats({ water: userStats.water + 1 })
    },
    {
      icon: Coffee,
      label: 'Coffee',
      color: 'from-amber-400 to-orange-500',
      action: () => console.log('Coffee logged')
    },
    {
      icon: Apple,
      label: 'Snack',
      color: 'from-green-400 to-emerald-500',
      action: () => console.log('Healthy snack logged')
    }
  ];

  return (
    <div className="fixed bottom-24 right-6 z-40">
      {isExpanded && (
        <Card className="mb-4 bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl animate-scale-in">
          <CardContent className="p-4">
            <div className="space-y-3">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <Button
                    key={index}
                    onClick={() => {
                      action.action();
                      setIsExpanded(false);
                    }}
                    className={`w-full bg-gradient-to-r ${action.color} hover:opacity-90 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-3`}
                    soundEnabled={false}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>Log {action.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-full bg-gradient-to-r from-[#735CF7] to-[#00A3FF] hover:opacity-90 text-white shadow-2xl transition-all duration-300 hover:scale-110 ${
          isExpanded ? 'rotate-45' : ''
        }`}
        soundEnabled={false}
      >
        {isExpanded ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>
    </div>
  );
});

QuickActionsFloat.displayName = 'QuickActionsFloat';
