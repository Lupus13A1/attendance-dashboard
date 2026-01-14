import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export interface StudentFilterValues {
  attendanceRateMin: number;
  attendanceRateMax: number;
  hasAbsences: boolean | null;
  hasPerfectAttendance: boolean | null;
  sortBy: "name" | "id" | "rate" | "lastSeen";
  sortOrder: "asc" | "desc";
}

interface StudentFiltersProps {
  filters: StudentFilterValues;
  onFiltersChange: (filters: StudentFilterValues) => void;
  activeFilterCount: number;
}

export const defaultFilters: StudentFilterValues = {
  attendanceRateMin: 0,
  attendanceRateMax: 100,
  hasAbsences: null,
  hasPerfectAttendance: null,
  sortBy: "rate",
  sortOrder: "desc",
};

export function StudentFilters({
  filters,
  onFiltersChange,
  activeFilterCount,
}: StudentFiltersProps) {
  const [open, setOpen] = useState(false);

  const handleReset = () => {
    onFiltersChange(defaultFilters);
  };

  const handleRateChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      attendanceRateMin: value[0],
      attendanceRateMax: value[1],
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Filter Students</h4>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-8 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
          </div>

          {/* Attendance Rate Range */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground">
              Attendance Rate: {filters.attendanceRateMin}% - {filters.attendanceRateMax}%
            </Label>
            <Slider
              value={[filters.attendanceRateMin, filters.attendanceRateMax]}
              onValueChange={handleRateChange}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground">Quick Filters</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="perfect"
                  checked={filters.hasPerfectAttendance === true}
                  onCheckedChange={(checked) =>
                    onFiltersChange({
                      ...filters,
                      hasPerfectAttendance: checked ? true : null,
                    })
                  }
                />
                <label
                  htmlFor="perfect"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Perfect Attendance Only
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="absences"
                  checked={filters.hasAbsences === true}
                  onCheckedChange={(checked) =>
                    onFiltersChange({
                      ...filters,
                      hasAbsences: checked ? true : null,
                    })
                  }
                />
                <label
                  htmlFor="absences"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Has Absences
                </label>
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground">Sort By</Label>
            <div className="flex gap-2">
              <Select
                value={filters.sortBy}
                onValueChange={(value: StudentFilterValues["sortBy"]) =>
                  onFiltersChange({ ...filters, sortBy: value })
                }
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="id">Student ID</SelectItem>
                  <SelectItem value="rate">Attendance Rate</SelectItem>
                  <SelectItem value="lastSeen">Last Seen</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.sortOrder}
                onValueChange={(value: "asc" | "desc") =>
                  onFiltersChange({ ...filters, sortOrder: value })
                }
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Asc</SelectItem>
                  <SelectItem value="desc">Desc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
