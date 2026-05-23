export interface User {
  id: string | number;
  email: string;
  name: string;
  role: 'student' | 'admin';
}

export interface Tutor {
  id: string;
  name: string;
  subject: 'Math' | 'English' | 'Science' | 'Computer';
  imageUrl: string;
}

export interface Appointment {
  id: string;
  studentId: string;
  studentName: string;
  tutorId: string;
  tutorName: string;
  subject: string;
  date: string;
  time: string;
  message: string;
  status: 'Pending' | 'Approved' | 'Cancelled';
  createdAt: any;
}
