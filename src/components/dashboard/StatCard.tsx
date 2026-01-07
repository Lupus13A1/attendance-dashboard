import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "present" | "late" | "absent" | "info";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const variantStyles = {
  default: {
    container: "bg-card border-border",
    icon: "bg-primary/10 text-primary",
    value: "text-foreground",
  },
  present: {
    container: "bg-card border-border",
    icon: "bg-success/10 text-success",
    value: "text-success",
  },
  late: {
    container: "bg-card border-border",
    icon: "bg-warning/10 text-warning",
    value: "text-warning",
  },
  absent: {
    container: "bg-card border-border",
    icon: "bg-destructive/10 text-destructive",
    value: "text-destructive",
  },
  info: {
    container: "bg-card border-border",
    icon: "bg-info/10 text-info",
    value: "text-info",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  trend,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-6 transition-all duration-200 hover:shadow-md animate-slide-up",
        styles.container
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn("text-3xl font-bold tracking-tight", styles.value)}>
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                trend.isPositive ? "text-success" : "text-destructive"
              )}
            >
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}% from yesterday</span>
            </div>
          )}
        </div>
        <div className={cn("rounded-lg p-3", styles.icon)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
