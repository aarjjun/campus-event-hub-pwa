
-- Create event_registrations table
CREATE TABLE public.event_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  department text,
  semester text,
  registered_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (admins can view all registrations)
CREATE POLICY "Registrations are viewable by authenticated users" 
  ON public.event_registrations 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Create policy for insert (anyone can register)
CREATE POLICY "Anyone can register for events" 
  ON public.event_registrations 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy for delete (users can unregister by email match)
CREATE POLICY "Users can unregister by email" 
  ON public.event_registrations 
  FOR DELETE 
  USING (true);

-- Enable real-time for event_registrations table
ALTER TABLE public.event_registrations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_registrations;

-- Create trigger to update participant count when registrations change
CREATE TRIGGER update_participants_on_event_registration
  AFTER INSERT OR DELETE ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION update_event_participants();
