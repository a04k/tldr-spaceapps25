"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/dashboard/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Paper, PaperContext } from "@/types/paper"
import { getSemanticTerms, semanticSearch, getHighlightTerms, findWordMatches, semanticSearchCompound, parseCompoundQuery, findCompoundWordMatches } from "@/lib/semantic-search"

type OnPaperSelectCallback = (paper: Paper) => void;

interface PaperGridProps {
  onPaperSelect?: OnPaperSelectCallback;
  searchQuery?: string;
}

export default function PaperGrid({ onPaperSelect, searchQuery }: PaperGridProps = {}) {
  const [papers, setPapers] = useState<Paper[]>([])
  const [selectedPaper, setSelectedPaper] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedPage = localStorage.getItem('tldr_laboratory_page')
      return savedPage ? parseInt(savedPage, 10) : 1
    }
    return 1
  })
  const papersPerPage = 12;

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await fetch('/api/search/papers?q=')
        if (response.ok) {
          const data = await response.json()
          setPapers(data.papers)
        } else {
          console.error('Failed to fetch papers:', response.statusText)
          setPapers([])
        }
      } catch (error) {
        console.error('Error fetching papers:', error)
        setPapers([])
      } finally {
        setLoading(false)
      }
    }

    fetchPapers()
  }, [])

  // Parse compound query and get semantic terms
  const { conditions, isCompound } = searchQuery ? parseCompoundQuery(searchQuery) : { conditions: [], isCompound: false };
  const semanticTerms = searchQuery ? getSemanticTerms(searchQuery) : [];

  // Filter papers based on compound semantic search
  const filteredPapers = papers.filter(paper => {
    if (!searchQuery || searchQuery.trim() === '') return true;
    
    // Combine all paper text for compound search
    const allPaperText = [
      paper.title || '',
      (paper.authors || []).join(' '),
      paper.abstract || '',
      (paper.keywords || []).join(' '),
      paper.content || ''
    ].join(' ');
    
    // Use compound semantic search on the combined text
    return semanticSearchCompound(allPaperText, searchQuery);
  });

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Function to highlight matching text with compound query support and different colors
  const highlightText = (text: string, query: string) => {
    if (!query || query.trim() === '' || !text) return text;
    
    const textStr = String(text);
    const { isCompound } = parseCompoundQuery(query);
    
    if (isCompound) {
      // Use compound highlighting with different colors for each condition
      const allMatches = findCompoundWordMatches(textStr, query);
      
      if (allMatches.length === 0) {
        return textStr;
      }
      
      // Sort matches by start position - don't merge overlapping matches from different conditions
      allMatches.sort((a, b) => {
        if (a.start !== b.start) return a.start - b.start;
        // If same start position, prioritize original terms and lower condition index
        if (a.isOriginal !== b.isOriginal) return a.isOriginal ? -1 : 1;
        return a.conditionIndex - b.conditionIndex;
      });
      
      // Only merge matches from the same condition that overlap
      const mergedMatches: typeof allMatches = [];
      
      for (const match of allMatches) {
        const lastMatch = mergedMatches[mergedMatches.length - 1];
        if (lastMatch && 
            match.start <= lastMatch.end && 
            match.conditionIndex === lastMatch.conditionIndex) {
          // Only merge if from same condition
          lastMatch.end = Math.max(lastMatch.end, match.end);
          lastMatch.term = textStr.slice(lastMatch.start, lastMatch.end);
          if (match.isOriginal) {
            lastMatch.isOriginal = true;
          }
        } else {
          mergedMatches.push(match);
        }
      }
      
      // Build highlighted text with different colors for each condition
      const parts = [];
      let currentIndex = 0;
      
      for (const match of mergedMatches) {
        // Add text before match
        if (match.start > currentIndex) {
          parts.push(textStr.slice(currentIndex, match.start));
        }
        
        // Use dynamic colors based on semantic category
        const backgroundColor = match.color;
        const textColor = '#000000'; // Black text for better readability
        
        parts.push(
          <mark 
            key={`highlight-${match.start}-${match.conditionIndex}`} 
            className="px-0.5 rounded font-medium"
            style={{ 
              backgroundColor, 
              color: textColor,
              opacity: match.isOriginal ? 0.9 : 0.7 // Slightly more transparent for semantic matches
            }}
            title={`Category: ${match.category}`}
          >
            {match.term}
          </mark>
        );
        
        currentIndex = match.end;
      }
      
      // Add remaining text
      if (currentIndex < textStr.length) {
        parts.push(textStr.slice(currentIndex));
      }
      
      return parts;
    } else {
      // Single condition - use regular highlighting with color categories
      const termsToHighlight = getHighlightTerms(query);
      const allMatches: Array<{start: number, end: number, term: string, isOriginal: boolean, color: string, category: string}> = [];
      
      termsToHighlight.forEach(term => {
        const wordMatches = findWordMatches(textStr, term);
        wordMatches.forEach(match => {
          allMatches.push({
            start: match.start,
            end: match.end,
            term: textStr.slice(match.start, match.end),
            isOriginal: term.toLowerCase() === query.toLowerCase(),
            color: match.color,
            category: match.category
          });
        });
      });
      
      if (allMatches.length === 0) {
        return textStr;
      }
      
      // Sort and merge overlapping matches
      allMatches.sort((a, b) => a.start - b.start);
      const mergedMatches: typeof allMatches = [];
      
      for (const match of allMatches) {
        const lastMatch = mergedMatches[mergedMatches.length - 1];
        if (lastMatch && match.start <= lastMatch.end) {
          lastMatch.end = Math.max(lastMatch.end, match.end);
          lastMatch.term = textStr.slice(lastMatch.start, lastMatch.end);
          if (match.isOriginal) lastMatch.isOriginal = true;
        } else {
          mergedMatches.push(match);
        }
      }
      
      // Build highlighted text
      const parts = [];
      let currentIndex = 0;
      
      for (const match of mergedMatches) {
        if (match.start > currentIndex) {
          parts.push(textStr.slice(currentIndex, match.start));
        }
        
        // Use dynamic colors based on semantic category
        const backgroundColor = match.color;
        const textColor = '#000000'; // Black text for better readability
        
        parts.push(
          <mark 
            key={`highlight-${match.start}`} 
            className="px-0.5 rounded font-medium"
            style={{ 
              backgroundColor, 
              color: textColor,
              opacity: match.isOriginal ? 0.9 : 0.7 // Slightly more transparent for semantic matches
            }}
            title={`Category: ${match.category}`}
          >
            {match.term}
          </mark>
        );
        
        currentIndex = match.end;
      }
      
      if (currentIndex < textStr.length) {
        parts.push(textStr.slice(currentIndex));
      }
      
      return parts;
    }
  };

  // Calculate pagination based on filtered papers
  const indexOfLastPaper = currentPage * papersPerPage
  const indexOfFirstPaper = indexOfLastPaper - papersPerPage
  const currentPapers = filteredPapers.slice(indexOfFirstPaper, indexOfLastPaper)
  const totalPages = Math.ceil(filteredPapers.length / papersPerPage)

  const handlePaperClick = (paper: Paper) => {
    setSelectedPaper(paper.id);
    if (onPaperSelect) {
      onPaperSelect(paper);
    }
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    localStorage.setItem('tldr_laboratory_page', pageNumber.toString())
    const element = document.getElementById('paper-grid')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="h-full opacity-50">
            <div className="p-6 flex-grow">
              <div className="h-5 bg-muted rounded mb-2 w-3/4"></div>
              <p className="text-sm text-muted-foreground mb-3">Loading paper details...</p>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">Loading paper abstract...</p>
              <div className="flex gap-2 flex-wrap pt-2 border-t border-border">
                <Badge variant="secondary" className="text-xs">Loading</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div id="paper-grid" className="space-y-6">
      {/* Show search results count and compound query info */}
      {searchQuery && searchQuery.trim() !== '' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Found {filteredPapers.length} paper{filteredPapers.length !== 1 ? 's' : ''} matching "{searchQuery}"
              {isCompound && (
                <span className="ml-2 text-primary">🔗 AND search active</span>
              )}
              {!isCompound && semanticTerms.length > 1 && (
                <span className="ml-2 text-primary">🔍 Smart search active</span>
              )}
            </div>
          </div>
          
          {/* Show compound query conditions */}
          {isCompound && (
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-muted-foreground">All conditions must match:</span>
              {conditions.map((condition, index) => {
                const colorClasses = [
                  "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700",
                  "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-700",
                  "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700"
                ];
                const className = colorClasses[index] || colorClasses[0];
                
                return (
                  <span key={index} className={`px-2 py-1 rounded ${className}`}>
                    {condition.trim()}
                  </span>
                );
              })}
            </div>
          )}
          
          {/* Show semantic terms for single queries */}
          {!isCompound && semanticTerms.length > 1 && (
            <div className="flex flex-wrap gap-1 text-xs">
              <span className="text-muted-foreground">Also searching:</span>
              {semanticTerms.slice(1, 6).map((term, index) => (
                <span key={index} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                  {term}
                </span>
              ))}
              {semanticTerms.length > 6 && (
                <span className="text-muted-foreground">+{semanticTerms.length - 6} more</span>
              )}
            </div>
          )}
          
          {/* Color legend for compound queries */}
          {isCompound && (
            <div className="text-xs text-muted-foreground">
              <span className="mr-4">Highlighting: </span>
              <span className="inline-flex items-center gap-1 mr-3">
                <span className="w-3 h-3 bg-yellow-300 rounded"></span>
                Condition 1
              </span>
              <span className="inline-flex items-center gap-1 mr-3">
                <span className="w-3 h-3 bg-purple-300 rounded"></span>
                Condition 2
              </span>
              {conditions.length > 2 && (
                <span className="inline-flex items-center gap-1">
                  <span className="w-3 h-3 bg-green-300 rounded"></span>
                  Condition 3
                </span>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {currentPapers.map((paper) => (
          <div
            key={paper.id}
            onClick={() => handlePaperClick(paper)}
            className={cn(
              "group cursor-pointer transition-all duration-200",
              selectedPaper === paper.id && "ring-2 ring-primary",
            )}
          >
            <Card className="h-full hover:bg-accent/50 transition-colors flex flex-col">
              <div className="p-5 flex-grow">
                <h3 className="font-semibold text-base mb-2 line-clamp-2">
                  {highlightText(paper.title || 'Untitled Paper', searchQuery || '')}
                </h3>
                <p className="text-sm text-muted-foreground underline mb-3">
                  {highlightText((paper.authors || []).join(", "), searchQuery || '')}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {highlightText(
                    paper.abstract?.replace(/^Abstract\s*/i, '') || paper.abstract || '',
                    searchQuery || ''
                  )}
                </p>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-1 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md ${
              currentPage === 1
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            Previous
          </button>
          
          <div className="flex space-x-1">
            {currentPage > 3 && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  className="w-8 h-8 rounded-full bg-muted text-foreground hover:bg-muted/80"
                >
                  1
                </button>
                {currentPage > 4 && <span className="w-8 h-8 flex items-center justify-center">...</span>}
              </>
            )}
            
            {Array.from({ length: 5 }, (_, i) => {
              const pageNum = Math.max(1, currentPage - 2) + i;
              if (pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded-full ${
                    currentPage === pageNum
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {pageNum}
                </button>
              );
            }).filter(Boolean)}
            
            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && <span className="w-8 h-8 flex items-center justify-center">...</span>}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className="w-8 h-8 rounded-full bg-muted text-foreground hover:bg-muted/80"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md ${
              currentPage === totalPages
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            Next
          </button>
        </div>
      )}

      {filteredPapers.length === 0 && !loading && (
        <div className="col-span-full text-center py-12">
          {searchQuery && searchQuery.trim() !== '' ? (
            <>
              <p className="text-lg text-muted-foreground">No papers found matching "{searchQuery}"</p>
              <p className="text-sm text-muted-foreground/70 mt-2">
                Try different keywords or check your spelling.
              </p>
            </>
          ) : (
            <>
              <p className="text-lg text-muted-foreground">No papers found in the database.</p>
              <p className="text-sm text-muted-foreground/70 mt-2">
                Add papers to the database to display them here.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}