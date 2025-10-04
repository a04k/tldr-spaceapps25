"use client";

import type * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import AtomIcon from "@/components/icons/atom";
import BracketsIcon from "@/components/icons/brackets";
import CuteRobotIcon from "@/components/icons/cute-robot";
import GearIcon from "@/components/icons/gear";
import MonkeyIcon from "@/components/icons/monkey";
import { Bullet } from "@/components/ui/bullet";

interface DashboardSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeView?: string;
  onNavigate?: (view: string) => void;
  isCollapsed?: boolean;
}

const data = {
  navMain: [
    {
      title: "Tools",
      items: [
        {
          title: "Overview",
          view: "overview",
          icon: BracketsIcon,
        },
        {
          title: "Laboratory",
          view: "laboratory",
          icon: AtomIcon,
        },
        {
          title: "TL;DR AI",
          view: "assistant",
          icon: CuteRobotIcon,
        },
        {
          title: "Settings",
          view: "settings",
          icon: GearIcon,
        },
      ],
    },
  ],
};

export function DashboardSidebar({
  className,
  activeView = "overview",
  onNavigate,
  isCollapsed = false,
  ...props
}: DashboardSidebarProps) {
  return (
    <Sidebar {...props} className={cn("py-sides", className)}>
      <SidebarHeader
        className={cn(
          "rounded-t-lg flex rounded-b-none relative transition-all duration-300 border-b border-border",
          isCollapsed
            ? "flex-col items-center justify-center p-4"
            : "flex-row gap-4 p-6",
        )}
      >
        <div
          className={cn(
            "flex overflow-clip shrink-0 items-center justify-center rounded transition-all duration-300",
            "bg-sidebar-primary-foreground/10 group-hover:bg-sidebar-primary text-sidebar-primary-foreground",
            isCollapsed ? "size-10" : "size-12",
          )}
        >
          <MonkeyIcon
            className={cn(
              "transition-all duration-300 group-hover:scale-110",
              isCollapsed ? "size-6" : "size-10",
            )}
          />
        </div>
        {!isCollapsed && (
          <div className="grid flex-1 text-left leading-tight">
            <span className="text-3xl font-display font-bold">TL;DR</span>
            <span className="text-sm uppercase text-muted-foreground tracking-wider">
              Research Assistant
            </span>
          </div>
        )}
        {isCollapsed && (
          <div className="mt-2">
            <span className="text-sm font-bold tracking-tight">TL</span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className={cn("py-4", isCollapsed ? "px-3" : "px-4")}>
        {data.navMain.map((group, i) => (
          <SidebarGroup
            className={cn(i === 0 && "rounded-t-none", "mb-2")}
            key={group.title}
          >
            {!isCollapsed && (
              <SidebarGroupLabel className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider">
                <Bullet className="mr-2" />
                {group.title}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu
                className={cn(isCollapsed ? "space-y-3" : "space-y-1")}
              >
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={activeView === item.view}
                      onClick={() => onNavigate?.(item.view)}
                      className={cn(
                        "cursor-pointer transition-all duration-200 font-medium",
                        isCollapsed
                          ? "w-12 h-12 p-0 justify-center rounded-lg mx-auto"
                          : "justify-start px-4 py-3 rounded-lg text-sm",
                        activeView === item.view &&
                          !isCollapsed &&
                          "bg-primary/10 text-primary",
                        activeView === item.view &&
                          isCollapsed &&
                          "bg-primary text-primary-foreground",
                      )}
                      title={isCollapsed ? item.title : undefined}
                    >
                      <item.icon
                        className={cn(
                          "transition-all shrink-0",
                          isCollapsed ? "size-6" : "size-5",
                        )}
                      />
                      {!isCollapsed && (
                        <span className="ml-3 font-medium">{item.title}</span>
                      )}
                      {isCollapsed && (
                        <span className="sr-only">{item.title}</span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
