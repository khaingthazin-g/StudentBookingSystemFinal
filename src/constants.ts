import { Tutor } from './types';

export const TUTORS: Tutor[] = [
  { id: '1', name: 'Dr. Sarah Johnson', subject: 'Math', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop' },
  { id: '2', name: 'Prof. Michael Chen', subject: 'Science', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop' },
  { id: '3', name: 'Emily Davis, M.A.', subject: 'English', imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop' },
  { id: '4', name: 'James Wilson', subject: 'Computer', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop' },
  { id: '5', name: 'Jessica Brown', subject: 'Math', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop' },
  { id: '6', name: 'David Lee', subject: 'Computer', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' },
];

export const SUBJECTS = ['All', 'Math', 'English', 'Science', 'Computer'] as const;
