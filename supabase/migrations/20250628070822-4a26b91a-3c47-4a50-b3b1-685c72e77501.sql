
-- Create events table
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  venue text NOT NULL,
  department text NOT NULL,
  club text NOT NULL,
  logo text,
  poster text,
  type text NOT NULL,
  description text,
  reminder_minutes_before integer DEFAULT 30,
  tags text[] DEFAULT '{}',
  registration_url text,
  is_active boolean DEFAULT true,
  max_participants integer,
  current_participants integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (no authentication required)
CREATE POLICY "Events are viewable by everyone" 
  ON public.events 
  FOR SELECT 
  USING (is_active = true);

-- Create policy for admin insert/update (you can modify this later)
CREATE POLICY "Events can be managed by authenticated users" 
  ON public.events 
  FOR ALL 
  USING (auth.role() = 'authenticated');

-- Enable real-time for events table
ALTER TABLE public.events REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;

-- Create user_event_registrations table for tracking registrations
CREATE TABLE public.user_event_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  event_id uuid REFERENCES public.events ON DELETE CASCADE,
  registered_at timestamp with time zone DEFAULT now(),
  notification_enabled boolean DEFAULT true,
  UNIQUE(user_id, event_id)
);

-- Enable RLS for registrations
ALTER TABLE public.user_event_registrations ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own registrations
CREATE POLICY "Users can manage their own registrations" 
  ON public.user_event_registrations 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Enable real-time for registrations
ALTER TABLE public.user_event_registrations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_event_registrations;

-- Create function to update participant count
CREATE OR REPLACE FUNCTION update_event_participants() 
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.events 
    SET current_participants = current_participants + 1 
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.events 
    SET current_participants = GREATEST(0, current_participants - 1) 
    WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for participant count
CREATE TRIGGER update_participants_on_registration
  AFTER INSERT OR DELETE ON public.user_event_registrations
  FOR EACH ROW EXECUTE FUNCTION update_event_participants();

-- Insert sample events (you can remove this later)
INSERT INTO public.events (title, date, time, venue, department, club, logo, poster, type, description, tags, registration_url) VALUES 
('Tech Innovation Summit 2024', '2024-07-15', '9:00 AM', 'Main Auditorium', 'Computer Science', 'Tech Club', 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=100&h=100&fit=crop&crop=face', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop', 'Summit', 'Join us for the biggest tech event of the year featuring industry leaders and innovative startups.', ARRAY['technology', 'innovation', 'networking'], 'https://example.com/register/tech-summit'),
('Cultural Fest 2024', '2024-07-20', '6:00 PM', 'Campus Ground', 'Fine Arts', 'Cultural Committee', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop&crop=face', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop', 'Festival', 'Experience the rich cultural diversity of our campus through music, dance, and art.', ARRAY['culture', 'music', 'dance', 'art'], 'https://example.com/register/cultural-fest'),
('AI/ML Workshop', '2024-07-25', '2:00 PM', 'Lab Building', 'Computer Science', 'AI Society', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=100&h=100&fit=crop&crop=face', 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop', 'Workshop', 'Hands-on workshop on machine learning fundamentals and practical applications.', ARRAY['AI', 'machine-learning', 'workshop'], 'https://example.com/register/ai-workshop');
