"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useEffect,
} from "react";

interface LayoutState {
  // Sidebar state
  sidebarCollapsed: boolean;
  sidebarWidth: {
    expanded: number;
    collapsed: number;
  };

  // Right panel state
  rightPanelVisible: boolean;
  rightPanelWidth: number;

  // Current view context
  currentView: string;

  // Responsive state
  isMobile: boolean;
  windowWidth: number;
}

interface LayoutContextType extends LayoutState {
  // Sidebar controls
  toggleSidebar: () => void;
  collapseSidebar: () => void;
  expandSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Right panel controls
  showRightPanel: () => void;
  hideRightPanel: () => void;
  toggleRightPanel: () => void;
  setRightPanelVisible: (visible: boolean) => void;

  // View management
  setCurrentView: (view: string) => void;

  // Computed values
  shouldShowRightPanel: boolean;
  mainContentWidth: string;
  currentSidebarWidth: number;

  // Responsive utilities
  canShowRightPanel: boolean;
  isCompactMode: boolean;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

// Default configuration
const DEFAULT_SIDEBAR_WIDTH = {
  expanded: 320, // Increased for better navigation layout
  collapsed: 72, // Slightly wider when collapsed
};

const DEFAULT_RIGHT_PANEL_WIDTH = 400; // Increased from 320px (w-80)

// Views that can show the right panel when toggled
const CAN_SHOW_RIGHT_PANEL_VIEWS = new Set(["overview", "laboratory"]);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LayoutState>({
    sidebarCollapsed: false,
    sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
    rightPanelVisible: false,
    rightPanelWidth: DEFAULT_RIGHT_PANEL_WIDTH,
    currentView: "overview",
    isMobile: false,
    windowWidth: typeof window !== "undefined" ? window.innerWidth : 1200,
  });

  // Responsive handling
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const width = window.innerWidth;
      const isMobile = width < 768; // md breakpoint

      setState((prev) => ({
        ...prev,
        windowWidth: width,
        isMobile,
        // Auto-collapse sidebar on mobile and small screens
        sidebarCollapsed: width < 1024 ? true : prev.sidebarCollapsed,
        // Always start with panel hidden and let user toggle it
        rightPanelVisible: false,
      }));
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sidebar controls
  const toggleSidebar = useCallback(() => {
    setState((prev) => ({
      ...prev,
      sidebarCollapsed: !prev.sidebarCollapsed,
    }));
  }, []);

  const collapseSidebar = useCallback(() => {
    setState((prev) => ({
      ...prev,
      sidebarCollapsed: true,
    }));
  }, []);

  const expandSidebar = useCallback(() => {
    setState((prev) => ({
      ...prev,
      sidebarCollapsed: false,
    }));
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setState((prev) => ({
      ...prev,
      sidebarCollapsed: collapsed,
    }));
  }, []);

  // Right panel controls
  const showRightPanel = useCallback(() => {
    setState((prev) => ({
      ...prev,
      rightPanelVisible: true,
    }));
  }, []);

  const hideRightPanel = useCallback(() => {
    setState((prev) => ({
      ...prev,
      rightPanelVisible: false,
    }));
  }, []);

  const toggleRightPanel = useCallback(() => {
    setState((prev) => ({
      ...prev,
      rightPanelVisible: !prev.rightPanelVisible,
    }));
  }, []);

  const setRightPanelVisible = useCallback((visible: boolean) => {
    setState((prev) => ({
      ...prev,
      rightPanelVisible: visible,
    }));
  }, []);

  // View management
  const setCurrentView = useCallback((view: string) => {
    setState((prev) => {
      const canShowPanel = CAN_SHOW_RIGHT_PANEL_VIEWS.has(view);

      return {
        ...prev,
        currentView: view,
        // Hide panel when switching to views that can't show it
        rightPanelVisible: canShowPanel ? prev.rightPanelVisible : false,
      };
    });
  }, []);

  // Computed values
  const canShowRightPanel = state.windowWidth >= 1024 && !state.isMobile;
  const isCompactMode = state.windowWidth < 1200;

  const shouldShowRightPanel =
    CAN_SHOW_RIGHT_PANEL_VIEWS.has(state.currentView) &&
    state.rightPanelVisible &&
    canShowRightPanel;

  const currentSidebarWidth = state.sidebarCollapsed
    ? state.sidebarWidth.collapsed
    : Math.min(state.sidebarWidth.expanded, state.windowWidth * 0.35);

  // Safe width calculation with minimum constraints
  const rightPanelDisplayWidth = shouldShowRightPanel
    ? Math.min(state.rightPanelWidth, state.windowWidth * 0.4)
    : 0;

  const mainContentWidth = Math.max(
    320, // Minimum main content width
    state.windowWidth - currentSidebarWidth - rightPanelDisplayWidth,
  );

  const contextValue: LayoutContextType = {
    // State
    ...state,

    // Controls
    toggleSidebar,
    collapseSidebar,
    expandSidebar,
    setSidebarCollapsed,
    showRightPanel,
    hideRightPanel,
    toggleRightPanel,
    setRightPanelVisible,
    setCurrentView,

    // Computed
    shouldShowRightPanel,
    mainContentWidth: shouldShowRightPanel ? `${mainContentWidth}px` : "100%",
    currentSidebarWidth,
    canShowRightPanel,
    isCompactMode,
  };

  return (
    <LayoutContext.Provider value={contextValue}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}

// Helper hooks for specific use cases
export function useSidebar() {
  const context = useLayout();
  return {
    isCollapsed: context.sidebarCollapsed,
    width: context.currentSidebarWidth,
    toggle: context.toggleSidebar,
    collapse: context.collapseSidebar,
    expand: context.expandSidebar,
    isMobile: context.isMobile,
    canExpand: !context.isMobile,
  };
}

export function useRightPanel() {
  const context = useLayout();
  return {
    isVisible: context.shouldShowRightPanel,
    width: context.rightPanelWidth,
    show: context.showRightPanel,
    hide: context.hideRightPanel,
    toggle: context.toggleRightPanel,
    canShow: context.canShowRightPanel,
    isCompact: context.isCompactMode,
  };
}

// Additional responsive hook
export function useResponsiveLayout() {
  const context = useLayout();
  return {
    isMobile: context.isMobile,
    isCompact: context.isCompactMode,
    windowWidth: context.windowWidth,
    canShowRightPanel: context.canShowRightPanel,
    shouldAutoCollapse: context.isMobile,
  };
}
