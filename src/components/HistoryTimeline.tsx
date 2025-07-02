
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Clock, Zap } from 'lucide-react';

const historyData = [
  {
    id: '1',
    activity: 'Running',
    goal: 'Running goal completed',
    duration: '45 min',
    date: 'Today',
    stats: { fast: '12 min', medium: '18 min', slow: '15 min' },
    icon: Target,
    completed: true
  },
  {
    id: '2',
    activity: 'Walking',
    goal: 'Daily steps achieved',
    duration: '1 hour 20 min',
    date: 'Yesterday',
    stats: { fast: '15 min', medium: '35 min', slow: '30 min' },
    icon: Target,
    completed: true
  },
  {
    id: '3',
    activity: 'Workout',
    goal: 'Strength training',
    duration: '30 min',
    date: '2 days ago',
    stats: { high: '10 min', medium: '15 min', low: '5 min' },
    icon: Zap,
    completed: true
  }
];

export const HistoryTimeline = () => {
  return (
    <Card className="bg-card border-0 rounded-3xl shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground text-xl font-semibold">Recent Activity</CardTitle>
          
          {/* Date Selector */}
          <div className="flex gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
              <div 
                key={day}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  index === 4 
                    ? 'bg-gradient-to-br from-primary to-primary/60 text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <div className="space-y-4">
          {historyData.map((item) => {
            const IconComponent = item.icon;
            return (
              <Card key={item.id} className="bg-secondary border-0 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <IconComponent className="h-6 w-6 text-primary-foreground" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-foreground font-semibold">{item.goal}</h4>
                        <Badge className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-0">
                          Completed
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <Clock className="h-4 w-4" />
                          {item.duration}
                        </div>
                        <span className="text-muted-foreground text-sm">{item.date}</span>
                      </div>
                      
                      {/* Activity Breakdown */}
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(item.stats).map(([key, value]) => (
                          <div key={key} className="bg-background rounded-xl p-3 text-center">
                            <p className="text-muted-foreground text-xs capitalize">{key}</p>
                            <p className="text-foreground text-sm font-semibold">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
