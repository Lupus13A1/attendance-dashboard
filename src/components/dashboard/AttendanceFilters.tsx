import { Search, Calendar as CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { AttendanceStatus } from "@/types/attendance";
import { cn } from "@/lib/utils";

interface AttendanceFiltersProps {
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedStatus: AttendanceStatus | "all";
  onStatusChange: (status: AttendanceStatus | "all") => void;
}

export function AttendanceFilters({
  selectedDate,
  onDateChange,
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
}: AttendanceFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Search: ID + Name */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by student ID or name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full sm:w-[200px] justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Status Filter (lowercase values) */}
      <Select
        value={selectedStatus}
        onValueChange={(v) =>
          onStatusChange(v as AttendanceStatus | "all")
        }
      >
        <SelectTrigger className="w-full sm:w-[150px]">
          <Filter className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="present">Present</SelectItem>
          <SelectItem value="late">Late</SelectItem>
          <SelectItem value="absent">Absent</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear */}
      {(selectedDate || searchQuery || selectedStatus !== "all") && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onDateChange(undefined);
            onSearchChange("");
            onStatusChange("all");
          }}
          className="text-muted-foreground"
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
