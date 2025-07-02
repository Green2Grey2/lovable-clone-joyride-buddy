import React from 'react';

export const ActivityTrackingInfo: React.FC = () => {
  return (
    <div className="mt-4 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
      <p className="font-medium mb-1">Activity Tracking Info:</p>
      <ul className="space-y-1 text-xs">
        <li>• Users are tracked when they use the app</li>
        <li>• Activity updates every 2 minutes automatically</li>
        <li>• Shows users active within the last 5 minutes</li>
        <li>• Data refreshes every 30 seconds</li>
      </ul>
    </div>
  );
};