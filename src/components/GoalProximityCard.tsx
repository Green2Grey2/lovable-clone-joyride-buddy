
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, TrendingUp, Zap } from 'lucide-react';

interface GoalProximityCardProps {
  steps: number;
  stepGoal: number;
  onQuickAction: () => void;
}

export const GoalProximityCard = React.memo(({ 
  steps, 
  stepGoal, 
  onQuickAction 
}: GoalProximityCardProps) => {
  const stepProgress = Math.min((steps / stepGoal) * 100, 100);
  const stepsRemaining = Math.max(stepGoal - steps, 0);
  
  const getProximityData = () => {
    if (stepProgress >= 100) {
      return {
        message: "🎉 Goal smashed! Amazing work!",
        subtitle: "You've exceeded your daily target",
        color: "text-green-600",
        bgGradient: "from-green-400 to-emerald-500",
        buttonText: "🏆 Celebrate",
        icon: Target,
        animate: "animate-bounce-gentle"
      };
    } else if (stepProgress >= 90) {
      return {
        message: `Only ${stepsRemaining.toLocaleString()} steps to go!`,
        subtitle: "You're so close to your goal",
        color: "text-orange-600",
        bgGradient: "from-orange-400 to-red-500",
        buttonText: "🚀 Finish Strong",
        icon: TrendingUp,
        animate: "animate-pulse-subtle"
      };
    } else if (stepProgress >= 75) {
      return {
        message: `Almost there! ${stepsRemaining.toLocaleString()} left`,
        subtitle: "Keep up the momentum",
        color: "text-blue-600",
        bgGradient: "from-blue-400 to-cyan-500",
        buttonText: "💪 Keep Going",
        icon: TrendingUp,
        animate: ""
      };
    } else if (stepProgress >= 50) {
      return {
        message: "Halfway there! Keep going!",
        subtitle: `${Math.round(stepProgress)}% complete`,
        color: "text-purple-600",
        bgGradient: "from-purple-400 to-pink-500",
        buttonText: "⚡ Power Up",
        icon: Zap,
        animate: ""
      };
    } else {
      return {
        message: "Let's get moving!",
        subtitle: `${stepGoal.toLocaleString()} step goal today`,
        color: "text-gray-700",
        bgGradient: "from-gray-400 to-slate-500",
        buttonText: "🎯 Start Now",
        icon: Target,
        animate: ""
      };
    }
  };

  const proximityData = getProximityData();
  const IconComponent = proximityData.icon;

  return (
    <Card className="bg-white border-0 rounded-3xl shadow-[0px_15px_40px_rgba(115,92,247,0.12)] hover:shadow-[0px_20px_50px_rgba(115,92,247,0.18)] transition-all duration-300 overflow-hidden">
      <div className={`h-2 bg-gradient-to-r ${proximityData.bgGradient}`}></div>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 bg-gradient-to-br ${proximityData.bgGradient} rounded-2xl ${proximityData.animate}`}>
            <IconComponent className="h-6 w-6 text-white" />
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#1D244D]">{steps.toLocaleString()}</p>
            <p className="text-sm text-[#8A94A6]">of {stepGoal.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className={`text-lg font-bold ${proximityData.color} mb-1`}>
            {proximityData.message}
          </h3>
          <p className="text-[#8A94A6] text-sm">{proximityData.subtitle}</p>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${proximityData.bgGradient} rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${stepProgress}%` }}
          ></div>
        </div>

        <Button 
          onClick={onQuickAction}
          className={`w-full bg-gradient-to-r ${proximityData.bgGradient} hover:opacity-90 text-white font-semibold py-3 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg`}
          soundEnabled={false}
        >
          {proximityData.buttonText}
        </Button>
      </CardContent>
    </Card>
  );
});

GoalProximityCard.displayName = 'GoalProximityCard';
