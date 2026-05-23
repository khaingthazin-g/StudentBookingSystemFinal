import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, LogOut, User as UserIcon, Calendar, Users, LayoutDashboard } from 'lucide-react';
import { User } from '@/types';
import NotificationBell from '@/components/NotificationBell';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const isActive = (path: string) =>
    location.pathname === path
      ? 'text-primary font-semibold bg-primary/10'
      : '';

  const getInitials = (name: string) =>
    name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-primary rounded-xl group-hover:rotate-12 transition-transform">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:inline-block">
            Tutor<span className="text-primary">Book</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link to="/">
            <Button variant="ghost" size="sm" className={`hidden md:flex rounded-full ${isActive('/')}`}>Home</Button>
          </Link>
          <Link to="/tutors">
            <Button variant="ghost" size="sm" className={`flex gap-2 rounded-full ${isActive('/tutors')}`}>
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Tutors</span>
            </Button>
          </Link>

          {user && user.role !== 'admin' && (
            <Link to="/my-appointments">
              <Button variant="ghost" size="sm" className={`flex gap-2 rounded-full ${isActive('/my-appointments')}`}>
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">My Appointments</span>
              </Button>
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link to="/admin">
              <Button size="sm" className="flex gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Admin Dashboard</span>
              </Button>
            </Link>
          )}

          <div className="h-6 w-px bg-border mx-1" />

          {user ? (
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Link to="/profile" className="hidden lg:flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-muted transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                  {getInitials(user.name)}
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-xs font-medium">{user.name}</span>
                  <span className="text-[10px] text-muted-foreground capitalize">{user.role}</span>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="rounded-full">Join Now</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
