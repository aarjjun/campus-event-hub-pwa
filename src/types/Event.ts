
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
}

export interface EventFilters {
  search: string;
  department: string;
  club: string;
  type: string;
  date: string;
}
