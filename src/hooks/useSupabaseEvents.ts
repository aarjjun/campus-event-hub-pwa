
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Event, UserEventRegistration } from '@/types/Event';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<UserEventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEvents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    }
  }, []);

  const fetchUserRegistrations = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_event_registrations')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserRegistrations(data || []);
    } catch (err) {
      console.error('Error fetching user registrations:', err);
    }
  }, []);

  const registerForEvent = useCallback(async (eventId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to register for events",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('user_event_registrations')
        .insert({
          user_id: user.id,
          event_id: eventId,
          notification_enabled: true
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already Registered",
            description: "You are already registered for this event",
            variant: "destructive",
          });
          return false;
        }
        throw error;
      }

      toast({
        title: "Registration Successful",
        description: "You have been registered for the event!",
      });

      await fetchUserRegistrations();
      return true;
    } catch (err) {
      console.error('Error registering for event:', err);
      toast({
        title: "Registration Failed",
        description: "Unable to register for the event. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, fetchUserRegistrations]);

  const unregisterFromEvent = useCallback(async (eventId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_event_registrations')
        .delete()
        .eq('user_id', user.id)
        .eq('event_id', eventId);

      if (error) throw error;

      toast({
        title: "Unregistered Successfully",
        description: "You have been unregistered from the event",
      });

      await fetchUserRegistrations();
      return true;
    } catch (err) {
      console.error('Error unregistering from event:', err);
      toast({
        title: "Unregistration Failed",
        description: "Unable to unregister from the event. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, fetchUserRegistrations]);

  const isUserRegistered = useCallback((eventId: string) => {
    return userRegistrations.some(reg => reg.event_id === eventId);
  }, [userRegistrations]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchEvents(), fetchUserRegistrations()]);
      setLoading(false);
    };

    loadData();
  }, [fetchEvents, fetchUserRegistrations]);

  // Set up real-time subscriptions
  useEffect(() => {
    // Subscribe to events changes
    const eventsSubscription = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events'
        },
        (payload) => {
          console.log('Events change received:', payload);
          fetchEvents();
        }
      )
      .subscribe();

    // Subscribe to registration changes
    const registrationsSubscription = supabase
      .channel('registrations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_event_registrations'
        },
        (payload) => {
          console.log('Registration change received:', payload);
          fetchUserRegistrations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventsSubscription);
      supabase.removeChannel(registrationsSubscription);
    };
  }, [fetchEvents, fetchUserRegistrations]);

  return {
    events,
    userRegistrations,
    loading,
    error,
    registerForEvent,
    unregisterFromEvent,
    isUserRegistered,
    refetch: () => Promise.all([fetchEvents(), fetchUserRegistrations()])
  };
};
