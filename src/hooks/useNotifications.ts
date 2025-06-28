
import { useCallback, useEffect } from 'react';
import { Event } from '@/types/Event';

export const useNotifications = () => {
  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission === 'granted';
    }
    return false;
  }, []);

  const scheduleReminder = useCallback((event: Event, minutesBefore: number) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      alert('Please enable notifications to set reminders');
      return;
    }

    const eventDateTime = new Date(`${event.date}T${convertTo24Hour(event.time)}`);
    const reminderTime = new Date(eventDateTime.getTime() - (minutesBefore * 60 * 1000));
    const now = new Date();

    if (reminderTime <= now) {
      alert('Cannot set reminder for past events');
      return;
    }

    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    // Store reminder in localStorage
    const reminders = JSON.parse(localStorage.getItem('campusboard-reminders') || '[]');
    const newReminder = {
      id: `${event.id}-${minutesBefore}`,
      eventId: event.id,
      eventTitle: event.title,
      reminderTime: reminderTime.toISOString(),
      minutesBefore
    };

    const existingIndex = reminders.findIndex((r: any) => r.id === newReminder.id);
    if (existingIndex >= 0) {
      reminders[existingIndex] = newReminder;
    } else {
      reminders.push(newReminder);
    }

    localStorage.setItem('campusboard-reminders', JSON.stringify(reminders));

    // Schedule the notification
    setTimeout(() => {
      new Notification(`🔔 Event Reminder`, {
        body: `${event.title} starts in ${minutesBefore} minutes at ${event.venue}`,
        icon: event.logo,
        badge: '/icons/icon-192.png',
        tag: `reminder-${event.id}`,
        requireInteraction: true
      });
    }, timeUntilReminder);

    alert(`✅ Reminder set for ${minutesBefore} minutes before "${event.title}"`);
  }, []);

  // Helper function to convert 12-hour to 24-hour format
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

  // Re-schedule reminders on app load
  useEffect(() => {
    const reminders = JSON.parse(localStorage.getItem('campusboard-reminders') || '[]');
    const now = new Date();

    reminders.forEach((reminder: any) => {
      const reminderTime = new Date(reminder.reminderTime);
      if (reminderTime > now) {
        const timeUntilReminder = reminderTime.getTime() - now.getTime();
        setTimeout(() => {
          new Notification(`🔔 Event Reminder`, {
            body: `${reminder.eventTitle} starts in ${reminder.minutesBefore} minutes`,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            tag: `reminder-${reminder.eventId}`,
            requireInteraction: true
          });
        }, timeUntilReminder);
      }
    });

    // Clean up expired reminders
    const activeReminders = reminders.filter((reminder: any) => {
      return new Date(reminder.reminderTime) > now;
    });
    localStorage.setItem('campusboard-reminders', JSON.stringify(activeReminders));
  }, []);

  return {
    requestPermission,
    scheduleReminder
  };
};
