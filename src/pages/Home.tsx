import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { CheckCircle2, Zap, Users, Calendar, Star, Shield, BarChart2, BookOpen } from 'lucide-react';
import { TUTORS } from '@/constants';
import { User } from '@/types';

interface HomeProps {
  user: User | null;
}

export default function Home({ user }: HomeProps) {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-primary/10 px-6 py-20 sm:px-12 sm:py-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-3xl mx-auto space-y-6"
        >
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground">
            Unlock Your Potential with <span className="text-primary">Expert Tutors</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Book personalized 1-on-1 sessions with the best tutors in Math, Science, English, and more. 
            Start your journey to academic excellence today.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link to="/tutors">
              <Button size="lg" className="rounded-full px-8 text-lg h-14">Find a Tutor</Button>
            </Link>
            <Link to={user ? "/my-appointments" : "/register"}>
              <Button size="lg" variant="outline" className="rounded-full px-8 text-lg h-14 bg-background">
                {user ? "My Appointments" : "Get Started Free"}
              </Button>
            </Link>
          </div>
        </motion.div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </section>

      {/* How it Works */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold">How It Works</h2>
            <p className="text-muted-foreground text-sm mt-1">Three simple steps to start learning</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: Users, title: 'Choose a Tutor', desc: 'Browse our expert tutors and find the perfect match for your subject.' },
            { icon: Zap, title: 'Book a Session', desc: 'Select a convenient date and time that fits your schedule.' },
            { icon: CheckCircle2, title: 'Start Learning', desc: 'Connect with your tutor and start achieving your academic goals.' },
          ].map((step, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              className="relative p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4"
            >
              <span className="absolute top-4 right-5 text-6xl font-black text-muted/30 leading-none select-none">{i + 1}</span>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <step.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Tutors */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold">Featured Tutors</h2>
            <p className="text-muted-foreground text-sm mt-1">Learn from our highly qualified professionals</p>
          </div>
          <Link to="/tutors">
            <Button variant="ghost" className="text-primary font-bold text-sm">View All →</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TUTORS.slice(0, 3).map((tutor) => (
            <motion.div key={tutor.id} whileHover={{ scale: 1.02 }} className="group">
              <Card className="overflow-hidden rounded-2xl border border-border shadow-sm hover:shadow-lg transition-shadow bg-card">
                <div className="aspect-square relative overflow-hidden">
                  <img src={tutor.imageUrl} alt={tutor.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-primary/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Link to={`/book/${tutor.id}`}>
                      <Button variant="secondary" className="rounded-full gap-2 font-bold shadow-lg">
                        <BookOpen className="w-4 h-4" /> Book Now
                      </Button>
                    </Link>
                  </div>
                </div>
                <CardContent className="p-6 space-y-4 text-center">
                  <div>
                    <h3 className="text-xl font-bold">{tutor.name}</h3>
                    <p className="text-primary font-medium">{tutor.subject}</p>
                  </div>
                  <Link to={`/book/${tutor.id}`}>
                    <Button className="w-full rounded-full h-12">Book Now</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold">Why Choose Our Service?</h2>
            <p className="text-muted-foreground text-sm mt-1">Everything you need for a better learning experience</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: Calendar, title: 'Flexible Scheduling', desc: 'Book sessions that fit perfectly into your busy life and academic schedule.', color: 'bg-primary' },
            { icon: Star, title: 'Expert Tutors', desc: 'Learn from highly qualified and verified professionals across all subjects.', color: 'bg-secondary' },
            { icon: Shield, title: 'Secure Process', desc: 'Your data and bookings are protected with our robust security systems.', color: 'bg-accent' },
            { icon: BarChart2, title: 'Real-time Tracking', desc: 'Monitor your progress and stay on top of all your upcoming sessions.', color: 'bg-primary' },
          ].map((benefit, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-3"
            >
              <div className={`w-12 h-12 ${benefit.color} rounded-2xl flex items-center justify-center text-primary-foreground`}>
                <benefit.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{benefit.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground space-y-6">
        <h2 className="text-3xl font-black">Ready to start learning?</h2>
        <p className="text-primary-foreground/80 max-w-xl mx-auto">
          Join hundreds of students already booking sessions with our expert tutors.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/tutors">
            <Button size="lg" variant="secondary" className="rounded-full px-8 font-bold">
              Browse Tutors
            </Button>
          </Link>
          <Link to="/register">
            <Button size="lg" variant="outline" className="rounded-full px-8 font-bold border-primary-foreground/40 text-primary-foreground bg-transparent hover:bg-primary-foreground/10">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
