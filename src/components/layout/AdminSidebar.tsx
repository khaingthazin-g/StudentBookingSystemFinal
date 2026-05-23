import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, GraduationCap, LogOut, ChevronRight, X, UserCircle, Bell } from 'lucide-react';
import { User } from '@/types';

const navItems = [
  { path: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { path: '/admin/appointments', label: 'Appointments', icon: Calendar },
  { path: '/admin/students', label: 'Students', icon: Users },
  { path: '/admin/tutors', label: 'Tutors', icon: GraduationCap },
  { path: '/admin/notifications', label: 'Notifications', icon: Bell },
  { path: '/admin/profile', label: 'My Profile', icon: UserCircle },
];

interface AdminSidebarProps {
  user: User;
  onLogout: () => void;
  open: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ user, onLogout, open, onClose }: AdminSidebarProps) {
  const location = useLocation();

  const isActive = (path: string, exact?: boolean) =>
    exact ? location.pathname === path : location.pathname === path;

  const getInitials = (name: string) =>
    name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border flex items-center justify-between">
        <Link to="/admin" onClick={onClose} className="flex items-center gap-2.5">
          <div className="p-1.5 bg-primary rounded-lg">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight">
              Tutor<span className="text-primary">Book</span>
            </span>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Admin Portal</p>
          </div>
        </Link>
        <button onClick={onClose} className="md:hidden p-1 rounded-lg hover:bg-muted">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 mb-3">
          Menu
        </p>
        {navItems.map((item) => {
          const active = isActive(item.path, item.exact);
          return (
            <Link key={item.path} to={item.path} onClick={onClose}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="px-3 py-4 border-t border-border space-y-2">
        <Link to="/admin/profile" onClick={onClose}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/60 hover:bg-muted transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
              {getInitials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-60 bg-card border-r border-border z-40">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={onClose} />
          <aside className="relative flex flex-col w-64 bg-card border-r border-border h-full z-50">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
