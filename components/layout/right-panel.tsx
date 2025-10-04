"use client";

import { cn } from "@/lib/utils";
import {
  useRightPanel,
  useResponsiveLayout,
  useLayout,
} from "./layout-context";
import AIAssistant from "@/components/ai-assistant";
import { Button } from "@/components/ui/button";
import { PanelRightClose, PanelRightOpen, X } from "lucide-react";

interface RightPanelProps {
  className?: string;
}

export default function RightPanel({ className }: RightPanelProps) {
  const { isVisible, hide, toggle, width, canShow } = useRightPanel();
  const { isMobile, isCompact } = useResponsiveLayout();

  if (!isVisible || !canShow) {
    return null;
  }

  return (
    <div
      className={cn(
        "h-full flex flex-col bg-background",
        isMobile
          ? "w-full max-w-sm border-l border-border"
          : "border-l border-border",
        "transition-all duration-300 ease-in-out",
        className,
      )}
      style={!isMobile ? { width: `${width}px` } : undefined}
    >
      {/* Main content area */}
      <div className={cn("flex-1 overflow-hidden", isMobile && "px-1")}>
        <AIAssistant />
      </div>

      {/* Footer with collapse button - Desktop only */}
      {!isMobile && (
        <div className="flex-shrink-0 p-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="w-full justify-center text-xs hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            title="Toggle panel"
          >
            <PanelRightClose className="h-4 w-4" />
            <span className="ml-2">Hide Panel</span>
          </Button>
        </div>
      )}
    </div>
  );
}

// Toggle button for when the panel is hidden
export function RightPanelToggle({ className }: { className?: string }) {
  try {
    const { isVisible, show, canShow } = useRightPanel();
    const { isMobile, canShowRightPanel } = useResponsiveLayout();
    const { currentView } = useLayout();

    // Only show toggle in overview and laboratory views
    if (currentView !== "laboratory" && currentView !== "overview") {
      return null;
    }

    // Don't show toggle if panel is visible or can't be shown
    if (isVisible || !canShow || !canShowRightPanel) {
      return null;
    }

    return (
      <Button
        variant="outline"
        size={isMobile ? "default" : "sm"}
        onClick={show}
        className={cn(
          "fixed z-50 shadow-lg border-border bg-background/80 backdrop-blur-sm",
          "hover:bg-accent hover:text-accent-foreground",
          "transition-all duration-200",
          isMobile
            ? "bottom-4 right-4 rounded-full h-12 w-12 p-0"
            : "right-4 top-1/2 -translate-y-1/2 px-3 py-2",
          className,
        )}
        title="Show AI Assistant"
      >
        <PanelRightOpen className={cn(isMobile ? "h-6 w-6" : "h-4 w-4")} />
        {!isMobile && <span className="ml-2 text-xs">AI</span>}
      </Button>
    );
  } catch (error) {
    // If context is not available, don't render anything
    console.warn("RightPanelToggle: Layout context not available");
    return null;
  }
}
