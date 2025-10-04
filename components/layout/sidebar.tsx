"use client";

import { cn } from "@/lib/utils";
import { useLayout } from "./layout-context";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

interface SidebarProps {
  activeView?: string;
  onNavigate?: (view: string) => void;
}

export default function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const { sidebarCollapsed, toggleSidebar } = useLayout();

  return (
    <div className="relative h-full flex flex-col bg-sidebar border-r border-border">
      {/* Main sidebar content */}
      <div className="flex-1 overflow-hidden">
        <DashboardSidebar
          isCollapsed={sidebarCollapsed}
          activeView={activeView}
          onNavigate={onNavigate}
          className="h-full"
        />
      </div>
    </div>
  );
}
