import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Eye,
  Clock,
  MousePointerClick,
  TrendingUp,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { analyticsApi } from "@/admin/lib/api";
import type {
  OverviewStats,
  DailyStats,
  SessionItem,
} from "@/admin/lib/types";

export default function Analytics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [selectedDays, setSelectedDays] = useState(7);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [overviewData, dailyData, sessionsData] = await Promise.all([
        analyticsApi.overview(selectedDays),
        analyticsApi.dailyStats(30),
        analyticsApi.sessions(10),
      ]);

      setOverview(overviewData);
      setDailyStats(dailyData.daily_stats);
      setSessions(sessionsData.sessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [selectedDays]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDeviceIcon = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case "mobile":
        return <Smartphone className="size-4" />;
      case "tablet":
        return <Tablet className="size-4" />;
      default:
        return <Monitor className="size-4" />;
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Analytics"
        description="Site performance overview"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex border border-border overflow-hidden">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => setSelectedDays(days)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedDays === days
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw
                className={`size-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        }
      />

      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"
          >
            {error}
          </motion.div>
        ) : overview ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Sessions"
                value={overview.total_sessions}
                subtitle={`${overview.unique_visitors_today} today`}
                icon={<Users className="size-4" />}
                trend={overview.unique_visitors_today > 0 ? "up" : undefined}
              />
              <StatCard
                title="Page Views"
                value={overview.total_page_views}
                subtitle={`${overview.page_views_today} today`}
                icon={<Eye className="size-4" />}
                trend={overview.page_views_today > 0 ? "up" : undefined}
              />
              <StatCard
                title="Avg. Time"
                value={formatTime(Math.round(overview.avg_time_on_page))}
                subtitle={`${overview.avg_scroll_depth.toFixed(0)}% scroll`}
                icon={<Clock className="size-4" />}
              />
              <StatCard
                title="Bounce Rate"
                value={`${overview.bounce_rate.toFixed(1)}%`}
                subtitle="Single page visits"
                icon={<MousePointerClick className="size-4" />}
                trend={overview.bounce_rate < 50 ? "up" : "down"}
              />
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="size-4 text-primary" />
                    Traffic
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <MiniBarChart data={dailyStats} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="size-4 text-primary" />
                    Devices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(overview.device_breakdown).map(
                      ([device, count]) => {
                        const total = Object.values(
                          overview.device_breakdown
                        ).reduce((a, b) => a + b, 0);
                        const percentage =
                          total > 0 ? (count / total) * 100 : 0;
                        return (
                          <div key={device} className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2 text-muted-foreground capitalize">
                                {getDeviceIcon(device)}
                                {device}
                              </span>
                              <span className="font-medium">
                                {percentage.toFixed(0)}%
                              </span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="h-full bg-primary rounded-full"
                              />
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="size-4 text-primary" />
                    Top Pages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {overview.top_pages.slice(0, 5).map((page, i) => (
                      <div
                        key={page.path}
                        className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-4">
                            {i + 1}
                          </span>
                          <span className="text-sm font-mono truncate max-w-[200px]">
                            {page.path}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {page.views.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="size-4 text-primary" />
                    Top Referrers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {overview.top_referrers.length > 0 ? (
                      overview.top_referrers.slice(0, 5).map((ref, i) => (
                        <div
                          key={ref.domain}
                          className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground w-4">
                              {i + 1}
                            </span>
                            <span className="text-sm truncate max-w-[200px]">
                              {ref.domain}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {ref.count.toLocaleString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        No referrer data yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  Recent Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="pb-3 font-medium text-muted-foreground">
                          Device
                        </th>
                        <th className="pb-3 font-medium text-muted-foreground">
                          Started
                        </th>
                        <th className="pb-3 font-medium text-muted-foreground">
                          Pages
                        </th>
                        <th className="pb-3 font-medium text-muted-foreground">
                          Time
                        </th>
                        <th className="pb-3 font-medium text-muted-foreground">
                          Source
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((session) => (
                        <tr
                          key={session.id}
                          className="border-b border-border/50 last:border-0"
                        >
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              {getDeviceIcon(session.device_type)}
                              <span className="text-muted-foreground">
                                {session.browser || "Unknown"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {formatDate(session.started_at)}
                          </td>
                          <td className="py-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium">
                              {session.page_view_count}
                            </span>
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {formatTime(session.total_time)}
                          </td>
                          <td className="py-3 text-muted-foreground truncate max-w-[150px]">
                            {session.referrer_domain || "Direct"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center h-64"
          >
            <RefreshCw className="size-6 animate-spin text-muted-foreground" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: "up" | "down";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {icon}
              {title}
            </span>
            {trend && (
              <span
                className={`inline-flex items-center ${
                  trend === "up" ? "text-green-600" : "text-red-500"
                }`}
              >
                {trend === "up" ? (
                  <ArrowUpRight className="size-3.5" />
                ) : (
                  <ArrowDownRight className="size-3.5" />
                )}
              </span>
            )}
          </div>
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MiniBarChart({ data }: { data: DailyStats[] }) {
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
        No data available
      </div>
    );
  }

  const maxViews = Math.max(...data.map((d) => d.page_views), 1);

  return (
    <div className="h-full flex items-end gap-1">
      {data.slice(-14).map((day, i) => {
        const height = (day.page_views / maxViews) * 100;
        return (
          <motion.div
            key={day.date}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ duration: 0.4, delay: i * 0.02 }}
            className="flex-1 bg-primary/20 hover:bg-primary/40 rounded-t transition-colors relative group min-w-[8px]"
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-card border border-border rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div className="font-medium">{day.page_views} views</div>
              <div className="text-muted-foreground">
                {day.sessions} sessions
              </div>
              <div className="text-muted-foreground text-[10px]">
                {new Date(day.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
