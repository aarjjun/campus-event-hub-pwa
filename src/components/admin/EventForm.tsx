
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EventFormProps {
  event?: any;
  onSubmit: () => void;
  onCancel: () => void;
}

export const EventForm = ({ event, onSubmit, onCancel }: EventFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    venue: '',
    department: '',
    club: '',
    type: '',
    description: '',
    logo: '',
    poster: '',
    registration_url: '',
    max_participants: '',
    reminder_minutes_before: '30',
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const eventTypes = [
    'Workshop',
    'Festival',
    'Seminar',
    'Summit',
    'Competition',
    'Conference',
    'Cultural',
    'Technical',
    'Sports'
  ];

  const departments = [
    'CSE',
    'ECE',
    'ME',
    'CE',
    'EEE',
    'IT',
    'AIDS',
    'AIML',
    'General'
  ];

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        date: event.date || '',
        time: event.time || '',
        venue: event.venue || '',
        department: event.department || '',
        club: event.club || '',
        type: event.type || '',
        description: event.description || '',
        logo: event.logo || '',
        poster: event.poster || '',
        registration_url: event.registration_url || '',
        max_participants: event.max_participants?.toString() || '',
        reminder_minutes_before: event.reminder_minutes_before?.toString() || '30',
        tags: event.tags || []
      });
    }
  }, [event]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date || !formData.time || !formData.venue) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const eventData = {
        title: formData.title,
        date: formData.date,
        time: formData.time,
        venue: formData.venue,
        department: formData.department,
        club: formData.club,
        type: formData.type,
        description: formData.description,
        logo: formData.logo || null,
        poster: formData.poster || null,
        registration_url: formData.registration_url || null,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        reminder_minutes_before: parseInt(formData.reminder_minutes_before),
        tags: formData.tags,
        is_active: true,
        current_participants: 0
      };

      let error;
      
      if (event) {
        // Update existing event
        const { error: updateError } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', event.id);
        error = updateError;
      } else {
        // Create new event
        const { error: insertError } = await supabase
          .from('events')
          .insert([eventData]);
        error = insertError;
      }

      if (error) throw error;

      onSubmit();
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Error",
        description: "Failed to save event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Event Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter event title"
            required
          />
        </div>

        <div>
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="time">Time *</Label>
          <Input
            id="time"
            value={formData.time}
            onChange={(e) => handleInputChange('time', e.target.value)}
            placeholder="e.g., 10:00 AM"
            required
          />
        </div>

        <div>
          <Label htmlFor="venue">Venue *</Label>
          <Input
            id="venue"
            value={formData.venue}
            onChange={(e) => handleInputChange('venue', e.target.value)}
            placeholder="Enter venue"
            required
          />
        </div>

        <div>
          <Label htmlFor="department">Department</Label>
          <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="club">Club/Organization</Label>
          <Input
            id="club"
            value={formData.club}
            onChange={(e) => handleInputChange('club', e.target.value)}
            placeholder="Enter club or organization name"
          />
        </div>

        <div>
          <Label htmlFor="type">Event Type</Label>
          <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="max_participants">Max Participants</Label>
          <Input
            id="max_participants"
            type="number"
            value={formData.max_participants}
            onChange={(e) => handleInputChange('max_participants', e.target.value)}
            placeholder="Leave empty for unlimited"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter event description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="logo">Logo URL</Label>
          <Input
            id="logo"
            value={formData.logo}
            onChange={(e) => handleInputChange('logo', e.target.value)}
            placeholder="Enter logo image URL"
          />
        </div>

        <div>
          <Label htmlFor="poster">Poster URL</Label>
          <Input
            id="poster"
            value={formData.poster}
            onChange={(e) => handleInputChange('poster', e.target.value)}
            placeholder="Enter poster image URL"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="registration_url">External Registration URL</Label>
        <Input
          id="registration_url"
          value={formData.registration_url}
          onChange={(e) => handleInputChange('registration_url', e.target.value)}
          placeholder="Enter external registration link (optional)"
        />
      </div>

      <div>
        <Label htmlFor="reminder">Reminder (minutes before event)</Label>
        <Input
          id="reminder"
          type="number"
          value={formData.reminder_minutes_before}
          onChange={(e) => handleInputChange('reminder_minutes_before', e.target.value)}
          placeholder="30"
        />
      </div>

      <div>
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => removeTag(tag)}
              />
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <Button type="button" onClick={addTag} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving...' : (event ? 'Update Event' : 'Create Event')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
