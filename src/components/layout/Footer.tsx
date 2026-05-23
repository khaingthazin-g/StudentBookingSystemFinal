import { GraduationCap, Mail, Github, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-primary rounded-xl">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl tracking-tight">
                Tutor<span className="text-primary">Book</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Connecting students with expert tutors for personalized learning experiences.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold">Quick Links</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <Link to="/tutors" className="hover:text-primary transition-colors">Find Tutors</Link>
              <Link to="/my-appointments" className="hover:text-primary transition-colors">My Appointments</Link>
              <Link to="/register" className="hover:text-primary transition-colors">Create Account</Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold">Connect</h4>
            <div className="flex gap-3">
              <a
                href="mailto:contact@tutorbook.com"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" /> contact@tutorbook.com
              </a>
            </div>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} TutorBook. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
