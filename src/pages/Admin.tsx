
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseEvents } from '@/hooks/useSupabaseEvents';
import { EventForm } from '@/components/admin/EventForm';
import { EventList } from '@/components/admin/EventList';
import { RegistrationsList } from '@/components/admin/RegistrationsList';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calendar, Users, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { events, refetch } = useSupabaseEvents();
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const { toast } = useToast();

  const fetchRegistrations = async () => {
    setLoadingRegistrations(true);
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          events (
            title,
            date,
            time
          )
        `)
        .order('registered_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast({
        title: "Error",
        description: "Failed to load registrations",
        variant: "destructive",
      });
    } finally {
      setLoadingRegistrations(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRegistrations();
    }
  }, [user]);

  // Redirect if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              You need to be signed in to access the admin panel.
            </p>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Go Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEventCreated = () => {
    setShowEventForm(false);
    setEditingEvent(null);
    refetch();
    toast({
      title: "Success",
      description: "Event has been created successfully!",
    });
  };

  const handleEventUpdated = () => {
    setShowEventForm(false);
    setEditingEvent(null);
    refetch();
    toast({
      title: "Success",
      description: "Event has been updated successfully!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage campus events and view registrations
          </p>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="registrations" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Registrations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">Events</h2>
              <Button
                onClick={() => {
                  setEditingEvent(null);
                  setShowEventForm(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New Event
              </Button>
            </div>

            {showEventForm && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingEvent ? 'Edit Event' : 'Create New Event'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EventForm
                    event={editingEvent}
                    onSubmit={editingEvent ? handleEventUpdated : handleEventCreated}
                    onCancel={() => {
                      setShowEventForm(false);
                      setEditingEvent(null);
                    }}
                  />
                </CardContent>
              </Card>
            )}

            <EventList
              events={events}
              onEdit={(event) => {
                setEditingEvent(event);
                setShowEventForm(true);
              }}
              onRefresh={refetch}
            />
          </TabsContent>

          <TabsContent value="registrations" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">
                Event Registrations
              </h2>
              <Button
                onClick={fetchRegistrations}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Refresh
              </Button>
            </div>

            <RegistrationsList 
              registrations={registrations}
              loading={loadingRegistrations}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
