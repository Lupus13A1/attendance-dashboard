import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main */}
      <div className="flex flex-col sm:ml-64">
        <AppHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-3 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
