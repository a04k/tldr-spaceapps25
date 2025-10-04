"use client";

import { Card } from "@/components/dashboard/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Paper, PaperContext } from "@/types/paper";
import { useEffect, useState } from "react";
import { Network } from "lucide-react";
import { MdxContent } from "./mdx-content";
import KnowledgeMapGenerator from "./knowledge-map-generator";
import type { KnowledgeMap } from "@/lib/knowledge-mapping";

interface PaperViewerProps {
  paper: Paper;
}

export default function PaperViewer({ paper }: PaperViewerProps) {
  const [isKnowledgeMapOpen, setIsKnowledgeMapOpen] = useState(false);
  const [generatedMap, setGeneratedMap] = useState<KnowledgeMap | null>(null);

  useEffect(() => {
    const paperContext: PaperContext = {
      id: paper.id,
      title: paper.title,
      authors: paper.authors || [],
      year: paper.year || new Date().getFullYear(),
      abstract: paper.abstract || "",
      fullContent: paper.content || "",
      keywords: paper.keywords || [],
      journal: paper.journal,
    };

    const event = new CustomEvent("paperOpened", {
      detail: paperContext,
    });
    window.dispatchEvent(event);
    console.log("[v0] Paper context sent to AI for Q&A:", {
      title: paper.title,
      authors: paper.authors,
    });
  }, [paper]);

  return (
    <div className="space-y-6">
      {/* Paper Header */}
      <Card title={paper.title}>
        <div className="mb-4 text-sm text-muted-foreground">
          {paper.authors?.join(", ")} • {paper.year}
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-2 flex-wrap">
              {(paper.keywords || []).map((keyword) => (
                <Badge key={keyword} variant="secondary">
                  {keyword}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-display text-primary">
                  {paper.citations || 0}
                </p>
                <p className="text-xs text-muted-foreground uppercase">
                  Citations
                </p>
              </div>
            </div>
          </div>

          {(paper.journal || paper.doi || paper.url) && (
            <div className="pt-2 border-t border-border">
              {paper.journal && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Published in:</span>{" "}
                  <span className="font-medium">{paper.journal}</span>
                </p>
              )}
              {paper.doi && (
                <p className="text-sm text-muted-foreground">
                  DOI: <span className="font-mono">{paper.doi}</span>
                </p>
              )}
              {paper.url && (
                <p className="text-sm text-muted-foreground">
                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground transition-colors"
                  >
                    View Full Paper
                  </a>
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {paper.url && (
              <Button variant="default" size="sm" asChild>
                <a href={paper.url} target="_blank" rel="noopener noreferrer">
                  View Full Paper
                </a>
              </Button>
            )}
            {paper.pdfUrl && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={paper.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View PDF
                </a>
              </Button>
            )}
            
            {/* Knowledge Map Button - Always visible */}
            <Dialog open={isKnowledgeMapOpen} onOpenChange={setIsKnowledgeMapOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-primary/10 hover:bg-primary/20 border-primary/30">
                  <Network className="h-4 w-4 text-primary" />
                  <span className="font-medium">Knowledge Map</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5" />
                    Knowledge Map - {paper.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-hidden">
                  <KnowledgeMapGenerator
                    paperTitle={paper.title}
                    paperContent={paper.content || paper.abstract || ""}
                    onMapGenerated={(map) => setGeneratedMap(map)}
                  />
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" size="sm">
              Export Citation
            </Button>
            <Button variant="outline" size="sm">
              Add to Library
            </Button>
          </div>
        </div>
      </Card>

      {/* Abstract with MDX Content */}
      <Card title="ABSTRACT">
        <div className="mb-4 text-xs text-muted-foreground uppercase tracking-wider">
          Research summary and key findings
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {paper.content ? (
            <MdxContent content={paper.content} />
          ) : paper.abstract ? (
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {paper.abstract}
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              No abstract available for this paper.
            </p>
          )}
        </div>
      </Card>

      {/* PDF Viewer */}
      {(paper.pdfUrl || paper.url) && (
        <Card title="DOCUMENT VIEWER">
          <div className="mb-4 text-xs text-muted-foreground uppercase tracking-wider">
            View the full research paper
          </div>
          <div className="w-full h-[700px] border rounded-lg overflow-hidden bg-muted/20">
            {paper.pdfUrl ? (
              <iframe
                src={`${paper.pdfUrl}#view=FitH`}
                className="w-full h-full border-0"
                title={`PDF: ${paper.title}`}
                allow="autoplay fullscreen"
              />
            ) : paper.url ? (
              <iframe
                src={paper.url}
                className="w-full h-full border-0"
                title={`Paper: ${paper.title}`}
                allow="autoplay fullscreen"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>No PDF available for viewing</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
