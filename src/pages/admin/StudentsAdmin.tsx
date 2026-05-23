import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, Search, Calendar } from 'lucide-react';
import api from '@/lib/api';

interface StudentRow {
  id: number;
  name: string;
  email: string;
  created_at: string;
  appointmentCount: number;
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

function AvatarColors(id: number) {
  const colors = [
    'bg-primary text-primary-foreground',
    'bg-secondary text-secondary-foreground',
    'bg-accent text-accent-foreground',
    'bg-indigo-500 text-white',
    'bg-teal-500 text-white',
    'bg-amber-500 text-white',
    'bg-violet-500 text-white',
    'bg-rose-500 text-white',
  ];
  return colors[id % colors.length];
}

export default function StudentsAdmin() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/students')
      .then((r) => setStudents(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight">Students</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {students.length} registered student{students.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="pl-9 rounded-full border-border bg-background"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto opacity-30 mb-3" />
          <p className="font-medium">{search ? 'No results found' : 'No students yet'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((student, i) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black ${AvatarColors(student.id)}`}
                    >
                      {getInitials(student.name)}
                    </div>
                    <div className="min-w-0 w-full">
                      <p className="font-semibold text-sm truncate">{student.name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{student.email}</p>
                    </div>
                    <div className="w-full pt-2 border-t border-border grid grid-cols-2 gap-2 text-center">
                      <div>
                        <div className="flex items-center justify-center gap-1 text-primary">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="text-sm font-bold">{student.appointmentCount}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Bookings</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          {new Date(student.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Joined</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
