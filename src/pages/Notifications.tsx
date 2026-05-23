import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, BookOpen, CheckCircle2, XCircle, Info, CheckCheck, Check,
  Clock, Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'booking' | 'approved' | 'cancelled' | 'info';
  isRead: number;
  createdAt: string;
}

const typeConfig = {
  booking:   { icon: BookOpen,     label: 'Booking',   iconCls: 'bg-primary/10 text-primary',         border: 'border-l-primary',     pill: 'bg-primary/10 text-primary border-primary/20' },
  approved:  { icon: CheckCircle2, label: 'Approved',  iconCls: 'bg-secondary/10 text-secondary',     border: 'border-l-secondary',   pill: 'bg-secondary/10 text-secondary border-secondary/20' },
  cancelled: { icon: XCircle,      label: 'Cancelled', iconCls: 'bg-destructive/10 text-destructive', border: 'border-l-destructive', pill: 'bg-destructive/10 text-destructive border-destructive/20' },
  info:      { icon: Info,         label: 'Info',      iconCls: 'bg-muted text-muted-foreground',     border: 'border-l-border',      pill: 'bg-muted text-muted-foreground border-border' },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatFull(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

type FilterType = 'all' | 'unread' | 'booking' | 'approved' | 'cancelled';

const filterTabs: { key: FilterType; label: string; icon: any }[] = [
  { key: 'all',       label: 'All',       icon: Bell },
  { key: 'unread',    label: 'Unread',    icon: Clock },
  { key: 'booking',   label: 'Bookings',  icon: BookOpen },
  { key: 'approved',  label: 'Approved',  icon: CheckCircle2 },
  { key: 'cancelled', label: 'Cancelled', icon: XCircle },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  const fetchNotifications = async () => {
    try {
      const r = await api.get('/notifications');
      setNotifications(r.data.notifications);
      setUnreadCount(r.data.unreadCount);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markOne = async (id: number) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: 1 } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAll = async () => {
    await api.patch('/notifications/read-all');
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: 1 })));
    setUnreadCount(0);
  };

  const getCount = (key: FilterType) => {
    if (key === 'all') return notifications.length;
    if (key === 'unread') return unreadCount;
    return notifications.filter((n) => n.type === key).length;
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return n.isRead === 0;
    if (filter === 'all') return true;
    return n.type === filter;
  });

  return (
    <div className="w-full space-y-6">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread · ${notifications.length - unreadCount} read`
              : notifications.length > 0
              ? 'All notifications read'
              : 'No notifications yet'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="rounded-xl gap-2 shrink-0" onClick={markAll}>
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Summary stat row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Bookings',  count: notifications.filter((n) => n.type === 'booking').length,   cls: 'bg-primary/10 text-primary',         num: 'text-primary' },
          { label: 'Approved',  count: notifications.filter((n) => n.type === 'approved').length,  cls: 'bg-secondary/10 text-secondary',     num: 'text-secondary' },
          { label: 'Cancelled', count: notifications.filter((n) => n.type === 'cancelled').length, cls: 'bg-destructive/10 text-destructive', num: 'text-destructive' },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border border-border p-4 flex items-center gap-3 ${s.cls} bg-opacity-50`}>
            <p className={`text-2xl font-black tabular-nums ${s.num}`}>{s.count}</p>
            <p className="text-sm font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Layout: filter sidebar + list */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08 }}
          className="lg:w-52 shrink-0"
        >
          <div className="bg-card border border-border rounded-2xl p-2 shadow-sm sticky top-4 space-y-0.5">
            {filterTabs.map((tab) => {
              const count = getCount(tab.key);
              const Icon = tab.icon;
              const active = filter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-left">{tab.label}</span>
                  {count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold min-w-[20px] text-center tabular-nums ${
                      active ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.aside>

        {/* List */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{filterTabs.find((t) => t.key === filter)?.label}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold tabular-nums">{filtered.length}</span>
            </div>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAll} className="rounded-xl gap-2 text-xs hidden sm:flex">
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </Button>
            )}
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-[88px] rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Inbox className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <p className="font-semibold text-foreground">Nothing here</p>
              <p className="text-sm text-muted-foreground mt-1">
                {filter !== 'all' ? 'Try switching to "All"' : "You're all caught up!"}
              </p>
              {filter !== 'all' && (
                <Button variant="outline" size="sm" className="rounded-xl mt-4" onClick={() => setFilter('all')}>
                  View all
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filtered.map((n, i) => {
                  const cfg = typeConfig[n.type] ?? typeConfig.info;
                  const Icon = cfg.icon;
                  const isUnread = n.isRead === 0;

                  return (
                    <motion.div
                      key={n.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20, scale: 0.97 }}
                      transition={{ delay: i * 0.03, type: 'spring', stiffness: 350, damping: 28 }}
                      className={`group flex items-start gap-4 p-4 rounded-2xl border border-l-4 ${cfg.border} shadow-sm transition-colors ${
                        isUnread ? 'bg-primary/[0.025] border-border' : 'bg-card border-border'
                      } hover:bg-muted/30`}
                    >
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.iconCls}`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-wrap">
                            <p className={`text-sm leading-snug truncate ${isUnread ? 'font-semibold' : 'text-foreground/80'}`}>
                              {n.title}
                            </p>
                            {isUnread && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0 tabular-nums" title={formatFull(n.createdAt)}>
                            {timeAgo(n.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-2">{n.message}</p>
                        <div className="flex items-center gap-2 mt-2.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${cfg.pill}`}>{cfg.label}</span>
                          <span className="text-[10px] text-muted-foreground/60">{formatFull(n.createdAt)}</span>
                        </div>
                      </div>

                      {/* Mark read */}
                      {isUnread && (
                        <button
                          onClick={() => markOne(n.id)}
                          title="Mark as read"
                          className="shrink-0 w-8 h-8 rounded-xl border border-border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary text-muted-foreground flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
