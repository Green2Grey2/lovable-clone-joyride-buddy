import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Heart, 
  Target, 
  Users, 
  Bell,
  Smartphone,
  Award,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useGestures';
import { a11y } from '@/lib/accessibility';

interface OnboardingData {
  personalInfo: {
    name: string;
    age: string;
    height: string;
    weight: string;
    department: string;
  };
  fitnessProfile: {
    level: 'beginner' | 'intermediate' | 'advanced';
    goals: string[];
    weeklyGoal: number;
    preferredActivities: string[];
  };
  preferences: {
    notifications: boolean;
    soundEffects: boolean;
    hapticFeedback: boolean;
    shareProgress: boolean;
    joinChallenges: boolean;
  };
}

interface OnboardingStepProps {
  data: OnboardingData;
  updateData: (section: keyof OnboardingData, updates: Partial<OnboardingData[keyof OnboardingData]>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  stepNumber: number;
  totalSteps: number;
}

const WelcomeStep: React.FC<OnboardingStepProps> = ({ onNext }) => {
  const { mediumTap } = useHapticFeedback();

  return (
    <div className="text-center space-y-6">
      <div className="mb-8">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-[#735CF7] to-[#8B5FE6] rounded-full flex items-center justify-center">
          <Heart className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Welcome to Stride!
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Your personal wellness companion for Olive View UCLA Medical Center. 
          Let's get you set up for success.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
        <div className="text-center p-4 bg-primary/5 rounded-lg">
          <Activity className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-sm font-medium">Track Activities</p>
        </div>
        <div className="text-center p-4 bg-primary/5 rounded-lg">
          <Award className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-sm font-medium">Earn Rewards</p>
        </div>
        <div className="text-center p-4 bg-primary/5 rounded-lg">
          <Users className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-sm font-medium">Join Challenges</p>
        </div>
        <div className="text-center p-4 bg-primary/5 rounded-lg">
          <Target className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-sm font-medium">Reach Goals</p>
        </div>
      </div>

      <Button 
        onClick={() => {
          mediumTap();
          onNext();
        }}
        className="w-full max-w-sm mx-auto"
        size="lg"
      >
        Let's Get Started
        <ChevronRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
};

const PersonalInfoStep: React.FC<OnboardingStepProps> = ({ data, updateData, onNext, onPrev }) => {
  const { lightTap } = useHapticFeedback();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAndNext = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.personalInfo.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!data.personalInfo.department.trim()) {
      newErrors.department = 'Department is required';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      lightTap();
      a11y.announce('Personal information saved. Moving to fitness profile.');
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Tell us about yourself</h2>
        <p className="text-muted-foreground">This helps us personalize your experience</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={data.personalInfo.name}
            onChange={(e) => updateData('personalInfo', { name: e.target.value })}
            placeholder="Enter your full name"
            className={errors.name ? 'border-red-500' : ''}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="text-sm text-red-500 mt-1" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="department">Department *</Label>
          <Input
            id="department"
            value={data.personalInfo.department}
            onChange={(e) => updateData('personalInfo', { department: e.target.value })}
            placeholder="e.g., Nursing, Administration, Security"
            className={errors.department ? 'border-red-500' : ''}
            aria-describedby={errors.department ? 'department-error' : undefined}
          />
          {errors.department && (
            <p id="department-error" className="text-sm text-red-500 mt-1" role="alert">
              {errors.department}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="height">Height (optional)</Label>
            <Input
              id="height"
              value={data.personalInfo.height}
              onChange={(e) => updateData('personalInfo', { height: e.target.value })}
              placeholder="5'8&quot;"
            />
          </div>
          <div>
            <Label htmlFor="weight">Weight (optional)</Label>
            <Input
              id="weight"
              value={data.personalInfo.weight}
              onChange={(e) => updateData('personalInfo', { weight: e.target.value })}
              placeholder="150 lbs"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="age">Age (optional)</Label>
          <Input
            id="age"
            type="number"
            value={data.personalInfo.age}
            onChange={(e) => updateData('personalInfo', { age: e.target.value })}
            placeholder="Enter your age"
            min="18"
            max="100"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onPrev} className="flex-1">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={validateAndNext} className="flex-1">
          Continue
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

const FitnessProfileStep: React.FC<OnboardingStepProps> = ({ data, updateData, onNext, onPrev }) => {
  const { lightTap } = useHapticFeedback();

  const fitnessLevels = [
    { value: 'beginner', label: 'Beginner', description: 'New to fitness or getting back into it' },
    { value: 'intermediate', label: 'Intermediate', description: 'Exercise regularly, comfortable with routine' },
    { value: 'advanced', label: 'Advanced', description: 'Very active, exercise is part of daily life' },
  ];

  const goals = [
    'Lose weight',
    'Build muscle',
    'Improve endurance',
    'Reduce stress',
    'Better sleep',
    'Increase energy',
    'Stay active',
    'Social fitness'
  ];

  const activities = [
    'Walking',
    'Running',
    'Cycling',
    'Swimming',
    'Yoga',
    'Strength training',
    'Dance',
    'Sports'
  ];

  const toggleGoal = (goal: string) => {
    const currentGoals = data.fitnessProfile.goals;
    const updatedGoals = currentGoals.includes(goal)
      ? currentGoals.filter(g => g !== goal)
      : [...currentGoals, goal];
    
    updateData('fitnessProfile', { goals: updatedGoals });
    lightTap();
  };

  const toggleActivity = (activity: string) => {
    const current = data.fitnessProfile.preferredActivities;
    const updated = current.includes(activity)
      ? current.filter(a => a !== activity)
      : [...current, activity];
    
    updateData('fitnessProfile', { preferredActivities: updated });
    lightTap();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Your Fitness Profile</h2>
        <p className="text-muted-foreground">Help us customize your experience</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-semibold mb-4 block">What's your fitness level?</Label>
          <RadioGroup
            value={data.fitnessProfile.level}
            onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
              updateData('fitnessProfile', { level: value })
            }
            className="space-y-3"
          >
            {fitnessLevels.map((level) => (
              <div key={level.value} className="flex items-start space-x-3">
                <RadioGroupItem value={level.value} id={level.value} className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor={level.value} className="font-medium cursor-pointer">
                    {level.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{level.description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div>
          <Label className="text-base font-semibold mb-4 block">
            What are your goals? (Select all that apply)
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {goals.map((goal) => (
              <div
                key={goal}
                className={cn(
                  "flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors",
                  data.fitnessProfile.goals.includes(goal)
                    ? "bg-primary/10 border-primary"
                    : "hover:bg-gray-50"
                )}
                onClick={() => toggleGoal(goal)}
              >
                <Checkbox
                  checked={data.fitnessProfile.goals.includes(goal)}
                  onChange={() => toggleGoal(goal)}
                />
                <Label className="cursor-pointer text-sm">{goal}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="weekly-goal" className="text-base font-semibold mb-4 block">
            Weekly step goal
          </Label>
          <div className="space-y-3">
            <Input
              id="weekly-goal"
              type="number"
              value={data.fitnessProfile.weeklyGoal}
              onChange={(e) => updateData('fitnessProfile', { weeklyGoal: parseInt(e.target.value) || 0 })}
              placeholder="e.g., 70000"
              min="1000"
              max="200000"
              step="1000"
            />
            <p className="text-sm text-muted-foreground">
              Daily average: {Math.round(data.fitnessProfile.weeklyGoal / 7).toLocaleString()} steps
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onPrev} className="flex-1">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} className="flex-1">
          Continue
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

const PreferencesStep: React.FC<OnboardingStepProps> = ({ data, updateData, onNext, onPrev, isLast }) => {
  const { lightTap } = useHapticFeedback();

  const preferences = [
    {
      key: 'notifications' as keyof OnboardingData['preferences'],
      label: 'Push Notifications',
      description: 'Get reminders and updates about your progress',
      icon: Bell,
    },
    {
      key: 'soundEffects' as keyof OnboardingData['preferences'],
      label: 'Sound Effects',
      description: 'Audio feedback for interactions and achievements',
      icon: Smartphone,
    },
    {
      key: 'hapticFeedback' as keyof OnboardingData['preferences'],
      label: 'Haptic Feedback',
      description: 'Vibration feedback on mobile devices',
      icon: Smartphone,
    },
    {
      key: 'shareProgress' as keyof OnboardingData['preferences'],
      label: 'Share Progress',
      description: 'Allow others to see your activity in social feeds',
      icon: Users,
    },
    {
      key: 'joinChallenges' as keyof OnboardingData['preferences'],
      label: 'Join Challenges',
      description: 'Participate in department and company-wide challenges',
      icon: Award,
    },
  ];

  const togglePreference = (key: keyof OnboardingData['preferences']) => {
    updateData('preferences', { [key]: !data.preferences[key] });
    lightTap();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Customize Your Experience</h2>
        <p className="text-muted-foreground">You can change these anytime in settings</p>
      </div>

      <div className="space-y-4">
        {preferences.map(({ key, label, description, icon: Icon }) => (
          <div
            key={key}
            className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => togglePreference(key)}
          >
            <div className="flex-shrink-0 mt-1">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <Label className="font-medium cursor-pointer">{label}</Label>
                <Checkbox
                  checked={data.preferences[key]}
                  onChange={() => togglePreference(key)}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onPrev} className="flex-1">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} className="flex-1">
          {isLast ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Complete Setup
            </>
          ) : (
            <>
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  onSkip?: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    personalInfo: {
      name: '',
      age: '',
      height: '',
      weight: '',
      department: 'Fitness',
    },
    fitnessProfile: {
      level: 'beginner',
      goals: [],
      weeklyGoal: 70000,
      preferredActivities: [],
    },
    preferences: {
      notifications: true,
      soundEffects: true,
      hapticFeedback: true,
      shareProgress: true,
      joinChallenges: true,
    },
  });

  const updateData = (section: keyof OnboardingData, updates: Partial<OnboardingData[keyof OnboardingData]>) => {
    setData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
  };

  const steps = [
    { component: WelcomeStep, title: 'Welcome' },
    { component: PersonalInfoStep, title: 'Personal Info' },
    { component: FitnessProfileStep, title: 'Fitness Profile' },
    { component: PreferencesStep, title: 'Preferences' },
  ];

  const currentStepComponent = steps[currentStep].component;
  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(data);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{steps[currentStep].title}</h3>
            {onSkip && currentStep > 0 && (
              <Button variant="ghost" size="sm" onClick={onSkip}>
                Skip for now
              </Button>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent>
          {React.createElement(currentStepComponent, {
            data,
            updateData,
            onNext: nextStep,
            onPrev: prevStep,
            isFirst: currentStep === 0,
            isLast: currentStep === totalSteps - 1,
            stepNumber: currentStep + 1,
            totalSteps,
          })}
        </CardContent>
      </Card>
    </div>
  );
};