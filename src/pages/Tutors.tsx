import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TUTORS, SUBJECTS } from '@/constants';
import { Input } from '@/components/ui/input';

export default function Tutors() {
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTutors = TUTORS.filter(tutor => {
    const matchesSubject = selectedSubject === 'All' || tutor.subject === selectedSubject;
    const matchesSearch = tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutor.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-3xl font-bold">Our Tutors</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filteredTutors.length} tutor{filteredTutors.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <div className="relative shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or subject..."
            className="pl-10 w-full sm:w-64 rounded-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Subject filter bar */}
      <div className="bg-muted/40 rounded-2xl p-3 flex flex-wrap gap-2">
        {SUBJECTS.map((subject) => (
          <Button
            key={subject}
            variant={selectedSubject === subject ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedSubject(subject)}
            className="rounded-full"
          >
            {subject}
          </Button>
        ))}
      </div>

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <AnimatePresence mode="popLayout">
          {filteredTutors.map((tutor) => (
            <motion.div
              key={tutor.id}
              layout
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="overflow-hidden rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 bg-card h-full flex flex-col group">
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={tutor.imageUrl}
                    alt={tutor.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-primary/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Link to={`/book/${tutor.id}`}>
                      <Button variant="secondary" className="rounded-full gap-2 font-bold shadow-lg">
                        <BookOpen className="w-4 h-4" /> Book Session
                      </Button>
                    </Link>
                  </div>
                  <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground border-none text-xs">
                    {tutor.subject}
                  </Badge>
                </div>
                <CardContent className="p-5 flex-1 flex flex-col justify-between gap-3">
                  <div className="text-center space-y-1">
                    <h3 className="font-bold text-base">{tutor.name}</h3>
                    <p className="text-xs text-primary font-medium uppercase tracking-wide">
                      {tutor.subject} Specialist
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      Providing high-quality academic support in {tutor.subject}.
                    </p>
                  </div>
                  <Link to={`/book/${tutor.id}`} className="mt-auto">
                    <Button className="w-full rounded-full h-10 text-sm">Book Session</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty state */}
      {filteredTutors.length === 0 && (
        <div className="text-center py-24 space-y-4">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Search className="w-9 h-9 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold">No tutors found</h3>
          <p className="text-muted-foreground text-sm">Try adjusting your filters or search query</p>
          <Button variant="outline" className="rounded-full" onClick={() => { setSelectedSubject('All'); setSearchQuery(''); }}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
