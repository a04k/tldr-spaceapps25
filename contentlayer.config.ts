import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'

// Custom remark plugin to handle scientific notation that could be misinterpreted as HTML
function rehypeScientificNotation() {
  return (tree: any) => {
    // Process text nodes to handle scientific notation
    const visit = require('unist-util-visit')
    visit(tree, 'text', (node) => {
      if (typeof node.value === 'string') {
        // Handle p < 0.05 patterns and other scientific notations that might be misinterpreted as HTML
        node.value = node.value.replace(/\b(p|P)\s*<\s*([0-9.]+)\b/g, '$1 &lt; $2');
        // Handle other common scientific inequality notations
        node.value = node.value.replace(/\b([a-zA-Z])\s*<\s*([a-zA-Z0-9.])\b/g, '$1 &lt; $2');
        node.value = node.value.replace(/\b([a-zA-Z])\s*>\s*([a-zA-Z0-9.])\b/g, '$1 &gt; $2');
      }
    })
  }
}

// Preprocess content to fix common scientific MDX issues
function preprocessContent(content: string, filePath: string) {
  // Fix multi-line titles that break YAML parsing
  content = content.replace(/(title:\s*".*?)(\r?\n[ \t]*[a-zA-Z-]+)/g, (match, titleStart, nextLine) => {
    // Replace newlines in title with spaces and properly close the quote
    const fixedTitle = titleStart.replace(/\r?\n/g, ' ') + '"';
    // Add the next line back with proper YAML formatting
    const remainder = nextLine.trim();
    return `${fixedTitle}\n${remainder}`;
  });

  // Fix other multi-line strings in frontmatter
  content = content.replace(/^(description|authors|keywords|journal|doi):\s*".*?$/m, (match) => {
    // For now, just ensure basic quote closure - more complex logic would be needed for full handling
    if ((match.match(/"/g) || []).length % 2 !== 0) {
      // If there's an odd number of quotes, there's an unclosed string
      return match + '"';
    }
    return match;
  });

  return content;
}

export const Paper = defineDocumentType(() => ({
  name: 'Paper',
  filePathPattern: `papers/**/*.mdx`,
  contentType: 'markdown',
  fields: {
    title: {
      type: 'string',
      description: 'The title of the paper',
      required: true,
    },
    description: {
      type: 'string',
      description: 'The description/abstract of the paper',
      required: true,
    },
    authors: {
      type: 'string', // Accept as string initially, then parse in computed fields
      description: 'The authors of the paper (semicolon-separated)',
      required: true,
    },
    url: {
      type: 'string',
      description: 'The URL to the original paper',
    },
    year: {
      type: 'number',
      description: 'The publication year of the paper',
    },
    journal: {
      type: 'string',
      description: 'The journal where the paper was published',
    },
    doi: {
      type: 'string',
      description: 'The DOI of the paper',
    },
    keywords: {
      type: 'string', // Accept as string initially, then parse in computed fields
      description: 'The keywords for the paper (semicolon-separated)',
    },
    citations: {
      type: 'number',
      description: 'The number of citations',
      default: 0,
    },
  },
  computedFields: {
    id: {
      type: 'string',
      description: 'The ID of the paper',
      resolve: (doc) => doc._id.replace(/\.mdx$/, ''),
    },
    slug: {
      type: 'string',
      description: 'The slug of the paper',
      resolve: (doc) => doc._id.replace(/\.mdx$/, ''),
    },
    // Parse semicolon-separated authors into an array
    parsedAuthors: {
      type: 'list',
      of: { type: 'string' },
      resolve: (doc) => {
        if (typeof doc.authors === 'string') {
          return doc.authors.split(';').map(author => author.trim());
        }
        return Array.isArray(doc.authors) ? doc.authors : [];
      }
    },
    // Parse semicolon-separated keywords into an array
    parsedKeywords: {
      type: 'list',
      of: { type: 'string' },
      resolve: (doc) => {
        if (typeof doc.keywords === 'string') {
          return doc.keywords.split(';').map(keyword => keyword.trim());
        }
        return Array.isArray(doc.keywords) ? doc.keywords : [];
      }
    },
    content: {
      type: 'string',
      description: 'The full content of the paper',
      resolve: (doc) => {
        return doc.body.raw;
      }
    },
    // Extract additional content-based information
    wordCount: {
      type: 'number',
      resolve: (doc) => doc.body.raw.split(/\s+/).length,
    },
    readingTime: {
      type: 'number',
      resolve: (doc) => Math.ceil(doc.body.raw.split(/\s+/).length / 200), // 200 words per minute
    },
  },
}))

export default makeSource({
  contentDirPath: 'data',
  documentTypes: [Paper],
  disableImportAliasWarning: true,
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, rehypeScientificNotation],
  },
})