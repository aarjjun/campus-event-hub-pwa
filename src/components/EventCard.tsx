
import { useState } from 'react';
import { Calendar, Clock, MapPin, Bell, Users, UserCheck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Event } from '@/types/Event';
import { useAuth } from '@/hooks/useAuth';
import { RegistrationModal } from './RegistrationModal';

interface EventCardProps {
  event: Event;
  onPosterClick: (posterUrl: string) => void;
  onReminderSet: (event: Event, minutesBefore: number) => void;
  onRegister: (eventId: string) => void;
  onUnregister: (eventId: string) => void;
  isRegistered: boolean;
}

export const EventCard = ({ 
  event, 
  onPosterClick, 
  onReminderSet, 
  onRegister, 
  onUnregister, 
  isRegistered 
}: EventCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const { user } = useAuth();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isUpcoming = () => {
    const eventDate = new Date(`${event.date}T${convertTo24Hour(event.time)}`);
    return eventDate > new Date();
  };

  const convertTo24Hour = (time12h: string) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = (parseInt(hours, 10) + 12).toString();
    }
    return `${hours.padStart(2, '0')}:${minutes}:00`;
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      'Workshop': 'bg-blue-100 text-blue-800',
      'Festival': 'bg-purple-100 text-purple-800',
      'Seminar': 'bg-green-100 text-green-800',
      'Summit': 'bg-orange-100 text-orange-800',
      'Competition': 'bg-red-100 text-red-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || colors.default;
  };

  const handleRegistration = () => {
    if (!user) {
      setShowRegistrationModal(true);
      return;
    }

    if (isRegistered) {
      onUnregister(event.id);
    } else {
      onRegister(event.id);
    }
  };

  const registrationProgress = event.max_participants 
    ? (event.current_participants / event.max_participants) * 100 
    : 0;

  const isFull = event.max_participants && event.current_participants >= event.max_participants;

  return (
    <>
      <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={event.logo}
                alt={`${event.club} logo`}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
                onError={() => setImageError(true)}
              />
              <div>
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-600">{event.club}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={getEventTypeColor(event.type)}>
                {event.type}
              </Badge>
              {isRegistered && (
                <Badge className="bg-green-100 text-green-800">
                  <UserCheck className="w-3 h-3 mr-1" />
                  Registered
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {event.poster && !imageError && (
            <div 
              className="relative rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => onPosterClick(event.poster)}
            >
              <img
                src={event.poster}
                alt={`${event.title} poster`}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">
                  Click to expand
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium">{formatDate(event.date)}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span className="text-sm">{event.time}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="w-4 h-4 text-indigo-500" />
              <span className="text-sm">{event.venue}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="w-4 h-4 text-indigo-500" />
              <span className="text-sm">{event.department}</span>
            </div>

            {event.max_participants && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {event.current_participants} / {event.max_participants} registered
                  </span>
                  <span className="text-gray-500">
                    {Math.round(registrationProgress)}%
                  </span>
                </div>
                <Progress value={registrationProgress} className="h-2" />
              </div>
            )}
          </div>

          <p className="text-gray-700 text-sm leading-relaxed">
            {event.description}
          </p>

          <div className="flex flex-wrap gap-1">
            {event.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          {isUpcoming() && (
            <>
              <Button
                onClick={handleRegistration}
                className={`w-full ${
                  isRegistered 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                    : isFull 
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                } text-white`}
                size="sm"
                disabled={!isRegistered && isFull}
              >
                <UserCheck className="w-4 h-4 mr-2" />
                {isFull && !isRegistered 
                  ? 'Event Full' 
                  : isRegistered 
                    ? 'Unregister' 
                    : 'Register Now'
                }
              </Button>

              {event.registration_url && (
                <Button
                  onClick={() => window.open(event.registration_url, '_blank')}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  External Registration
                </Button>
              )}

              <Button
                onClick={() => onReminderSet(event, event.reminder_minutes_before)}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <Bell className="w-4 h-4 mr-2" />
                Set Reminder ({event.reminder_minutes_before} min before)
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      <RegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSuccess={() => {
          onRegister(event.id);
        }}
      />
    </>
  );
};
