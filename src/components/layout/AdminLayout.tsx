import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { User } from '@/types';
import { Menu } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import { Toaster } from 'sonner';

interface AdminLayoutProps {
  user: User;
  onLogout: () => void;
}

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard Overview',
  '/admin/appointments': 'Appointments',
  '/admin/students': 'Students',
  '/admin/tutors': 'Tutors',
  '/admin/profile': 'My Profile',
  '/admin/notifications': 'Notifications',
};

export default function AdminLayout({ user, onLogout }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const pageTitle = pageTitles[location.pathname] ?? 'Admin';

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar
        user={user}
        onLogout={handleLogout}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="flex-1 md:ml-60 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-border bg-card/80 backdrop-blur flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-muted"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm font-semibold leading-tight">{pageTitle}</h2>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <div className="h-5 w-px bg-border" />
            <span className="text-sm font-medium hidden sm:block">{user.name}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-8">
          <Outlet />
        </main>
      </div>

      <Toaster position="top-center" richColors />
    </div>
  );
}
