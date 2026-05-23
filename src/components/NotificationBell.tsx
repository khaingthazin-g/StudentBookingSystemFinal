import { useEffect, useRef, useState } from 'react';
import { Bell, Check, CheckCheck, BookOpen, CheckCircle2, XCircle, Info, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import api from '@/lib/api';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'booking' | 'approved' | 'cancelled' | 'info';
  isRead: number;
  createdAt: string;
}

const typeIcon: Record<string, { icon: any; cls: string }> = {
  booking:   { icon: BookOpen,     cls: 'bg-primary/10 text-primary' },
  approved:  { icon: CheckCircle2, cls: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
  cancelled: { icon: XCircle,      cls: 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400' },
  info:      { icon: Info,         cls: 'bg-muted text-muted-foreground' },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface Props {
  className?: string;
}

export default function NotificationBell({ className = '' }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const r = await api.get('/notifications');
      setNotifications(r.data.notifications);
      setUnreadCount(r.data.unreadCount);
    } catch {
      // silently fail — user may not be logged in yet
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: 1 })));
    setUnreadCount(0);
  };

  const markOneRead = async (id: number) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: 1 } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleOpen = () => {
    setOpen((o) => !o);
  };

  // Determine the "view all" path based on current URL
  const isAdminContext = window.location.pathname.startsWith('/admin');
  const viewAllPath = isAdminContext ? '/admin/notifications' : '/notifications';

  return (
    <div ref={panelRef} className={`relative ${className}`}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-black flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="overflow-y-auto max-h-96 divide-y divide-border">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const { icon: Icon, cls } = typeIcon[n.type] ?? typeIcon.info;
                  return (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                        n.isRead ? '' : 'bg-primary/5'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${cls}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-tight ${n.isRead ? 'text-muted-foreground' : 'font-semibold'}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.isRead && (
                        <button
                          onClick={() => markOneRead(n.id)}
                          className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors shrink-0 mt-0.5"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            {/* Footer link */}
            <div className="border-t border-border px-4 py-2.5">
              <Link
                to={viewAllPath}
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1.5 text-xs text-primary font-semibold hover:underline"
              >
                View all notifications <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
