
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface StepChartProps {
  data: Array<{
    date: string;
    steps: number;
  }>;
  timeRange: 'week' | 'month';
}

const chartConfig = {
  steps: {
    label: "Steps",
    color: "hsl(var(--chart-1))",
  },
};

export const StepChart = ({ data, timeRange }: StepChartProps) => {
  return (
    <Card className="bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-800/90 dark:to-gray-900/70 backdrop-blur-md border border-white/30 dark:border-gray-700/30 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          Step History - {timeRange === 'week' ? 'Last 7 Days' : 'Last 30 Days'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="stepGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" opacity={0.7} />
              <XAxis 
                dataKey="date" 
                className="fill-gray-600 dark:fill-gray-400"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                className="fill-gray-600 dark:fill-gray-400"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value.toLocaleString()}`}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
              />
              <Area 
                type="monotone" 
                dataKey="steps" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                fill="url(#stepGradient)"
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
