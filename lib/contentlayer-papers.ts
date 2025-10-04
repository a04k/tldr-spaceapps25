import { Paper } from '@/types/paper';
import { getAllScientificPapers, getScientificPaperById, searchScientificPapers } from './scientific-mdx-parser';

// Convert scientific paper to our Paper interface for compatibility
function convertScientificPaper(paper: any): Paper {
  return {
    id: paper.id,
    title: paper.title,
    authors: paper.parsedAuthors || [],
    year: paper.year || new Date().getFullYear(),
    citations: paper.citations || 0,
    abstract: paper.abstract,
    keywords: paper.parsedKeywords || [],
    journal: paper.journal,
    doi: paper.doi,
    url: paper.url,
    content: paper.content,
  };
}

// Get all papers using the scientific parser
export async function getAllPapers(): Promise<Paper[]> {
  try {
    const scientificPapers = await getAllScientificPapers();
    return scientificPapers.map(convertScientificPaper);
  } catch (error) {
    console.error('Error fetching papers with scientific parser:', error);
    return [];
  }
}

// Get a specific paper by ID using the scientific parser
export async function getPaperById(id: string): Promise<Paper | null> {
  try {
    const scientificPaper = await getScientificPaperById(id);
    
    if (!scientificPaper) {
      return null;
    }
    
    return convertScientificPaper(scientificPaper);
  } catch (error) {
    console.error(`Error fetching paper ${id} with scientific parser:`, error);
    return null;
  }
}

// Search papers based on query using the scientific parser
export async function searchPapers(query: string): Promise<Paper[]> {
  if (!query.trim()) return [];
  
  try {
    const scientificPapers = await searchScientificPapers(query);
    
    return scientificPapers.map(convertScientificPaper);
  } catch (error) {
    console.error('Error searching papers with scientific parser:', error);
    return [];
  }
}