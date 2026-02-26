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
import { useAuth, UserRole } from "@/context/AuthContext";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  roles: UserRole[];
}

const navigation: NavItem[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    roles: ["admin", "teacher", "student"],
  },
  {
    name: "Students",
    href: "/students",
    icon: Users,
    roles: ["admin", "teacher"],
  },
  {
    name: "Attendance",
    href: "/attendance",
    icon: Calendar,
    roles: ["admin", "teacher", "student"],
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
    roles: ["admin", "teacher"],
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["admin"],
  },
];

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AppSidebar({ open, onClose }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  return (
    <>
      {/* Overlay (Mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 sm:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300",
          collapsed ? "w-16" : "w-64",
          open ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>

            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold">AttendEase</h1>
                <p className="text-xs opacity-70">
                  Attendance System
                </p>
              </div>
            )}
          </div>

          {/* ปุ่มปิด (mobile) */}
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
          {navigation
            .filter((item) => user && item.roles.includes(user.role))
            .map((item) => {
              const isActive = location.pathname === item.href;

              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => {
                    if (window.innerWidth < 640) {
                      onClose();
                    }
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {!collapsed && <span>{item.name}</span>}
                </NavLink>
              );
            })}
        </nav>

        {/* Collapse (Desktop Only) */}
        <div className="hidden sm:block border-t p-3">
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