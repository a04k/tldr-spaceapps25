"use client";

import { useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import AtomIcon from "@/components/icons/atom";
import PaperSearch from "@/components/laboratory/paper-search";
import PaperGrid from "@/components/laboratory/paper-grid";
import { Paper, PaperContext } from "@/types/paper";

export default function LaboratoryPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const handlePaperSelect = (paper: Paper) => {
    // Debug logging to check what content we're getting
    console.log("Paper selected:", {
      id: paper.id,
      title: paper.title,
      hasContent: !!paper.content,
      contentLength: paper.content?.length || 0,
      hasAbstract: !!paper.abstract,
      abstractLength: paper.abstract?.length || 0,
    });

    // Convert Paper to PaperContext format and dispatch event for ClientLayout to handle
    const paperContext: PaperContext = {
      id: paper.id,
      title: paper.title || "Untitled Paper",
      authors: Array.isArray(paper.authors) ? paper.authors : [],
      year: paper.year || new Date().getFullYear(),
      abstract: String(paper.abstract || ""),
      // Prioritize content field over abstract
      fullContent: String(paper.content || ""),
      keywords: Array.isArray(paper.keywords) ? paper.keywords : [],
      journal: paper.journal,
      url: paper.url,
      description: String(paper.abstract || ""), // Set description to be the abstract
    };

    console.log("Paper context created:", {
      id: paperContext.id,
      fullContentLength: paperContext.fullContent.length,
      abstractLength: paperContext.abstract.length,
    });

    // Dispatch custom event to notify ClientLayout of paper selection
    const event = new CustomEvent("paperOpened", {
      detail: paperContext,
    });
    window.dispatchEvent(event);
  };

  return (
    <DashboardPageLayout
      header={{
        title: "Laboratory",
        description: "Search and explore research papers",
        icon: AtomIcon,
      }}
    >
      <div className="space-y-6">
        <PaperSearch
          onPaperSelect={handlePaperSelect}
          onSearchChange={setSearchQuery}
        />
        <PaperGrid
          onPaperSelect={handlePaperSelect}
          searchQuery={searchQuery}
        />
      </div>
    </DashboardPageLayout>
  );
}
