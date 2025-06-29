
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types/Event';
import { useToast } from '@/hooks/use-toast';

// Define a type that matches the actual event_registrations table structure
interface EventRegistration {
  id: string;
  event_id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  semester: string;
  registered_at: string;
}

export const useSupabaseEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<EventRegistration[]>([]);
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

      // Since there's no user_id in event_registrations table, 
      // we'll fetch registrations by email for now
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('email', user.email);

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

      // Check if user is already registered
      const { data: existingRegistration } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('email', user.email)
        .maybeSingle();

      if (existingRegistration) {
        toast({
          title: "Already Registered",
          description: "You are already registered for this event",
          variant: "destructive",
        });
        return false;
      }

      // For now, we'll create a registration with user info
      // Note: This is a simplified approach since the current schema doesn't have user_id
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          name: user.user_metadata?.full_name || user.email || 'Anonymous',
          email: user.email || '',
          phone: user.user_metadata?.phone || '',
          department: user.user_metadata?.department || 'Not specified',
          semester: user.user_metadata?.semester || 'Not specified'
        });

      if (error) {
        console.error('Registration error:', error);
        toast({
          title: "Registration Failed",
          description: "Unable to register for the event. Please try again.",
          variant: "destructive",
        });
        return false;
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
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('email', user.email);

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
          table: 'event_registrations'
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
