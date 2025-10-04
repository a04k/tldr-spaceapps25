// Cost-effective knowledge mapping utilities

export interface KnowledgeNode {
  id: string
  title: string
  type: 'concept' | 'method' | 'finding' | 'author' | 'reference'
  content: string
  connections: string[]
  importance: number // 1-5 scale
  position?: { x: number; y: number }
}

export interface KnowledgeMap {
  id: string
  paperId: string
  title: string
  nodes: KnowledgeNode[]
  edges: Array<{
    from: string
    to: string
    type: 'relates_to' | 'builds_on' | 'contradicts' | 'supports'
    strength: number
  }>
}

// Free text processing utilities
export class CostEffectiveMapper {
  
  // Extract key concepts using simple NLP (no API calls)
  static extractConcepts(text: string): string[] {
    // Simple keyword extraction
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'])
    
    const wordCounts = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word))
      .reduce((acc: { [key: string]: number }, word) => {
        acc[word] = (acc[word] || 0) + 1
        return acc
      }, {})
    
    return Object.entries(wordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word)
  }

  // Create basic knowledge map structure
  static createBasicMap(paperText: string, title: string): KnowledgeMap {
    if (!paperText || paperText.trim().length === 0) {
      throw new Error('Paper text cannot be empty')
    }

    const concepts = this.extractConcepts(paperText)
    console.log('Extracted concepts:', concepts)
    
    if (concepts.length === 0) {
      console.warn('No concepts extracted from paper text')
    }
    
    const nodes: KnowledgeNode[] = [
      // Main paper node
      {
        id: 'main',
        title: title || 'Research Paper',
        type: 'concept',
        content: paperText.slice(0, 200) + (paperText.length > 200 ? '...' : ''),
        connections: concepts.slice(0, 5),
        importance: 5,
        position: { x: 0, y: 0 }
      },
      // Concept nodes
      ...concepts.slice(0, 10).map((concept, i) => ({
        id: `concept-${i}`,
        title: concept.charAt(0).toUpperCase() + concept.slice(1),
        type: 'concept' as const,
        content: this.getConceptContext(paperText, concept),
        connections: [],
        importance: Math.max(1, 5 - Math.floor(i / 2)),
        position: { 
          x: Math.cos(i * 2 * Math.PI / 10) * 250, 
          y: Math.sin(i * 2 * Math.PI / 10) * 250 
        }
      }))
    ]

    const edges = this.generateBasicEdges(nodes)
    console.log('Generated nodes:', nodes.length, 'edges:', edges.length)

    return {
      id: `map-${Date.now()}`,
      paperId: (title || 'paper').replace(/\s+/g, '-').toLowerCase(),
      title: `Knowledge Map: ${title || 'Research Paper'}`,
      nodes,
      edges
    }
  }

  private static extractSections(text: string): string[] {
    // Simple section detection
    return text.split(/\n\s*\n/).filter(section => section.trim().length > 50)
  }

  private static getConceptContext(text: string, concept: string): string {
    const sentences = text.split(/[.!?]+/)
    const relevantSentences = sentences.filter(s => 
      s.toLowerCase().includes(concept.toLowerCase())
    )
    return relevantSentences.slice(0, 2).join('. ').trim()
  }

  private static generateBasicEdges(nodes: KnowledgeNode[]): Array<{
    from: string
    to: string
    type: 'relates_to' | 'builds_on' | 'contradicts' | 'supports'
    strength: number
  }> {
    const edges: Array<{
      from: string
      to: string
      type: 'relates_to' | 'builds_on' | 'contradicts' | 'supports'
      strength: number
    }> = []
    const mainNode = nodes.find(n => n.id === 'main')
    
    // Connect main node to top concepts
    if (mainNode) {
      nodes.slice(1, 6).forEach(node => {
        edges.push({
          from: 'main',
          to: node.id,
          type: 'relates_to' as const,
          strength: node.importance / 5
        })
      })
    }

    return edges
  }
}