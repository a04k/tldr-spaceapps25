"use client";

import type React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MobileHeader } from "@/components/dashboard/mobile-header";
import mockDataJson from "@/mock.json";
import type { MockData } from "@/types/dashboard";
import { MobileChat } from "@/components/chat/mobile-chat";
import { useState, useEffect } from "react";
import FullScreenChat from "@/components/ai-assistant/full-screen-chat-safe";
import SettingsDialog from "@/components/settings-dialog";
import Sidebar from "./sidebar";
import RightPanel, { RightPanelToggle } from "./right-panel";
import {
  LayoutProvider,
  useLayout,
  useResponsiveLayout,
} from "./layout-context";
import { PaperContext } from "@/types/paper";
import { cn } from "@/lib/utils";
import { AIContextProvider } from "@/components/ai-assistant/context/ai-context";

const mockData = mockDataJson as MockData;

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeView?: string;
  onNavigate?: (view: string) => void;
  selectedPaper?: PaperContext | null;
}

function DashboardLayoutContent({
  children,
  activeView = "overview",
  onNavigate,
  selectedPaper,
}: DashboardLayoutProps) {
  const {
    setCurrentView,
    shouldShowRightPanel,
    currentSidebarWidth,
    rightPanelWidth,
    mainContentWidth,
    isMobile,
    showRightPanel,
    hideRightPanel,
  } = useLayout();

  const { canShowRightPanel } = useResponsiveLayout();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Update layout context when view changes
  useEffect(() => {
    if (activeView) {
      setCurrentView(activeView);
    }
  }, [activeView, setCurrentView]);

  // Auto-show/hide right panel based on paper context
  useEffect(() => {
    const handlePaperOpened = (event: CustomEvent<PaperContext>) => {
      showRightPanel();
    };

    const handlePaperClosed = () => {
      // Only hide panel if user manually closed the paper, not when switching papers
      // We'll let the view-based logic handle panel visibility
    };

    window.addEventListener(
      "paperOpened",
      handlePaperOpened as unknown as EventListener,
    );
    window.addEventListener(
      "paperClosed",
      handlePaperClosed as unknown as EventListener,
    );

    return () => {
      window.removeEventListener(
        "paperOpened",
        handlePaperOpened as unknown as EventListener,
      );
      window.removeEventListener(
        "paperClosed",
        handlePaperClosed as unknown as EventListener,
      );
    };
  }, [showRightPanel, hideRightPanel]);

  // Show/hide right panel based on view
  useEffect(() => {
    if (activeView === "laboratory") {
      showRightPanel();
    } else if (activeView === "overview") {
      hideRightPanel();
    }
  }, [activeView, showRightPanel, hideRightPanel]);

  // Handle navigation with proper state management
  const handleNavigate = (view: string) => {
    if (view === "assistant") {
      setIsChatOpen(true);
    } else if (view === "settings") {
      setIsSettingsOpen(true);
    } else {
      setCurrentView(view);
      onNavigate?.(view);

      // Hide right panel when leaving laboratory
      if (view === "overview") {
        hideRightPanel();
      }
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      {/* Mobile header - only shown on mobile */}
      {isMobile && (
        <div className="flex-shrink-0 border-b border-border">
          <MobileHeader mockData={mockData} />
        </div>
      )}

      {/* Main layout container */}
      <div
        className={cn(
          "flex w-full min-h-0",
          isMobile ? "h-[calc(100vh-4rem)]" : "h-full",
        )}
      >
        {/* Left Sidebar */}
        {!isMobile && (
          <div
            className="flex-shrink-0 transition-all duration-300 ease-in-out"
            style={{ width: `${currentSidebarWidth}px` }}
          >
            <Sidebar activeView={activeView} onNavigate={handleNavigate} />
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        {isMobile && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="fixed inset-0 bg-black/50 transition-opacity"
              aria-hidden="true"
            />
            <div className="fixed left-0 top-0 h-full w-64 bg-background shadow-xl">
              <Sidebar activeView={activeView} onNavigate={handleNavigate} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out min-w-0",
            isMobile && "w-full",
          )}
          style={
            !isMobile && shouldShowRightPanel
              ? {
                  width: mainContentWidth,
                  maxWidth: mainContentWidth,
                }
              : undefined
          }
        >
          <div className="h-full overflow-y-auto overflow-x-hidden p-4 md:p-6 scrollbar-hide">
            <div className="max-w-full">{children}</div>
          </div>
        </div>

        {/* Right Panel - Desktop Only */}
        {shouldShowRightPanel && canShowRightPanel && (
          <div
            className="flex-shrink-0 transition-all duration-300 ease-in-out border-l border-border"
            style={{ width: `${rightPanelWidth}px` }}
          >
            <RightPanel />
          </div>
        )}

        {/* Right Panel - Mobile Overlay */}
        {shouldShowRightPanel && isMobile && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/50 transition-opacity"
              aria-hidden="true"
            />
            <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-background shadow-xl">
              <RightPanel />
            </div>
          </div>
        )}
      </div>

      {/* Right Panel Toggle - when panel is hidden */}
      <RightPanelToggle />

      {/* Mobile overlays */}
      {isMobile && <MobileChat />}

      {/* Global modals */}
      <FullScreenChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default function DashboardLayout({
  children,
  activeView = "overview",
  onNavigate,
  selectedPaper,
}: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <LayoutProvider>
        <AIContextProvider>
          <DashboardLayoutContent
            activeView={activeView}
            onNavigate={onNavigate}
            selectedPaper={selectedPaper}
          >
            {children}
          </DashboardLayoutContent>
        </AIContextProvider>
      </LayoutProvider>
    </SidebarProvider>
  );
}
