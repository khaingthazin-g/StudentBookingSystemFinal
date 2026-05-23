import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Clock, MessageSquare, ArrowLeft } from 'lucide-react';
import { TUTORS } from '@/constants';
import { User } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface BookingProps {
  user: User;
}

export default function Booking({ user }: BookingProps) {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const tutor = TUTORS.find(t => t.id === tutorId);

  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!tutor) {
      toast.error('Tutor not found');
      navigate('/tutors');
    }
  }, [tutor, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      toast.error('Please select a date');
      return;
    }
    if (!time) {
      toast.error('Please select a time slot');
      return;
    }
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      toast.error('Please select a future date');
      return;
    }
    const trimmedMessage = message.trim();
    if (trimmedMessage.length > 500) {
      toast.error('Message must be under 500 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/appointments', {
        tutorId: tutor!.id,
        tutorName: tutor!.name,
        subject: tutor!.subject,
        date: format(date, 'yyyy-MM-dd'),
        time,
        message: trimmedMessage,
      });
      toast.success('Appointment booked successfully!');
      navigate('/my-appointments');
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tutor) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Book a Session</h1>
          <p className="text-muted-foreground text-sm">with {tutor.name} · {tutor.subject}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tutor card */}
        <div className="md:col-span-1 space-y-4">
          <Card className="overflow-hidden rounded-2xl border border-border shadow-sm bg-card">
            <img
              src={tutor.imageUrl}
              alt={tutor.name}
              className="aspect-square object-cover w-full"
              referrerPolicy="no-referrer"
            />
            <CardContent className="p-5 text-center space-y-1">
              <h2 className="text-lg font-bold">{tutor.name}</h2>
              <p className="text-primary text-sm font-medium">{tutor.subject} Expert</p>
            </CardContent>
          </Card>
          {/* Info hint */}
          <div className="bg-muted/40 rounded-2xl p-4 space-y-2 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground text-xs uppercase tracking-wide">Session Info</p>
            <p>• Sessions run 1 hour per booking</p>
            <p>• Sundays are unavailable</p>
            <p>• Cancellable until confirmed</p>
          </div>
        </div>

        {/* Booking form */}
        <div className="md:col-span-2">
          <Card className="rounded-2xl border border-border shadow-sm bg-card">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-xl">Your Session Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Popover>
                    <PopoverTrigger>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal rounded-xl h-11',
                          !date && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => date < new Date() || date.getDay() === 0}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Select Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <select
                      id="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary outline-none appearance-none"
                      required
                    >
                      <option value="">Choose a time slot</option>
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="01:00 PM">01:00 PM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:00 PM">03:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="message">Message <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                    <span className={`text-xs ${message.length > 450 ? 'text-destructive' : 'text-muted-foreground'}`}>{message.length}/500</span>
                  </div>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell the tutor what you'd like to focus on..."
                      maxLength={500}
                      className="w-full min-h-[120px] pl-10 pr-4 py-2 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary outline-none resize-none"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-full font-bold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
