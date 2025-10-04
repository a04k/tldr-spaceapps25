import React, { type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MdxContentProps {
  content: string;
  className?: string;
}

export function MdxContent({ content, className }: MdxContentProps) {
  return (
    <div className={cn('prose prose-sm dark:prose-invert max-w-none', className)}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mt-5 mb-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-medium mt-4 mb-2" {...props} />,
          p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
          li: ({ node, ...props }) => <li className="ml-6" {...props} />,
          blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary pl-4 italic my-4" {...props} />,
          code: ({ node, ...props }) => <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props} />,
          pre: ({ node, ...props }) => <pre className="bg-muted p-4 rounded overflow-x-auto my-4 text-sm" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
          a: ({ node, ...props }) => <a className="text-primary underline hover:no-underline" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}