import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Calendar,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Students", href: "/students", icon: Users },
  { name: "Attendance", href: "/attendance", icon: Calendar },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AppSidebar({ open, onClose }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Overlay (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 sm:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          open ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
              <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold">AttendEase</h1>
                <p className="text-xs text-sidebar-muted">
                  Attendance System
                </p>
              </div>
            )}
          </div>

          {/* Close (mobile) */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;

            const link = (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-muted hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="h-5 w-5" />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            );

            return collapsed ? (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">
                  {item.name}
                </TooltipContent>
              </Tooltip>
            ) : (
              link
            );
          })}
        </nav>

        {/* Collapse */}
        <div className="hidden sm:block border-t border-sidebar-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Collapse
              </>
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}
