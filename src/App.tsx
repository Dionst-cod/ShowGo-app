import { useEffect, useState } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import EventCard from './components/EventCard';
import CategoryFilter from './components/CategoryFilter';
import EventModal from './components/EventModal';
import EditEventModal from './components/EditEventModal';
import SignUpModal from './components/SignUpModal';
import SignInModal from './components/SignInModal';
import Profile from './components/Profile';
import { supabase, type Event } from './lib/supabase';
import { Loader2 } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

type Page = 'home' | 'profile';

const EVENTS_PER_PAGE = 3;

function App() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [displayedEvents, setDisplayedEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(EVENTS_PER_PAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('home');

  useEffect(() => {
    fetchEvents();
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN') {
        setCurrentPage('profile');
      } else if (event === 'SIGNED_OUT') {
        setCurrentPage('home');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }

  useEffect(() => {
    filterEvents();
  }, [allEvents, selectedCategory, visibleCount]);

  async function fetchEvents() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (fetchError) throw fetchError;

      setAllEvents(data || []);

      const uniqueCategories = Array.from(
        new Set(data?.map((event) => event.category) || [])
      );
      setCategories(uniqueCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }

  function filterEvents() {
    let filtered = allEvents;

    if (selectedCategory) {
      filtered = allEvents.filter((event) => event.category === selectedCategory);
    }

    setDisplayedEvents(filtered.slice(0, visibleCount));
  }

  function handleCategoryChange(category: string | null) {
    setSelectedCategory(category);
    setVisibleCount(EVENTS_PER_PAGE);
  }

  function loadMore() {
    setVisibleCount((prev) => prev + EVENTS_PER_PAGE);
  }

  const filteredEvents = selectedCategory
    ? allEvents.filter((event) => event.category === selectedCategory)
    : allEvents;
  const hasMore = visibleCount < filteredEvents.length;

  function handleNavigateToHome() {
    setCurrentPage('home');
    setTimeout(() => {
      const eventsSection = document.getElementById('events');
      if (eventsSection) {
        eventsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation
        onOpenSignUp={() => setIsSignUpModalOpen(true)}
        onNavigateToProfile={() => setCurrentPage('profile')}
        onNavigateToHome={handleNavigateToHome}
      />
      {currentPage === 'profile' ? (
        <Profile />
      ) : (
        <>
      <Hero onOpenSignUp={() => setIsSignUpModalOpen(true)} />

      <section id="events" className="py-16 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Upcoming Events
            </h2>
            <p className="text-gray-400 text-lg">
              Explore the hottest live music events in your area
            </p>
          </div>

          {!loading && !error && categories.length > 0 && (
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategoryChange}
            />
          )}

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-400 text-lg">{error}</p>
              <button
                onClick={fetchEvents}
                className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && displayedEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No events found</p>
            </div>
          )}

          {!loading && !error && displayedEvents.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedEvents.map((event) => (
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

              {hasMore && (
                <div className="text-center mt-12">
                  <button
                    onClick={loadMore}
                    className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]"
                  >
                    Load More Events
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={(event) => {
            setSelectedEvent(null);
            setEventToEdit(event);
          }}
          onSignUpOpen={() => {
            setSelectedEvent(null);
            setIsSignUpModalOpen(true);
          }}
        />
      )}

      {eventToEdit && (
        <EditEventModal
          event={eventToEdit}
          onClose={() => setEventToEdit(null)}
        />
      )}

      {isSignUpModalOpen && (
        <SignUpModal
          onClose={() => setIsSignUpModalOpen(false)}
          onSwitchToSignIn={() => setIsSignInModalOpen(true)}
        />
      )}

      {isSignInModalOpen && (
        <SignInModal
          onClose={() => setIsSignInModalOpen(false)}
          onSwitchToSignUp={() => setIsSignUpModalOpen(true)}
        />
      )}

        <footer className="bg-black border-t border-gray-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
            <p>&copy; 2025 ShowGo. All rights reserved.</p>
          </div>
        </footer>
        </>
      )}
    </div>
  );
}

export default App;
