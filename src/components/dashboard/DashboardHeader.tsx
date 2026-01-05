import { GraduationCap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  onRefresh: () => void;
  isLoading?: boolean;
}

export function DashboardHeader({ onRefresh, isLoading }: DashboardHeaderProps) {
  return (
    <div className="gradient-header rounded-2xl p-6 md:p-8 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary-foreground/20 p-3 backdrop-blur-sm">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground">
              Classroom Attendance
            </h1>
            <p className="text-primary-foreground/80 text-sm md:text-base mt-1">
              Track and monitor student check-in/check-out records
            </p>
          </div>
        </div>
        <Button 
          onClick={onRefresh}
          variant="secondary"
          className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/30 backdrop-blur-sm"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>
    </div>
  );
}
