"use client"

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
// import remarkMath from 'remark-math'
// import rehypeKatex from 'rehype-katex'
// import rehypeHighlight from 'rehype-highlight'
import { cn } from '@/lib/utils'
import { Copy, ExternalLink } from 'lucide-react'
import { Button } from './button'
// import 'katex/dist/katex.min.css'
// import 'highlight.js/styles/github-dark.css'

interface MarkdownProps {
  children: string
  className?: string
}

const CodeBlock = ({ children, className, ...props }: any) => {
  const [copied, setCopied] = React.useState(false)
  const language = className?.replace('language-', '') || 'text'

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group">
      <div className="flex items-center justify-between bg-muted/50 px-4 py-2 border-t border-border rounded-t-lg">
        <span className="text-xs font-mono text-muted-foreground uppercase">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Copy className="h-3 w-3" />
          {copied && <span className="ml-1 text-xs">Copied!</span>}
        </Button>
      </div>
      <pre
        className={cn(
          "overflow-x-auto p-4 bg-muted/30 border border-t-0 border-border rounded-b-lg",
          className
        )}
        {...props}
      >
        <code className="text-sm font-mono">{children}</code>
      </pre>
    </div>
  )
}

const InlineCode = ({ children, ...props }: any) => (
  <code
    className="px-1.5 py-0.5 bg-muted/60 text-foreground rounded text-sm font-mono border"
    {...props}
  >
    {children}
  </code>
)

const Link = ({ href, children, ...props }: any) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-primary hover:text-primary/80 underline decoration-primary/30 hover:decoration-primary/60 transition-colors inline-flex items-center gap-1"
    {...props}
  >
    {children}
    <ExternalLink className="h-3 w-3" />
  </a>
)

const Blockquote = ({ children, ...props }: any) => (
  <blockquote
    className="border-l-4 border-primary/30 pl-4 py-2 bg-muted/20 rounded-r-lg my-4 italic text-muted-foreground"
    {...props}
  >
    {children}
  </blockquote>
)

const Table = ({ children, ...props }: any) => (
  <div className="overflow-x-auto my-4">
    <table className="w-full border-collapse border border-border rounded-lg" {...props}>
      {children}
    </table>
  </div>
)

const TableHeader = ({ children, ...props }: any) => (
  <th className="border border-border bg-muted/50 px-4 py-2 text-left font-semibold" {...props}>
    {children}
  </th>
)

const TableCell = ({ children, ...props }: any) => (
  <td className="border border-border px-4 py-2" {...props}>
    {children}
  </td>
)

const List = ({ ordered, children, ...props }: any) => {
  const Component = ordered ? 'ol' : 'ul'
  return (
    <Component
      className={cn(
        "my-3 space-y-2 ml-4",
        ordered ? "list-decimal list-outside" : "list-disc list-outside"
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

const ListItem = ({ children, ...props }: any) => (
  <li className="text-foreground leading-relaxed pl-2" {...props}>
    {children}
  </li>
)

const Heading = ({ level, children, ...props }: any) => {
  const Component = `h${level}` as keyof JSX.IntrinsicElements
  const sizes = {
    1: "text-2xl font-bold mt-8 mb-4 pb-2 border-b border-border",
    2: "text-xl font-semibold mt-6 mb-3",
    3: "text-lg font-medium mt-4 mb-2",
    4: "text-base font-medium mt-3 mb-2",
    5: "text-sm font-medium mt-2 mb-1",
    6: "text-sm font-medium mt-2 mb-1"
  }

  return (
    <Component
      className={cn("font-display text-foreground", sizes[level as keyof typeof sizes])}
      {...props}
    >
      {children}
    </Component>
  )
}

const Paragraph = ({ children, ...props }: any) => (
  <p className="text-foreground leading-relaxed my-3" {...props}>
    {children}
  </p>
)

export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div className={cn("prose prose-neutral dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Block elements
          h1: ({ children, ...props }) => <Heading level={1} {...props}>{children}</Heading>,
          h2: ({ children, ...props }) => <Heading level={2} {...props}>{children}</Heading>,
          h3: ({ children, ...props }) => <Heading level={3} {...props}>{children}</Heading>,
          h4: ({ children, ...props }) => <Heading level={4} {...props}>{children}</Heading>,
          h5: ({ children, ...props }) => <Heading level={5} {...props}>{children}</Heading>,
          h6: ({ children, ...props }) => <Heading level={6} {...props}>{children}</Heading>,
          p: Paragraph,
          blockquote: Blockquote,
          ul: ({ children, ...props }) => <List ordered={false} {...props}>{children}</List>,
          ol: ({ children, ...props }) => <List ordered={true} {...props}>{children}</List>,
          li: ListItem,
          table: Table,
          th: TableHeader,
          td: TableCell,

          // Inline elements
          code: ({ inline, children, className, ...props }: any) => {
            return inline ? (
              <InlineCode {...props}>{children}</InlineCode>
            ) : (
              <CodeBlock className={className} {...props}>
                {children}
              </CodeBlock>
            )
          },
          a: Link,

          // Strong and emphasis
          strong: ({ children, ...props }: any) => (
            <strong className="font-semibold text-foreground" {...props}>
              {children}
            </strong>
          ),
          em: ({ children, ...props }: any) => (
            <em className="italic text-foreground" {...props}>
              {children}
            </em>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}