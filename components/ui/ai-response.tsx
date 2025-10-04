"use client"

import React from 'react'
import { Markdown } from './markdown'
import { cn } from '@/lib/utils'

interface AIResponseProps {
  content: string
  className?: string
}

export function AIResponse({ content, className }: AIResponseProps) {
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

  // Remove unwanted processing lines only
  const preprocessContent = (content: string) => {
    let processed = content

    // Remove the "Creating a plan" and similar processing lines
    processed = processed.replace(/^### Creating a plan to answer your query.*$/gm, '')
    processed = processed.replace(/^### Interpreting summary using an AI model.*$/gm, '')
    processed = processed.replace(/^### Generating summary.*$/gm, '')

    // Clean up multiple consecutive newlines
    processed = processed.replace(/\n{3,}/g, '\n\n')

    // Trim leading/trailing whitespace
    processed = processed.trim()

    return processed
  }

  const references = parseReferences(content)
  const processedContent = preprocessContent(content)

  // Custom Markdown component that handles reference numbers
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
                  span.className = 'inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-600 rounded cursor-pointer hover:bg-blue-700 transition-colors mx-0.5'
                  span.textContent = match[1]
                  span.onclick = () => {
                    const ref = references[match[1]]
                    // Open directly in new tab
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
      <div ref={markdownRef} className="ai-markdown-content">
        <Markdown>
          {content}
        </Markdown>
      </div>
    )
  }

  return (
    <div className={cn("ai-response-container", className)}>
      <AIMarkdown content={processedContent} />
    </div>
  )
}