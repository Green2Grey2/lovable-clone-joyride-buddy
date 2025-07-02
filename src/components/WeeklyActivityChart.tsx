
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
    <Card className="bg-card border-0 rounded-3xl shadow-lg dark:shadow-primary/10">
      <CardHeader className="pb-4">
        <CardTitle className="text-foreground text-xl font-semibold">Weekly Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barCategoryGap="20%">
              <defs>
                <linearGradient id="todayGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--blue-500))" />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis hide />
              <Bar dataKey="steps" radius={[8, 8, 0, 0]}>
                {weeklyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isToday ? 'url(#todayGradient)' : 'hsl(var(--muted))'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-muted rounded-2xl p-4 text-center">
            <p className="text-muted-foreground text-sm">Distance</p>
            <p className="text-foreground text-lg font-bold">2.4 km</p>
          </div>
          <div className="bg-muted rounded-2xl p-4 text-center">
            <p className="text-muted-foreground text-sm">Time</p>
            <p className="text-foreground text-lg font-bold">45 min</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
