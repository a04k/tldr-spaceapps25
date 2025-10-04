// Original Paper interface (for compatibility)
export interface Paper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  citations: number;
  abstract: string; // Short description/summary (typically ~150 chars with "...")
  content?: string; // Full paper content in MDX format - this should be displayed in abstract section when available
  keywords: string[];
  journal?: string;
  doi?: string;
  url?: string;
  pdfUrl?: string;
}

// PaperContext interface (for AI chat)
export interface PaperContext {
  id: string;
  title: string;
  authors: string[];
  year: number;
  abstract: string;
  fullContent: string;
  keywords: string[];
  journal?: string;
  url?: string;
  description?: string; // Added description field
}

// Contentlayer Paper interface
export interface ContentlayerPaper {
  _id: string;
  id: string;
  slug: string;
  title: string;
  description: string;
  authors: string; // Raw string from frontmatter
  parsedAuthors: string[];
  url?: string;
  year?: number;
  journal?: string;
  doi?: string;
  keywords?: string; // Raw string from frontmatter
  parsedKeywords: string[];
  citations: number;
  content: string;
  body: {
    raw: string;
    code: string;
  };
  wordCount: number;
  readingTime: number;
  filePath: string;
  sourceFilePath: string;
  titleWithoutExt: string;
}
