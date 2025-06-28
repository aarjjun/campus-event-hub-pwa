
import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Event, EventFilters } from '@/types/Event';

interface SearchAndFilterProps {
  events: Event[];
  onFilter: (filteredEvents: Event[]) => void;
}

export const SearchAndFilter = ({ events, onFilter }: SearchAndFilterProps) => {
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    department: '',
    club: '',
    type: '',
    date: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Get unique values for filter options
  const departments = [...new Set(events.map(event => event.department))].sort();
  const clubs = [...new Set(events.map(event => event.club))].sort();
  const types = [...new Set(events.map(event => event.type))].sort();

  useEffect(() => {
    let filtered = events;

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.club.toLowerCase().includes(searchLower) ||
        event.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Department filter
    if (filters.department) {
      filtered = filtered.filter(event => event.department === filters.department);
    }

    // Club filter
    if (filters.club) {
      filtered = filtered.filter(event => event.club === filters.club);
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(event => event.type === filters.type);
    }

    // Date filter
    if (filters.date) {
      filtered = filtered.filter(event => event.date === filters.date);
    }

    onFilter(filtered);
  }, [filters, events, onFilter]);

  const updateFilter = (key: keyof EventFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilter = (key: keyof EventFilters) => {
    setFilters(prev => ({ ...prev, [key]: '' }));
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      department: '',
      club: '',
      type: '',
      date: ''
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => value !== '').length;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-lg border-0">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search events, clubs, or tags..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10 bg-white/50 border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
          />
          {filters.search && (
            <button
              onClick={() => clearFilter('search')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className="flex items-center space-x-2 bg-white/50 border-gray-200 hover:bg-white/80"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 bg-indigo-100 text-indigo-800">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select value={filters.department} onValueChange={(value) => updateFilter('department', value)}>
            <SelectTrigger className="bg-white/50 border-gray-200">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.club} onValueChange={(value) => updateFilter('club', value)}>
            <SelectTrigger className="bg-white/50 border-gray-200">
              <SelectValue placeholder="Club" />
            </SelectTrigger>
            <SelectContent>
              {clubs.map(club => (
                <SelectItem key={club} value={club}>{club}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
            <SelectTrigger className="bg-white/50 border-gray-200">
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              {types.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={filters.date}
            onChange={(e) => updateFilter('date', e.target.value)}
            className="bg-white/50 border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
          />
        </div>
      )}

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">Active filters:</span>
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {filters.search}
              <button onClick={() => clearFilter('search')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.department && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Dept: {filters.department}
              <button onClick={() => clearFilter('department')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.club && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Club: {filters.club}
              <button onClick={() => clearFilter('club')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.type && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Type: {filters.type}
              <button onClick={() => clearFilter('type')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.date && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Date: {filters.date}
              <button onClick={() => clearFilter('date')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          <Button
            onClick={clearAllFilters}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};
