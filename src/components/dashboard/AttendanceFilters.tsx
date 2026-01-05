import { useState } from 'react';
import { CalendarIcon, Search, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AttendanceStatus } from '@/types/attendance';

interface AttendanceFiltersProps {
  onDateChange: (date: Date | undefined) => void;
  onStudentIdChange: (id: string) => void;
  onStatusChange: (status: AttendanceStatus | 'all') => void;
  selectedDate: Date | undefined;
  studentIdSearch: string;
  selectedStatus: AttendanceStatus | 'all';
}

export function AttendanceFilters({
  onDateChange,
  onStudentIdChange,
  onStatusChange,
  selectedDate,
  studentIdSearch,
  selectedStatus,
}: AttendanceFiltersProps) {
  const hasActiveFilters = selectedDate || studentIdSearch || selectedStatus !== 'all';

  const clearFilters = () => {
    onDateChange(undefined);
    onStudentIdChange('');
    onStatusChange('all');
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Filters</span>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[180px] justify-start text-left font-normal',
                !selectedDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateChange}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        {/* Student ID Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search Student ID..."
            value={studentIdSearch}
            onChange={(e) => onStudentIdChange(e.target.value)}
            className="w-[180px] pl-9"
          />
        </div>

        {/* Status Filter */}
        <Select value={selectedStatus} onValueChange={(value) => onStatusChange(value as AttendanceStatus | 'all')}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Present">Present</SelectItem>
            <SelectItem value="Late">Late</SelectItem>
            <SelectItem value="Absent">Absent</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
