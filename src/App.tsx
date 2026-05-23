import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Tutors from './pages/Tutors';
import Booking from './pages/Booking';
import MyAppointments from './pages/MyAppointments';
import Login from './pages/Login';
import Register from './pages/Register';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import StudentsAdmin from './pages/admin/StudentsAdmin';
import AdminTutors from './pages/admin/AdminTutors';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import { useEffect, useState } from 'react';
import api, { setAuthToken } from './lib/api';
import { User } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      } catch (error) {
        console.error("Auth check failed", error);
        setAuthToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="animate-bounce text-primary font-bold text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Admin layout routes */}
        <Route path="/admin" element={user ? <AdminLayout user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}>
          <Route index element={user?.role === 'admin' ? <AdminOverview /> : <Navigate to="/login" replace />} />
          <Route path="appointments" element={user?.role === 'admin' ? <MyAppointments user={user!} /> : <Navigate to="/login" replace />} />
          <Route path="students" element={user?.role === 'admin' ? <StudentsAdmin /> : <Navigate to="/login" replace />} />
          <Route path="tutors" element={user?.role === 'admin' ? <AdminTutors /> : <Navigate to="/login" replace />} />
          <Route path="profile" element={user ? <Profile user={user!} onUserUpdate={(u) => setUser(u)} /> : <Navigate to="/login" replace />} />
          <Route path="notifications" element={user ? <Notifications /> : <Navigate to="/login" replace />} />
        </Route>

        {/* Student-facing layout routes */}
        <Route path="*" element={
          <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
            <Navbar user={user} onLogout={handleLogout} />
            <main className="container mx-auto px-4 py-8 flex-1">
              <Routes>
                <Route path="/" element={<Home user={user} />} />
                <Route path="/tutors" element={<Tutors />} />
                <Route path="/book/:tutorId" element={user ? <Booking user={user} /> : <Navigate to="/login" />} />
                <Route path="/my-appointments" element={user ? <MyAppointments user={user} /> : <Navigate to="/login" />} />
                <Route path="/profile" element={user ? <Profile user={user} onUserUpdate={(u) => setUser(u)} /> : <Navigate to="/login" />} />
                <Route path="/notifications" element={user ? <Notifications /> : <Navigate to="/login" />} />
                <Route path="/login" element={!user ? <Login onLogin={(u) => setUser(u)} /> : <Navigate to="/" />} />
                <Route path="/register" element={!user ? <Register onRegister={(u) => setUser(u)} /> : <Navigate to="/" />} />
              </Routes>
            </main>
            <Footer />
            <Toaster position="top-center" richColors />
          </div>
        } />
      </Routes>
    </Router>
  );
}
