import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api, { setAuthToken } from '@/lib/api';
import { toast } from 'sonner';
import { GraduationCap, Mail, Lock, ArrowRight, Eye, EyeOff, BookOpen, Users, CheckCircle2 } from 'lucide-react';

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error('Please enter a valid email address (e.g., user@gmail.com)');
      return;
    }
    if (!trimmedPassword) {
      toast.error('Password is required');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email: trimmedEmail, password: trimmedPassword });
      const { token, user } = response.data;
      setAuthToken(token);
      onLogin(user);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error: any) {
      const message = error.response?.data?.error === 'User not found' || error.response?.data?.error === 'Invalid credentials'
        ? 'Invalid email or password'
        : (error.response?.data?.error || 'Failed to login');
      toast.error(message);
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
        {/* Left brand panel */}
        <div className="hidden md:flex flex-col justify-between bg-primary p-10 text-primary-foreground">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary-foreground/20 rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl">TutorBook</span>
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-black leading-tight">
              Learn smarter,<br />achieve more.
            </h2>
            <ul className="space-y-3">
              {[
                { icon: Users, text: 'Connect with expert tutors' },
                { icon: BookOpen, text: 'Book sessions in seconds' },
                { icon: CheckCircle2, text: 'Track all your appointments' },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-primary-foreground/90 text-sm">
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-primary-foreground/50">© {new Date().getFullYear()} TutorBook</p>
        </div>

        {/* Right form panel */}
        <div className="bg-card p-8 sm:p-10 flex flex-col justify-center space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-black">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button variant="link" className="px-0 h-auto text-xs text-primary">Forgot password?</Button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 rounded-full font-bold group" disabled={loading}>
              {loading ? 'Signing in...' : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">Create one</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
