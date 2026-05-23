import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CalendarPlus, GraduationCap } from 'lucide-react';
import { TUTORS } from '@/constants';

const subjectColors: Record<string, string> = {
  Math: 'bg-primary/10 text-primary border-primary/20',
  Science: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400',
  English: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
  Computer: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400',
};

export default function AdminTutors() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight">Tutors</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {TUTORS.length} tutor{TUTORS.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {TUTORS.map((tutor, i) => (
          <motion.div
            key={tutor.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className="rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
              {/* Photo */}
              <div className="relative h-40 bg-muted overflow-hidden">
                <img
                  src={tutor.imageUrl}
                  alt={tutor.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <Badge
                  className={`absolute top-3 right-3 text-xs font-semibold border ${subjectColors[tutor.subject] ?? 'bg-muted text-muted-foreground'}`}
                >
                  {tutor.subject}
                </Badge>
              </div>

              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm leading-tight">{tutor.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{tutor.subject} Specialist</p>
                  </div>
                </div>

                <Link to={`/book/${tutor.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-xl text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    View & Book
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
