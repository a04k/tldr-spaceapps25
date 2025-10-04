"use client";

import type React from "react";
import mockDataJson from "@/mock.json";
import type { MockData } from "@/types/dashboard";
import { useState, useEffect } from "react";
import DashboardOverview from "@/components/pages/overview";
import LaboratoryPage from "./laboratory/page";
import PaperViewer from "@/components/laboratory/paper-viewer";
import type { PaperContext } from "@/types/paper";
import DashboardLayout from "@/components/layout/dashboard-layout";

const mockData = mockDataJson as MockData;

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [activeView, setActiveView] = useState("overview");
  const [selectedPaper, setSelectedPaper] = useState<PaperContext | null>(null);

  // Handle paper opened/closed events
  useEffect(() => {
    const handlePaperOpened = async (event: CustomEvent<PaperContext>) => {
      const paper = event.detail;
      setSelectedPaper(paper);
      setActiveView("laboratory");
    };

    const handlePaperClosed = () => {
      // Only clear selected paper if explicitly closed (not when going back to laboratory list)
      setSelectedPaper(null);
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
  }, []);

  const handleNavigate = (view: string) => {
    setActiveView(view);

    // Only clear selected paper when navigating to overview
    // Keep paper context when staying in laboratory (switching papers)
    if (view === "overview") {
      setSelectedPaper(null);
      // Dispatch paper closed event only when leaving laboratory completely
      window.dispatchEvent(new CustomEvent("paperClosed"));
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case "overview":
        return <DashboardOverview />;
      case "laboratory":
        return selectedPaper ? (
          <PaperViewer
            paper={selectedPaper}
            onClose={() => setSelectedPaper(null)}
          />
        ) : (
          <LaboratoryPage />
        );
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <DashboardLayout
      activeView={activeView}
      onNavigate={handleNavigate}
      selectedPaper={selectedPaper}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
