import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Users, Calendar, CheckCircle2, Clock, XCircle,
  BookOpen, TrendingUp, ArrowRight,
} from 'lucide-react';
import api from '@/lib/api';

interface Stats {
  totalStudents: number;
  totalAppointments: number;
  pending: number;
  approved: number;
  cancelled: number;
  todayCount: number;
  bySubject: { subject: string; count: number }[];
  recent: any[];
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  };
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${map[status] ?? 'bg-muted text-muted-foreground'}`}>
      {status}
    </span>
  );
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then((r) => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (!stats) {
    return <p className="text-muted-foreground">Failed to load stats.</p>;
  }

  const statCards = [
    {
      label: 'Total Students',
      value: stats.totalStudents,
      sub: 'Registered accounts',
      icon: Users,
      iconClass: 'bg-primary/10 text-primary',
    },
    {
      label: 'Total Bookings',
      value: stats.totalAppointments,
      sub: 'All time',
      icon: Calendar,
      iconClass: 'bg-secondary/10 text-secondary',
    },
    {
      label: 'Pending',
      value: stats.pending,
      sub: 'Awaiting approval',
      icon: Clock,
      iconClass: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    },
    {
      label: 'Approved',
      value: stats.approved,
      sub: 'Sessions confirmed',
      icon: CheckCircle2,
      iconClass: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    },
  ];

  const maxCount = Math.max(...stats.bySubject.map((s) => s.count), 1);

  const subjectColors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-primary/60', 'bg-secondary/60'];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card className="rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${card.iconClass}`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-black tabular-nums">{card.value}</p>
                  <p className="text-sm font-semibold leading-tight">{card.label}</p>
                  <p className="text-xs text-muted-foreground">{card.sub}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Today highlight bar */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">
            {stats.todayCount} session{stats.todayCount !== 1 ? 's' : ''} scheduled today
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link to="/admin/appointments">
          <Button variant="ghost" size="sm" className="rounded-full text-primary gap-1">
            View <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Charts + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Subject bar chart */}
        <Card className="rounded-2xl border border-border shadow-sm lg:col-span-2">
          <CardHeader className="border-b border-border pb-4 pt-5 px-5">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Bookings by Subject
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pt-5 pb-5 space-y-4">
            {stats.bySubject.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">No data yet</p>
            ) : (
              stats.bySubject.map((s, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">{s.subject}</span>
                    <span className="text-muted-foreground font-mono text-xs">{s.count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.count / maxCount) * 100}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: 'easeOut' }}
                      className={`h-full rounded-full ${subjectColors[i % subjectColors.length]}`}
                    />
                  </div>
                </div>
              ))
            )}

            {/* Status summary */}
            <div className="pt-4 border-t border-border grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-black text-yellow-600">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div>
                <p className="text-lg font-black text-green-600">{stats.approved}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
              <div>
                <p className="text-lg font-black text-red-500">{stats.cancelled}</p>
                <p className="text-xs text-muted-foreground">Cancelled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent appointments */}
        <Card className="rounded-2xl border border-border shadow-sm lg:col-span-3">
          <CardHeader className="border-b border-border pb-4 pt-5 px-5 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Recent Appointments
            </CardTitle>
            <Link to="/admin/appointments">
              <Button variant="ghost" size="sm" className="h-7 text-xs rounded-full text-primary gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="px-5 pt-4 pb-4">
            {stats.recent.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                No appointments yet
              </div>
            ) : (
              <div className="divide-y divide-border">
                {stats.recent.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="py-3 flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                      {(a.studentName?.[0] ?? '?').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-tight truncate">{a.studentName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {a.tutorName} · {a.subject}
                      </p>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <StatusPill status={a.status} />
                      <p className="text-xs text-muted-foreground">{a.date}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/admin/appointments', label: 'Manage Appointments', icon: Calendar, color: 'text-primary' },
          { to: '/admin/students', label: 'View All Students', icon: Users, color: 'text-secondary' },
          { to: '/admin/tutors', label: 'Browse Tutors', icon: BookOpen, color: 'text-accent' },
        ].map((item, i) => (
          <Link key={i} to={item.to}>
            <Card className="rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
              <CardContent className="p-5 flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${item.color} shrink-0`} />
                <span className="text-sm font-semibold group-hover:text-primary transition-colors">{item.label}</span>
                <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-0.5 duration-150" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
