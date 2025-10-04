"use client"

import React from 'react'
import { Markdown } from './markdown'

import { cn } from '@/lib/utils'

interface TLDRResponseProps {
  content: string
  className?: string
}

export function TLDRResponse({ content, className }: TLDRResponseProps) {
  const markdownRef = React.useRef<HTMLDivElement>(null)

  // Parse references from the content - extract reference numbers and titles
  const parseReferences = (content: string) => {
    const references: { [key: string]: { url: string; title: string } } = {}

    // Split content into sections to find the References section
    const sections = content.split(/## References/i)
    if (sections.length < 2) return references

    const referencesSection = sections[1]

    // Look for reference patterns in the references section
    // Pattern: "#1 Title — Year" or "#2 Title — Year"
    const lines = referencesSection.split('\n').filter(line => line.trim())

    lines.forEach(line => {
      const trimmedLine = line.trim()
      // Match pattern like "#1 Title — Year" or "#2 Title — Year"
      const refMatch = trimmedLine.match(/^#(\d+)\s+(.+?)\s*—\s*(\d{4})/)
      if (refMatch) {
        const refNumber = refMatch[1]
        const title = refMatch[2].trim()
        const year = refMatch[3]

        references[refNumber] = {
          url: `https://scholar.google.com/scholar?q=${encodeURIComponent(title)}`, // Search on Google Scholar
          title: `${title} (${year})`
        }
      }
    })

    return references
  }

  const references = parseReferences(content)

  // Custom Markdown component that handles reference numbers like TL;DR AI
  const AIMarkdown = ({ content }: { content: string }) => {
    React.useEffect(() => {
      if (markdownRef.current) {
        // Replace [1], [2], etc. with clickable spans after markdown is rendered
        const walker = document.createTreeWalker(
          markdownRef.current,
          NodeFilter.SHOW_TEXT,
          null
        )

        const textNodes: Text[] = []
        let node
        while ((node = walker.nextNode())) {
          textNodes.push(node as Text)
        }

        textNodes.forEach((textNode) => {
          const text = textNode.textContent || ''
          if (text.match(/\[\d+\]/)) {
            const parent = textNode.parentNode
            if (parent) {
              const fragment = document.createDocumentFragment()
              const parts = text.split(/(\[\d+\])/g)

              parts.forEach((part) => {
                const match = part.match(/\[(\d+)\]/)
                if (match && references[match[1]]) {
                  const span = document.createElement('span')
                  span.className = 'AI-ref'
                  span.textContent = match[1]
                  span.onclick = () => {
                    const ref = references[match[1]]
                    // Open directly in new tab instead of using the reference panel
                    window.open(ref.url, '_blank')
                  }
                  fragment.appendChild(span)
                } else if (part) {
                  fragment.appendChild(document.createTextNode(part))
                }
              })

              parent.replaceChild(fragment, textNode)
            }
          }
        })
      }
    }, [content, references])

    return (
      <div ref={markdownRef}>
        <Markdown className="text-base leading-relaxed">
          {content}
        </Markdown>
      </div>
    )
  }

  return (
    <div className={cn("AI-response-container group", className)}>
      {/* Enhanced Markdown Content with Custom Reference Styling */}
      <div className="AI-markdown">
        <AIMarkdown content={content} />
      </div>

      {/* Custom Styles for AI-like appearance */}
      <style jsx>{`
        .AI-response-container {
          position: relative;
        }
        
        .AI-markdown :global(h1) {
          font-size: 1.375rem;
          font-weight: 400;
          margin: 1.5rem 0 1rem 0;
          color: hsl(var(--foreground));
          border-bottom: 1px solid hsl(var(--border));
          padding-bottom: 0.5rem;
        }
        
        .AI-markdown :global(h2) {
          font-size: 1.25rem;
          font-weight: 400;
          margin: 1.25rem 0 0.75rem 0;
          color: hsl(var(--foreground));
        }
        
        .AI-markdown :global(h3) {
          font-size: 1.125rem;
          font-weight: 400;
          margin: 1rem 0 0.5rem 0;
          color: hsl(var(--foreground));
        }
        
        .AI-markdown :global(p) {
          margin: 0.75rem 0;
          line-height: 1.7;
          color: hsl(var(--foreground));
          font-size: 1rem;
        }
        
        .AI-markdown :global(ul) {
          margin: 0.75rem 0;
          padding-left: 1.5rem;
        }
        
        .AI-markdown :global(li) {
          margin: 0.25rem 0;
          line-height: 1.6;
          font-size: 1rem;
        }
        
        .AI-markdown :global(strong) {
          font-weight: 450;
          color: hsl(var(--foreground));
        }
        
        .AI-markdown :global(a) {
          color: hsl(var(--primary));
          text-decoration: underline;
          text-decoration-color: hsl(var(--primary) / 0.3);
          transition: all 0.2s ease;
        }
        
        .AI-markdown :global(a:hover) {
          text-decoration-color: hsl(var(--primary));
        }
        
        .AI-markdown :global(code) {
          background: hsl(var(--muted));
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          border: 1px solid hsl(var(--border));
        }
        
        .AI-markdown :global(blockquote) {
          border-left: 3px solid hsl(var(--primary));
          padding-left: 1rem;
          margin: 1rem 0;
          background: hsl(var(--muted) / 0.3);
          padding: 0.75rem 1rem;
          border-radius: 0 0.5rem 0.5rem 0;
          font-style: italic;
        }
        
        /* Reference styling - for [1], [2], etc. */
        .AI-markdown :global(sup) {
          background: hsl(var(--primary) / 0.1);
          color: hsl(var(--primary));
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
          border: 1px solid hsl(var(--primary) / 0.2);
        }
        
        /* Style reference numbers in brackets like [1] [2] */
        .AI-markdown :global(p) {
          position: relative;
        }
        
        .AI-markdown :global(p):has-text([1]),
        .AI-markdown :global(p):has-text([2]),
        .AI-markdown :global(p):has-text([3]),
        .AI-markdown :global(p):has-text([4]),
        .AI-markdown :global(p):has-text([5]) {
          /* This will be handled by the component logic */
        }
        
        /* Table styling */
        .AI-markdown :global(table) {
          border-collapse: collapse;
          margin: 1rem 0;
          width: 100%;
          border: 1px solid hsl(var(--border));
          border-radius: 0.5rem;
          overflow: hidden;
        }
        
        .AI-markdown :global(th) {
          background: hsl(var(--muted));
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          border-bottom: 1px solid hsl(var(--border));
        }
        
        .AI-markdown :global(td) {
          padding: 0.75rem;
          border-bottom: 1px solid hsl(var(--border));
        }
        
        .AI-markdown :global(tr:last-child td) {
          border-bottom: none;
        }
        
        /* Clickable reference numbers styling - exactly like AI AI */
        .AI-markdown :global(.AI-ref) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1.25rem;
          height: 1.25rem;
          font-size: 0.75rem;
          font-weight: 500;
          color: white;
          background-color: #2563eb;
          border-radius: 0.125rem;
          margin: 0 0.125rem;
          cursor: pointer;
          transition: background-color 0.2s ease;
          text-decoration: none;
        }
        
        .AI-markdown :global(.AI-ref:hover) {
          background-color: #1d4ed8;
        }
      `}</style>
    </div>
  )
}