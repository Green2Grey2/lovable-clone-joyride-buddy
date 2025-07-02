
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
    <Card className="bg-white border-0 rounded-3xl shadow-[0px_10px_30px_rgba(115,92,247,0.1)]">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#1D244D] text-xl font-semibold">Recent Activity</CardTitle>
          
          {/* Date Selector */}
          <div className="flex gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
              <div 
                key={day}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  index === 4 
                    ? 'bg-gradient-to-br from-[#735CF7] to-[#00A3FF] text-white' 
                    : 'bg-[#F5F6FA] text-[#8A94A6]'
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
              <Card key={item.id} className="bg-[#F5F6FA] border-0 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#735CF7] to-[#00A3FF] rounded-2xl flex items-center justify-center flex-shrink-0">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[#1D244D] font-semibold">{item.goal}</h4>
                        <Badge className="bg-green-100 text-green-700 border-0">
                          Completed
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1 text-[#8A94A6] text-sm">
                          <Clock className="h-4 w-4" />
                          {item.duration}
                        </div>
                        <span className="text-[#8A94A6] text-sm">{item.date}</span>
                      </div>
                      
                      {/* Activity Breakdown */}
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(item.stats).map(([key, value]) => (
                          <div key={key} className="bg-white rounded-xl p-3 text-center">
                            <p className="text-[#8A94A6] text-xs capitalize">{key}</p>
                            <p className="text-[#1D244D] text-sm font-semibold">{value}</p>
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
