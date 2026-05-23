import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User as UserIcon, Trash2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { User, Appointment } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';

interface MyAppointmentsProps {
  user: User;
}

type FilterStatus = 'All' | 'Pending' | 'Approved' | 'Cancelled';

const FILTER_TABS: FilterStatus[] = ['All', 'Pending', 'Approved', 'Cancelled'];

const statusBorderClass: Record<string, string> = {
  Approved: 'border-l-4 border-l-green-500',
  Cancelled: 'border-l-4 border-l-red-400',
  Pending: 'border-l-4 border-l-yellow-400',
};

export default function MyAppointments({ user }: MyAppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('All');

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
      setActionId(null);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const handleStatusUpdate = async (id: string, newStatus: 'Approved' | 'Cancelled') => {
    setActionId(id);
    try {
      await api.patch(`/appointments/${id}`, { status: newStatus });
      toast.success(`Appointment ${newStatus.toLowerCase()} successfully`);
      await fetchAppointments();
    } catch (error) {
      toast.error('Failed to update status');
      setActionId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-green-100 text-green-800 border-none flex gap-1 items-center dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 className="w-3 h-3" /> Approved</Badge>;
      case 'Cancelled':
        return <Badge variant="destructive" className="flex gap-1 items-center"><XCircle className="w-3 h-3" /> Cancelled</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-none flex gap-1 items-center dark:bg-yellow-900/30 dark:text-yellow-400"><AlertCircle className="w-3 h-3" /> Pending</Badge>;
    }
  };

  const counts = {
    All: appointments.length,
    Pending: appointments.filter(a => a.status === 'Pending').length,
    Approved: appointments.filter(a => a.status === 'Approved').length,
    Cancelled: appointments.filter(a => a.status === 'Cancelled').length,
  };

  const filtered = activeFilter === 'All' ? appointments : appointments.filter(a => a.status === activeFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-3xl font-bold">
            {user.role === 'admin' ? 'All Appointments' : 'My Appointments'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {user.role === 'admin' ? 'Manage student bookings' : 'Track your learning sessions'}
          </p>
        </div>
        <Badge variant="outline" className="self-start sm:self-auto text-sm px-3 py-1 rounded-full">
          {filtered.length} {activeFilter === 'All' ? 'total' : activeFilter.toLowerCase()}
        </Badge>
      </div>

      {/* Filter bar */}
      <div className="bg-muted/40 rounded-2xl p-3 flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <Button
            key={tab}
            variant={activeFilter === tab ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveFilter(tab)}
            className="rounded-full gap-1.5"
          >
            {tab}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeFilter === tab
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'bg-background text-muted-foreground'
            }`}>
              {counts[tab]}
            </span>
          </Button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <Card className="rounded-3xl border-dashed border-2 bg-muted/50 py-20">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <Calendar className="w-16 h-16 text-muted-foreground opacity-20" />
            <h3 className="text-xl font-bold text-muted-foreground">
              {activeFilter === 'All' ? 'No appointments yet' : `No ${activeFilter} appointments`}
            </h3>
            {user.role === 'student' && activeFilter === 'All' && (
              <Button onClick={() => window.location.href = '/tutors'} className="rounded-full">
                Book your first session
              </Button>
            )}
            {activeFilter !== 'All' && (
              <Button variant="outline" className="rounded-full" onClick={() => setActiveFilter('All')}>
                View all appointments
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((appointment) => (
              <motion.div
                key={appointment.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className={`rounded-2xl shadow-md hover:shadow-lg transition-shadow bg-card overflow-hidden ${statusBorderClass[appointment.status] ?? ''}`}>
                  <div className="flex flex-col md:flex-row">
                    <div className="p-6 flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
                      {/* Tutor */}
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tutor & Subject</p>
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <UserIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold leading-tight">{appointment.tutorName}</p>
                            <p className="text-sm text-primary">{appointment.subject}</p>
                          </div>
                        </div>
                      </div>

                      {/* Date/Time */}
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date & Time</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Calendar className="w-4 h-4 text-secondary shrink-0" />
                            {appointment.date}
                          </div>
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Clock className="w-4 h-4 text-secondary shrink-0" />
                            {appointment.time}
                          </div>
                        </div>
                      </div>

                      {/* Student */}
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Student</p>
                        <p className="font-medium">{appointment.studentName}</p>
                        {appointment.message && (
                          <p className="text-xs text-muted-foreground italic line-clamp-2 max-w-[180px]">
                            "{appointment.message}"
                          </p>
                        )}
                      </div>

                      {/* Status */}
                      <div className="space-y-1 sm:text-right">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</p>
                        {getStatusBadge(appointment.status)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-muted/30 px-4 py-4 flex md:flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-border">
                      {user.role === 'admin' ? (
                        <>
                          {appointment.status === 'Pending' && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
                              onClick={() => handleStatusUpdate(appointment.id, 'Approved')}
                              disabled={actionId === appointment.id}
                            >
                              {actionId === appointment.id ? '...' : 'Approve'}
                            </Button>
                          )}
                          {appointment.status !== 'Cancelled' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-xl"
                              onClick={() => handleStatusUpdate(appointment.id, 'Cancelled')}
                              disabled={actionId === appointment.id}
                            >
                              {actionId === appointment.id ? '...' : 'Cancel'}
                            </Button>
                          )}
                        </>
                      ) : (
                        <>
                          {(appointment.status === 'Pending' || appointment.status === 'Approved') && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-xl flex gap-2"
                              onClick={() => handleStatusUpdate(appointment.id, 'Cancelled')}
                              disabled={actionId === appointment.id}
                            >
                              <Trash2 className="w-4 h-4" />
                              {actionId === appointment.id ? 'Cancelling...' : 'Cancel'}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
