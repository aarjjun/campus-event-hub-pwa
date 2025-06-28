
import { useState, useEffect, useCallback } from 'react';
import { Event } from '@/types/Event';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const loadEvents = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const response = await fetch('/events.json');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const eventsData = await response.json();
      setEvents(eventsData);
      
      // Cache events in localStorage for offline use
      localStorage.setItem('campusboard-events', JSON.stringify(eventsData));
      localStorage.setItem('campusboard-events-timestamp', Date.now().toString());
    } catch (err) {
      console.error('Failed to load events:', err);
      
      // Try to load from cache if online fetch fails
      const cachedEvents = localStorage.getItem('campusboard-events');
      if (cachedEvents) {
        setEvents(JSON.parse(cachedEvents));
        setError('Using cached events - some information may be outdated');
      } else {
        setError('Failed to load events. Please check your connection.');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const syncEvents = useCallback(() => {
    if (isOnline) {
      loadEvents(false);
    }
  }, [isOnline, loadEvents]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming back online
      syncEvents();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncEvents]);

  return {
    events,
    loading,
    error,
    syncEvents,
    isOnline
  };
};
