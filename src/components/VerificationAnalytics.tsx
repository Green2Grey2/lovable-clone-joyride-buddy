import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2, TrendingUp, Clock, Shield, CheckCircle } from 'lucide-react';

interface AnalyticsData {
  date: string;
  total_entries: number;
  verified_count: number;
  pending_count: number;
  rejected_count: number;
  avg_verification_time_hours: number;
  auto_verified_count: number;
}

interface AnalyticsSummary {
  totalEntries: number;
  verificationRate: number;
  avgTimeToVerify: number;
  autoVerifiedUsers: number;
  pendingEntries: number;
}

export const VerificationAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin, isManager } = useUserRole();

  useEffect(() => {
    if (isAdmin || isManager) {
      loadAnalytics();
    }
  }, [isAdmin, isManager]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('verification_analytics')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;

      setAnalytics(data || []);

      // Calculate summary statistics
      if (data && data.length > 0) {
        const totals = data.reduce(
          (acc, day) => ({
            totalEntries: acc.totalEntries + day.total_entries,
            verifiedCount: acc.verifiedCount + day.verified_count,
            pendingCount: acc.pendingCount + day.pending_count,
            autoVerifiedCount: acc.autoVerifiedCount + day.auto_verified_count,
            totalVerificationTime: acc.totalVerificationTime + (day.avg_verification_time_hours || 0),
            daysWithData: acc.daysWithData + (day.avg_verification_time_hours ? 1 : 0),
          }),
          {
            totalEntries: 0,
            verifiedCount: 0,
            pendingCount: 0,
            autoVerifiedCount: 0,
            totalVerificationTime: 0,
            daysWithData: 0,
          }
        );

        setSummary({
          totalEntries: totals.totalEntries,
          verificationRate: totals.totalEntries > 0 ? (totals.verifiedCount / totals.totalEntries) * 100 : 0,
          avgTimeToVerify: totals.daysWithData > 0 ? totals.totalVerificationTime / totals.daysWithData : 0,
          autoVerifiedUsers: totals.autoVerifiedCount,
          pendingEntries: totals.pendingCount,
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin && !isManager) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Verification Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Verification Analytics
          <span className="text-sm font-normal text-muted-foreground">
            (Last 30 days)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {summary ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4" />
                Verification Rate
              </div>
              <p className="text-2xl font-bold text-success">
                {summary.verificationRate.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">
                {summary.totalEntries} total entries
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Avg Time to Verify
              </div>
              <p className="text-2xl font-bold text-primary">
                {summary.avgTimeToVerify.toFixed(1)}h
              </p>
              <p className="text-xs text-muted-foreground">
                Average processing time
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                Auto-Verified
              </div>
              <p className="text-2xl font-bold text-accent">
                {summary.autoVerifiedUsers}
              </p>
              <p className="text-xs text-muted-foreground">
                Trusted user entries
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Pending Review
              </div>
              <p className="text-2xl font-bold text-warning">
                {summary.pendingEntries}
              </p>
              <p className="text-xs text-muted-foreground">
                Awaiting verification
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No analytics data available
          </div>
        )}
        
        {analytics.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-sm font-medium mb-3">Recent Daily Activity</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {analytics.slice(0, 7).map((day) => (
                <div key={day.date} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {new Date(day.date).toLocaleDateString()}
                  </span>
                  <div className="flex gap-4">
                    <span className="text-success">
                      ✓ {day.verified_count}
                    </span>
                    <span className="text-warning">
                      ⏳ {day.pending_count}
                    </span>
                    <span className="text-destructive">
                      ✗ {day.rejected_count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};