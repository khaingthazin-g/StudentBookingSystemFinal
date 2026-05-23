import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Mail, ShieldCheck, Calendar, BookOpen, CheckCircle2, Clock,
  XCircle, Lock, Pencil, Users, LayoutDashboard, Eye, EyeOff,
  Save, X, Bell, GraduationCap, Settings, Check,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfileProps {
  user: User;
  onUserUpdate: (u: User) => void;
}

interface Stats {
  role: string;
  memberSince: string;
  total?: number;
  pending?: number;
  approved?: number;
  cancelled?: number;
  totalStudents?: number;
  totalAppointments?: number;
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

function PasswordInput({ id, value, onChange, placeholder, required, minLength }: any) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="rounded-xl pr-10"
        required={required}
        minLength={minLength}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function Profile({ user, onUserUpdate }: ProfileProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [name, setName] = useState(user.name);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    api.get('/auth/profile-stats')
      .then((r) => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoadingStats(false));
  }, []);

  const handleSaveName = async () => {
    if (!name.trim() || name.trim() === user.name) return;
    setSaving(true);
    try {
      const r = await api.put('/auth/profile', { name });
      onUserUpdate(r.data.user);
      toast.success('Name updated');
    } catch (e: any) {
      toast.error(e.response?.data?.error ?? 'Failed to update name');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (newPassword.length < 6) { toast.error('Minimum 6 characters'); return; }
    setSavingPw(true);
    try {
      await api.put('/auth/profile', { currentPassword, newPassword });
      toast.success('Password changed');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (e: any) {
      toast.error(e.response?.data?.error ?? 'Failed to change password');
    } finally { setSavingPw(false); }
  };

  const isAdmin = user.role === 'admin';

  const statCards = isAdmin ? [
    { label: 'Total Students', value: stats?.totalStudents ?? 0, icon: Users,        color: 'bg-primary/10 text-primary',     num: 'text-primary' },
    { label: 'Total Bookings', value: stats?.totalAppointments ?? 0, icon: BookOpen, color: 'bg-secondary/10 text-secondary', num: 'text-secondary' },
    { label: 'Pending',        value: stats?.pending ?? 0,    icon: Clock,            color: 'bg-accent/20 text-accent-foreground', num: 'text-amber-600' },
    { label: 'Approved',       value: stats?.approved ?? 0,   icon: CheckCircle2,    color: 'bg-primary/10 text-primary',     num: 'text-primary' },
  ] : [
    { label: 'Total Bookings', value: stats?.total ?? 0,      icon: BookOpen,         color: 'bg-primary/10 text-primary',     num: 'text-primary' },
    { label: 'Approved',       value: stats?.approved ?? 0,   icon: CheckCircle2,    color: 'bg-secondary/10 text-secondary', num: 'text-secondary' },
    { label: 'Pending',        value: stats?.pending ?? 0,    icon: Clock,            color: 'bg-accent/20 text-accent-foreground', num: 'text-amber-600' },
    { label: 'Cancelled',      value: stats?.cancelled ?? 0,  icon: XCircle,          color: 'bg-destructive/10 text-destructive', num: 'text-destructive' },
  ];

  return (
    <div className="w-full space-y-6">

      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your account and security settings</p>
        </div>
        <div className="flex gap-2">
          {isAdmin
            ? <Link to="/admin"><Button variant="outline" size="sm" className="rounded-xl gap-2"><LayoutDashboard className="w-4 h-4" />Dashboard</Button></Link>
            : <Link to="/my-appointments"><Button variant="outline" size="sm" className="rounded-xl gap-2"><BookOpen className="w-4 h-4" />My Bookings</Button></Link>
          }
          <Link to={isAdmin ? '/admin/notifications' : '/notifications'}>
            <Button variant="outline" size="sm" className="rounded-xl gap-2"><Bell className="w-4 h-4" />Notifications</Button>
          </Link>
        </div>
      </div>

      {/* Top row: identity + stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Identity card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="rounded-2xl border border-border shadow-sm h-full">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4 h-full">
              {/* Avatar */}
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-primary-foreground ${isAdmin ? 'bg-primary' : 'bg-secondary'}`}>
                {getInitials(user.name)}
              </div>

              {/* Name editor */}
              <div className="w-full space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl text-center font-semibold"
                  />
                  <Button
                    size="icon"
                    onClick={handleSaveName}
                    disabled={saving || name.trim() === user.name}
                    className="rounded-xl shrink-0 w-9 h-9"
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Role badge */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isAdmin ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                {isAdmin ? <Settings className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                {isAdmin ? 'Administrator' : 'Student'}
              </span>

              <div className="w-full space-y-2.5 text-sm text-left pt-1 border-t border-border">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Mail className="w-4 h-4 shrink-0 text-primary" />
                  <span className="truncate">{user.email}</span>
                </div>
                {stats?.memberSince && (
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Calendar className="w-4 h-4 shrink-0 text-primary" />
                    <span>Joined {new Date(stats.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stat cards — 2x2 on the right */}
        <div className="lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            {isAdmin ? 'System Overview' : 'Your Activity'}
          </p>
          <div className="grid grid-cols-2 gap-3 h-[calc(100%-28px)]">
            {loadingStats
              ? [...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />)
              : statCards.map((card, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <Card className="rounded-2xl border border-border shadow-sm h-full">
                    <CardContent className="p-5 flex flex-col gap-3 h-full justify-between">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.color}`}>
                        <card.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className={`text-3xl font-black tabular-nums ${card.num}`}>{card.value}</p>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">{card.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Bottom row: account info + password */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Account Info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="rounded-2xl border border-border shadow-sm">
            <CardHeader className="border-b border-border px-6 pt-5 pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Pencil className="w-3.5 h-3.5 text-primary" />
                </div>
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email Address</Label>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/50 border border-border">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground flex-1 truncate">{user.email}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-semibold shrink-0">Verified</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Role</Label>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/50 border border-border">
                  {isAdmin ? <Settings className="w-4 h-4 text-primary shrink-0" /> : <GraduationCap className="w-4 h-4 text-secondary shrink-0" />}
                  <span className={`text-sm font-semibold capitalize ${isAdmin ? 'text-primary' : 'text-secondary'}`}>{user.role}</span>
                </div>
              </div>

              {stats?.memberSince && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Member Since</Label>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/50 border border-border">
                    <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      {new Date(stats.memberSince).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Change Password */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="rounded-2xl border border-border shadow-sm">
            <CardHeader className="border-b border-border px-6 pt-5 pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                </div>
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cur-pw" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Current Password</Label>
                  <PasswordInput id="cur-pw" value={currentPassword} onChange={(e: any) => setCurrentPassword(e.target.value)} placeholder="Enter current password" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-pw" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">New Password</Label>
                  <PasswordInput id="new-pw" value={newPassword} onChange={(e: any) => setNewPassword(e.target.value)} placeholder="At least 6 characters" required minLength={6} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm-pw" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Confirm Password</Label>
                  <PasswordInput id="confirm-pw" value={confirmPassword} onChange={(e: any) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" required />
                  {newPassword && confirmPassword && (
                    newPassword === confirmPassword
                      ? <p className="text-xs text-secondary flex items-center gap-1 mt-1"><Check className="w-3 h-3" /> Passwords match</p>
                      : <p className="text-xs text-destructive flex items-center gap-1 mt-1"><X className="w-3 h-3" /> Passwords do not match</p>
                  )}
                </div>
                <Button type="submit" disabled={savingPw} className="w-full rounded-xl gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  {savingPw ? 'Updating…' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
