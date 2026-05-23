import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import { toast } from 'sonner';
import { GraduationCap, Mail, Lock, User as UserIcon, ArrowRight, Star, Zap, Heart } from 'lucide-react';

interface RegisterProps {
  onRegister: (user: any) => void;
}

export default function Register({ onRegister }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedName || trimmedName.length < 2) {
      toast.error('Full name must be at least 2 characters');
      return;
    }
    if (trimmedName.length > 100) {
      toast.error('Full name must be under 100 characters');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error('Please enter a valid email address (e.g., user@gmail.com)');
      return;
    }
    if (trimmedPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (trimmedPassword.length > 128) {
      toast.error('Password must be under 128 characters');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', { name: trimmedName, email: trimmedEmail, password: trimmedPassword, role: 'student' });
      toast.success('Account created! Please log in to continue.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl border border-border"
      >
        {/* Right form panel first on mobile, left on desktop */}
        <div className="bg-card p-8 sm:p-10 flex flex-col justify-center space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-black">Create your account</h1>
            <p className="text-sm text-muted-foreground">Join our community of learners today</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-11 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password <span className="text-xs text-muted-foreground">(min 6 characters)</span></Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 rounded-xl"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-full font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 group"
              disabled={loading}
            >
              {loading ? 'Creating account...' : (
                <span className="flex items-center gap-2">
                  Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-secondary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>

        {/* Right brand panel */}
        <div className="hidden md:flex flex-col justify-between bg-secondary p-10 text-secondary-foreground">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-secondary-foreground/20 rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl">TutorBook</span>
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-black leading-tight">
              Your academic<br />success starts here.
            </h2>
            <ul className="space-y-3">
              {[
                { icon: Star, text: 'Top-rated expert tutors' },
                { icon: Zap, text: 'Instant session booking' },
                { icon: Heart, text: 'Personalised learning' },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-secondary-foreground/90 text-sm">
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-secondary-foreground/50">© {new Date().getFullYear()} TutorBook</p>
        </div>
      </motion.div>
    </div>
  );
}
