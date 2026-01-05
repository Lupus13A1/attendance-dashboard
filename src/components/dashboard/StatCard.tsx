import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'present' | 'late' | 'absent';
  className?: string;
}

const variantStyles = {
  default: 'bg-card border-border',
  present: 'bg-status-present-bg border-status-present/20',
  late: 'bg-status-late-bg border-status-late/20',
  absent: 'bg-status-absent-bg border-status-absent/20',
};

const iconStyles = {
  default: 'bg-primary/10 text-primary',
  present: 'bg-status-present/10 text-status-present',
  late: 'bg-status-late/10 text-status-late',
  absent: 'bg-status-absent/10 text-status-absent',
};

const valueStyles = {
  default: 'text-foreground',
  present: 'text-status-present',
  late: 'text-status-late',
  absent: 'text-status-absent',
};

export function StatCard({ title, value, subtitle, icon: Icon, variant = 'default', className }: StatCardProps) {
  return (
    <div 
      className={cn(
        'relative overflow-hidden rounded-xl border p-5 shadow-card transition-all duration-300 hover:shadow-elevated animate-fade-in',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn('text-3xl font-bold tracking-tight', valueStyles[variant])}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn('rounded-lg p-2.5', iconStyles[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
