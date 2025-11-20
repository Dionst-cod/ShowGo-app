import { X, Calendar, Clock, MapPin, Music, Sparkles, Trash2, Edit, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase, type Event } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface EventModalProps {
  event: Event;
  onClose: () => void;
  onEdit: (event: Event) => void;
  onSignUpOpen?: () => void;
}

export default function EventModal({ event, onClose, onEdit, onSignUpOpen }: EventModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [canModify, setCanModify] = useState(false);
  const [isAttending, setIsAttending] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);

  useEffect(() => {
    checkUser();
    checkAttendance();
    fetchAttendeeCount();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      const isOwner = session?.user?.id === event.user_id;
      setCanModify(!!session?.user && isOwner);
      if (session?.user) {
        checkAttendance();
      } else {
        setIsAttending(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [event.user_id, event.id]);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    const isOwner = user?.id === event.user_id;
    setCanModify(!!user && isOwner);
  }

  async function checkAttendance() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsAttending(false);
      return;
    }

    const { data } = await supabase
      .from('event_attendees')
      .select('id')
      .eq('event_id', event.id)
      .eq('user_id', user.id)
      .maybeSingle();

    setIsAttending(!!data);
  }

  async function fetchAttendeeCount() {
    const { count } = await supabase
      .from('event_attendees')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', event.id);

    setAttendeeCount(count || 0);
  }

  async function handleAttendanceToggle() {
    if (!user) return;

    setIsLoadingAttendance(true);

    try {
      if (isAttending) {
        const { error } = await supabase
          .from('event_attendees')
          .delete()
          .eq('event_id', event.id)
          .eq('user_id', user.id);

        if (error) throw error;
        setIsAttending(false);
        setAttendeeCount(prev => Math.max(0, prev - 1));
      } else {
        const { error } = await supabase
          .from('event_attendees')
          .insert({ event_id: event.id, user_id: user.id });

        if (error) throw error;
        setIsAttending(true);
        setAttendeeCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error toggling attendance:', err);
      alert('Failed to update attendance. Please try again.');
    } finally {
      setIsLoadingAttendance(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);

      if (error) throw error;

      onClose();
      window.location.reload();
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('Failed to delete event. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-black rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-[0_0_60px_rgba(139,92,246,0.4)] border border-purple-500/20 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2.5 bg-black/60 hover:bg-black/80 rounded-full transition-all duration-300 backdrop-blur-md border border-white/10 hover:border-purple-500/50 hover:scale-110 group"
          aria-label="Close modal"
        >
          <X className="w-6 h-6 text-white group-hover:text-purple-400 transition-colors" />
        </button>

        <div className="relative h-96 overflow-hidden">
          <img
            src={event.image_url}
            alt={event.name}
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-transparent to-pink-900/30"></div>

          <div className="absolute bottom-0 left-0 right-0 p-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 backdrop-blur-md rounded-full text-sm font-bold text-white shadow-lg">
                <Sparkles className="w-4 h-4" />
                {event.category}
              </div>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-3 drop-shadow-2xl tracking-tight">
              {event.name}
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-24rem)] p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            <div className="group flex items-start gap-4 p-5 bg-gradient-to-br from-purple-950/30 to-purple-900/10 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-purple-300 text-sm font-bold mb-1.5 uppercase tracking-wide">Date</p>
                <p className="text-white font-semibold text-lg">{formatDate(event.event_date)}</p>
              </div>
            </div>

            <div className="group flex items-start gap-4 p-5 bg-gradient-to-br from-pink-950/30 to-pink-900/10 rounded-2xl border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]">
              <div className="p-3 bg-gradient-to-br from-pink-600 to-pink-700 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-pink-300 text-sm font-bold mb-1.5 uppercase tracking-wide">Time</p>
                <p className="text-white font-semibold text-lg">{event.event_time}</p>
              </div>
            </div>

            <div className="group flex items-start gap-4 p-5 bg-gradient-to-br from-purple-950/30 to-purple-900/10 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] md:col-span-2">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-purple-300 text-sm font-bold mb-1.5 uppercase tracking-wide">Location</p>
                <p className="text-white font-semibold text-lg">{event.location}</p>
              </div>
            </div>
          </div>

          <div className="relative p-8 bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
            <div className="absolute -top-3 left-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-bold text-white">Event Details</span>
              </div>
            </div>

            <h3 className="text-3xl font-black text-white mb-6 mt-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              About This Event
            </h3>
            <div className="text-gray-300 leading-relaxed text-lg space-y-5">
              <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-purple-400 first-letter:mr-2 first-letter:float-left">
                {event.description}
              </p>
              <p className="pl-4 border-l-4 border-purple-500/50">
                This promises to be an unforgettable evening filled with exceptional performances and an
                electric atmosphere. Whether you're a longtime fan or discovering this experience for the
                first time, this event offers something special for everyone.
              </p>
              <p>
                The venue provides world-class acoustics and an intimate setting that allows you to connect
                with the performance in a truly memorable way. Doors open one hour before showtime, giving
                you plenty of time to explore the venue, grab refreshments, and find your perfect spot.
              </p>
              <p className="text-gray-400 italic bg-gradient-to-r from-purple-950/20 to-pink-950/20 p-5 rounded-xl border-l-4 border-purple-500">
                Join fellow enthusiasts for an evening that celebrates artistry, creativity, and the power
                of live performance. This is more than just an event - it's an experience you'll be talking
                about for years to come.
              </p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-br from-green-950/30 to-green-900/10 rounded-2xl border border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-bold mb-1 uppercase tracking-wide">Attendance</p>
                <p className="text-white text-lg font-semibold">{attendeeCount} {attendeeCount === 1 ? 'person' : 'people'} attending</p>
              </div>
              {user ? (
                <button
                  onClick={handleAttendanceToggle}
                  disabled={isLoadingAttendance}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                    isAttending
                      ? 'bg-green-600/20 hover:bg-green-600/30 border border-green-500/40 hover:border-green-500/60 text-green-400 hover:text-green-300'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                  }`}
                >
                  <Check className="w-5 h-5" />
                  {isLoadingAttendance ? 'Updating...' : isAttending ? 'Attending' : 'Attend Event'}
                </button>
              ) : (
                <button
                  onClick={onSignUpOpen}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                >
                  <Check className="w-5 h-5" />
                  Join to attend
                </button>
              )}
            </div>
          </div>

          {canModify && (
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-5 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 hover:border-red-500/60 text-red-400 hover:text-red-300 rounded-xl transition-all duration-300 font-semibold hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => onEdit(event)}
                disabled={isDeleting}
                className="flex items-center gap-2 px-5 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 hover:border-blue-500/60 text-blue-400 hover:text-blue-300 rounded-xl transition-all duration-300 font-semibold hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
