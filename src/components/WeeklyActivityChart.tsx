
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

const weeklyData = [
  { day: 'Mon', steps: 2800, isToday: false },
  { day: 'Tue', steps: 3200, isToday: false },
  { day: 'Wed', steps: 2900, isToday: false },
  { day: 'Thu', steps: 3800, isToday: false },
  { day: 'Fri', steps: 3250, isToday: true },
  { day: 'Sat', steps: 0, isToday: false },
  { day: 'Sun', steps: 0, isToday: false },
];

export const WeeklyActivityChart = () => {
  return (
    <Card className="bg-white border-0 rounded-3xl shadow-[0px_10px_30px_rgba(115,92,247,0.1)]">
      <CardHeader className="pb-4">
        <CardTitle className="text-[#1D244D] text-xl font-semibold">Weekly Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barCategoryGap="20%">
              <defs>
                <linearGradient id="todayGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#735CF7" />
                  <stop offset="100%" stopColor="#00A3FF" />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#8A94A6', fontSize: 12 }}
              />
              <YAxis hide />
              <Bar dataKey="steps" radius={[8, 8, 0, 0]}>
                {weeklyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isToday ? 'url(#todayGradient)' : '#E5E7EB'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-[#F5F6FA] rounded-2xl p-4 text-center">
            <p className="text-[#8A94A6] text-sm">Distance</p>
            <p className="text-[#1D244D] text-lg font-bold">2.4 km</p>
          </div>
          <div className="bg-[#F5F6FA] rounded-2xl p-4 text-center">
            <p className="text-[#8A94A6] text-sm">Time</p>
            <p className="text-[#1D244D] text-lg font-bold">45 min</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
