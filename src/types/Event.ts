
export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  department: string;
  club: string;
  logo: string;
  poster: string;
  type: string;
  description: string;
  reminder_minutes_before: number;
  tags: string[];
  registration_url?: string;
  is_active: boolean;
  max_participants?: number;
  current_participants: number;
  created_at: string;
  updated_at: string;
}

export interface EventFilters {
  search: string;
  department: string;
  club: string;
  type: string;
  date: string;
}

export interface UserEventRegistration {
  id: string;
  user_id: string;
  event_id: string;
  registered_at: string;
  notification_enabled: boolean;
}
