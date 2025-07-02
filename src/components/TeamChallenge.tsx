
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface Challenge {
  id: string;
  name: string;
  description: string;
  targetSteps: number;
  currentSteps: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'upcoming';
}

interface TeamChallengeProps {
  challenge: Challenge;
}

export const TeamChallenge = ({ challenge }: TeamChallengeProps) => {
  const progress = Math.min((challenge.currentSteps / challenge.targetSteps) * 100, 100);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {challenge.name}
          <Badge variant={challenge.status === 'active' ? 'default' : challenge.status === 'completed' ? 'secondary' : 'outline'}>
            {challenge.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{challenge.description}</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{challenge.currentSteps.toLocaleString()} / {challenge.targetSteps.toLocaleString()}</span>
          </div>
          <Progress value={progress} />
          <p className="text-xs text-muted-foreground">{progress.toFixed(1)}% Complete</p>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Started: {challenge.startDate}</span>
          <span>Ends: {challenge.endDate}</span>
        </div>
      </CardContent>
    </Card>
  );
};
