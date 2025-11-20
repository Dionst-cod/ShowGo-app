import { useEffect, useState } from 'react';
import { supabase, type Event } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import EventCard from './EventCard';
import EventModal from './EventModal';
import EditEventModal from './EditEventModal';
import CreateEventModal from './CreateEventModal';
import { Loader2, User as UserIcon, Plus } from 'lucide-react';

type TabType = 'attending' | 'created';

interface UserProfile {
  name: string;
  email: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('attending');
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      if (activeTab === 'created') {
        fetchCreatedEvents();
      } else if (activeTab === 'attending') {
        fetchAttendingEvents();
      }
    }
  }, [user, activeTab]);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setUserProfile(profile);
      }
    }

    setLoading(false);
  }

  async function fetchCreatedEvents() {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setCreatedEvents(data || []);
    } catch (err) {
      console.error('Error fetching created events:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAttendingEvents() {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('event_attendees')
        .select('event_id, events(*)')
        .eq('user_id', user.id);

      if (error) throw error;

      const events = (data || []).map(item => item.events).filter(Boolean) as Event[];
      setAttendingEvents(events);
    } catch (err) {
      console.error('Error fetching attending events:', err);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black pt-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400 text-lg">Please sign in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-black pt-24 px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <UserIcon className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {userProfile?.name || user.email}
                </h1>
                <p className="text-gray-400">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('attending')}
              className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                activeTab === 'attending'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_30px_rgba(139,92,246,0.4)]'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-800'
              }`}
            >
              Attending
            </button>
            <button
              onClick={() => setActiveTab('created')}
              className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                activeTab === 'created'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_30px_rgba(139,92,246,0.4)]'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-800'
              }`}
            >
              Created
            </button>
          </div>

          <div className="min-h-[400px]">
            {activeTab === 'attending' && (
              <>
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                  </div>
                ) : attendingEvents.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-gray-400 text-lg">
                      You're not attending any events yet
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {attendingEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        id={event.id}
                        name={event.name}
                        description={event.description}
                        imageUrl={event.image_url}
                        location={event.location}
                        venue={event.venue}
                        eventDate={event.event_date}
                        eventTime={event.event_time}
                        category={event.category}
                        onViewDetails={() => setSelectedEvent(event)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'created' && (
              <>
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                  </div>
                ) : createdEvents.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-gray-400 text-lg mb-6">
                      You haven't created any events yet
                    </p>
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-105"
                    >
                      <Plus className="w-5 h-5" />
                      Create your first event
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {createdEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        id={event.id}
                        name={event.name}
                        description={event.description}
                        imageUrl={event.image_url}
                        location={event.location}
                        venue={event.venue}
                        eventDate={event.event_date}
                        eventTime={event.event_time}
                        category={event.category}
                        onViewDetails={() => setSelectedEvent(event)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => {
            setSelectedEvent(null);
            if (activeTab === 'created') {
              fetchCreatedEvents();
            } else if (activeTab === 'attending') {
              fetchAttendingEvents();
            }
          }}
          onEdit={(event) => {
            setSelectedEvent(null);
            setEventToEdit(event);
          }}
        />
      )}

      {eventToEdit && (
        <EditEventModal
          event={eventToEdit}
          onClose={() => {
            setEventToEdit(null);
            if (activeTab === 'created') {
              fetchCreatedEvents();
            }
          }}
        />
      )}

      {isCreateModalOpen && (
        <CreateEventModal
          onClose={() => {
            setIsCreateModalOpen(false);
            if (activeTab === 'created') {
              fetchCreatedEvents();
            }
          }}
        />
      )}
    </>
  );
}
