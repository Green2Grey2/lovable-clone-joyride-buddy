import React from 'react';

interface StepDisplayProps {
  stats: {
    pending_steps?: number;
    verified_steps?: number;
    today_steps?: number;
  };
}

export const StepDisplay: React.FC<StepDisplayProps> = ({ stats }) => {
  const { pending_steps = 0, verified_steps = 0, today_steps = 0 } = stats;
  const total = pending_steps + verified_steps || today_steps;

  return (
    <div className="space-y-2">
      <div className="text-3xl font-bold text-foreground">{total.toLocaleString()}</div>
      {pending_steps > 0 && (
        <div className="text-sm text-muted-foreground">
          <span className="text-emerald-600 dark:text-emerald-400">{verified_steps.toLocaleString()} verified</span>
          {' • '}
          <span className="text-orange-500 dark:text-orange-400">{pending_steps.toLocaleString()} pending</span>
        </div>
      )}
    </div>
  );
};