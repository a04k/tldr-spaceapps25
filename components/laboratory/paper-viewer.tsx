"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Star, BookOpen, Copy, Check, Network } from "lucide-react";
import type { PaperContext } from "@/types/paper";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DashboardPageLayout from "@/components/dashboard/layout";
import AtomIcon from "@/components/icons/atom";
import KnowledgeMapGenerator from "../paper/knowledge-map-generator";
import type { KnowledgeMap } from "@/lib/knowledge-mapping";

interface PaperViewerProps {
  paper: PaperContext;
  onClose: () => void;
}

export default function PaperViewer({ paper, onClose }: PaperViewerProps) {
  const [showFallback, setShowFallback] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [showCitation, setShowCitation] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState<string | null>(null);
  const [isKnowledgeMapOpen, setIsKnowledgeMapOpen] = useState(false);
  const [generatedMap, setGeneratedMap] = useState<KnowledgeMap | null>(null);

  // Scroll to top when paper opens and dispatch paper context
  useEffect(() => {
    const scrollToTop = () => {
      // Target the specific main content scroll container from dashboard layout
      const mainScrollContainer = document.querySelector('.h-full.overflow-y-auto.overflow-x-hidden.scrollbar-hide');
      if (mainScrollContainer) {
        mainScrollContainer.scrollTo({ top: 0, behavior: 'instant' });
      }

      // Also scroll window as fallback
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    // Use multiple timeouts to ensure we override any other scroll events
    setTimeout(scrollToTop, 0);
    setTimeout(scrollToTop, 50);
    setTimeout(scrollToTop, 150);

    // Dispatch paper context to AI assistant
    const event = new CustomEvent("paperOpened", {
      detail: paper,
    });
    window.dispatchEvent(event);
    console.log("[Laboratory Paper Viewer] Paper context sent to AI:", {
      title: paper.title,
      authors: paper.authors,
    });
  }, [paper]);

  const handleClose = () => {
    // Don't dispatch paperClosed event - just go back to laboratory
    // This keeps the chat open and context intact
    onClose();
  };

  // Generate citations in different formats
  const generateCitations = () => {
    const authors = paper.authors.join(", ");
    const title = paper.title;
    const journal = paper.journal || "Journal";
    const url = paper.url || "";

    return {
      apa: `${authors}. ${title}. ${journal}. ${url ? `Retrieved from ${url}` : ""}`.trim(),
      mla: `${authors}. "${title}" ${journal}. ${url ? `Web. ${new Date().toLocaleDateString()}.` : ""}`.trim(),
      chicago: `${authors}. "${title}" ${journal}. ${url ? `Accessed ${new Date().toLocaleDateString()}. ${url}.` : ""}`.trim(),
      bibtex: `@article{${paper.id || "paper"},
  title={${title}},
  author={${authors}},
  journal={${journal}},${url ? `\n  url={${url}},` : ""}
}`
    };
  };

  const copyToClipboard = async (text: string, format: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCitation(format);
      setTimeout(() => setCopiedCitation(null), 2000);
    } catch (err) {
      console.error("Failed to copy citation:", err);
    }
  };

  const generateSummary = async () => {
    if (!paper.fullContent && !paper.abstract) {
      setSummary("No content available to generate a summary.");
      return;
    }

    setIsGeneratingSummary(true);
    setSummary(null);

    try {
      // Get API key from server-side endpoint
      const keyResponse = await fetch('/api/config/gemini-key')
      if (!keyResponse.ok) {
        throw new Error('Failed to get API key')
      }
      const keyData = await keyResponse.json()
      const apiKey = keyData.apiKey

      if (!apiKey) {
        throw new Error('Gemini API key not configured')
      }

      const summaryPrompt = `Create a concise, well-structured summary of this research paper in 150-200 words using clear markdown formatting:

**Authors**: ${paper.authors.join(", ")}

**Background**: Why was this study conducted?

**Methodology**: What approach did the researchers take?

**Key Findings**: What were the main results and discoveries?

**Significance**: Why are these findings important?

Paper content to summarize:
**Title**: ${paper.title}
**Content**: ${(paper.fullContent || paper.abstract).slice(0, 8000)}`;
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: summaryPrompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 512,
            },
          }),
        },
      );

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const summaryContent =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Unable to generate summary at this time.";

      // The AI returns plain text, not JSON, so set it directly
      setSummary(summaryContent);
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummary("Failed to generate summary. Please try again later.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Generate the PDF URL based on the paper URL
  let directPdfUrl = null;
  let articleUrl = null;

  if (paper.url) {
    if (paper.url.includes("ncbi.nlm.nih.gov/pmc")) {
      // For NCBI PMC articles, add /pdf to get the PDF version
      directPdfUrl = paper.url.endsWith("/")
        ? `${paper.url}pdf`
        : `${paper.url}/pdf`;
      articleUrl = paper.url; // Keep the original article URL as fallback
    } else if (paper.url.includes("arxiv.org/abs")) {
      directPdfUrl = paper.url.replace("/abs/", "/pdf/") + ".pdf";
    } else if (paper.url.endsWith(".pdf")) {
      directPdfUrl = paper.url;
    } else {
      // For other URLs, try adding .pdf
      directPdfUrl = paper.url + ".pdf";
      articleUrl = paper.url;
    }
  }

  return (
    <DashboardPageLayout
      header={{
        title: "Paper Viewer",
        description: paper.title,
        icon: AtomIcon,
      }}
    >
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 space-y-2">
              <h1 className="text-3xl font-display">{paper.title}</h1>
              <p className="text-muted-foreground">
                {paper.authors.join(", ")}
              </p>
              {paper.journal && (
                <p className="text-sm text-muted-foreground italic">
                  Published in {paper.journal}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={generateSummary}
            disabled={isGeneratingSummary}
          >
            <Star className="h-4 w-4 mr-2" />
            {isGeneratingSummary
              ? "Generating TL;DR..."
              : "Generate summary with TL;DR"}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setShowCitation(!showCitation)}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Cite this paper
          </Button>

          {/* Knowledge Map Button */}
          <Dialog open={isKnowledgeMapOpen} onOpenChange={setIsKnowledgeMapOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 bg-primary/10 hover:bg-primary/20 border-primary/30">
                <Network className="h-4 w-4 mr-2 text-primary" />
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
                  paperContent={paper.fullContent || paper.abstract || ""}
                  onMapGenerated={(map) => setGeneratedMap(map)}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Panel */}
        {(isGeneratingSummary || summary) && (
          <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-display uppercase">TL;DR Summary</h2>
            </div>
            {isGeneratingSummary ? (
              <div className="flex items-center justify-center h-24">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Generating summary...
                  </p>
                </div>
              </div>
            ) : (
              summary && (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-base prose-headings:my-4 prose-headings:font-display prose-h1:text-xl prose-h2:text-lg prose-ul:my-3 prose-ol:my-3 prose-li:my-1.5 prose-blockquote:border-l-primary prose-blockquote:pl-4 prose-a:text-primary prose-a:underline">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {summary}
                  </ReactMarkdown>
                </div>
              )
            )}
          </div>
        )}

        {/* Citation Panel */}
        {showCitation && (
          <div className="bg-accent/20 rounded-lg p-6 border border-accent/30">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-4 w-4 text-accent-foreground" />
              <h2 className="text-lg font-display uppercase">Citation Formats</h2>
            </div>
            <div className="space-y-4">
              {Object.entries(generateCitations()).map(([format, citation]) => (
                <div key={format} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-display uppercase text-muted-foreground">
                      {format.toUpperCase()}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(citation, format)}
                      className="h-8 px-3"
                    >
                      {copiedCitation === format ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="bg-background rounded-md p-3 border border-border">
                    <p className="text-sm font-mono leading-relaxed break-words">
                      {citation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">
                Citations generated automatically. Please verify accuracy before use.
              </p>
            </div>
          </div>
        )}

        {/* Keywords */}
        {paper.keywords && paper.keywords.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {paper.keywords.map((keyword) => (
              <Badge key={keyword} variant="secondary">
                {keyword}
              </Badge>
            ))}
          </div>
        )}

        {/* Abstract - Render MDX content here */}
        <div className="bg-accent/30 rounded-lg p-6 border border-border">
          <h2 className="text-lg font-display uppercase mb-3">Abstract</h2>
          <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-display prose-headings:uppercase prose-p:leading-relaxed prose-pre:bg-background prose-pre:text-foreground prose-ul:my-3 prose-ol:my-3 prose-li:my-1.5 prose-blockquote:border-l-primary prose-blockquote:pl-4 prose-a:text-primary prose-a:underline">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {(paper.fullContent || paper.abstract || "No abstract available for this paper.")
                .replace(/^Abstract\s*/i, '')}
            </ReactMarkdown>
          </div>
        </div>

        {/* Full Paper Access Section */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <h2 className="text-lg font-display uppercase px-6 py-3 bg-muted">
            Full Paper Access
          </h2>
          <div className="p-6">
            {paper.url ? (
              <div className="space-y-4">
                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-primary">Original Source</h3>
                      <p className="text-sm text-muted-foreground">
                        {paper.journal || "Academic Journal"}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Access the complete paper with all figures, tables, and references on the publisher's website.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild variant="default" className="flex-1">
                      <a
                        href={paper.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="flex items-center justify-center gap-2"
                      >
                        <BookOpen className="h-4 w-4" />
                        Read Full Paper
                      </a>
                    </Button>
                    {directPdfUrl && (
                      <Button asChild variant="outline" className="flex-1">
                        <a
                          href={directPdfUrl}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="flex items-center justify-center gap-2"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                          Download PDF
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Embedded Viewer - Try to show PDF/article inline */}
                <div className="bg-background rounded-lg border border-border overflow-hidden">
                  <div className="px-4 py-2 bg-muted/50 border-b border-border">
                    <p className="text-xs text-muted-foreground">
                      Embedded viewer (may not work for all papers due to publisher restrictions)
                    </p>
                  </div>
                  {directPdfUrl && !showFallback ? (
                    <div className="h-[600px] w-full relative">
                      <iframe
                        src={directPdfUrl}
                        className="w-full h-full border-0"
                        title="Full Paper PDF Viewer"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
                        height="600px"
                        onError={() => setShowFallback(true)}
                      />
                    </div>
                  ) : paper.url && !showFallback ? (
                    <div className="h-[600px] w-full relative">
                      <iframe
                        src={paper.url}
                        className="w-full h-full border-0"
                        title="Full Paper Article Viewer"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
                        height="600px"
                        onError={() => setShowFallback(true)}
                      />
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Unable to embed this paper inline
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Please use the buttons above to access the full paper
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                  <h4 className="font-medium text-accent-foreground mb-2">💡 Pro Tips</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Use the TL;DR summary above for quick understanding</li>
                    <li>• Ask the AI assistant questions about specific sections</li>
                    <li>• Generate citations for your research</li>
                    <li>• Check the keywords for related research areas</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  No external link available for this paper
                </p>
                <p className="text-xs text-muted-foreground">
                  The full content is available in the abstract section above
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
