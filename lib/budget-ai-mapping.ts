// Budget-friendly AI enhancement for knowledge maps
// Uses your existing Gemini API with optimized prompts

export class BudgetAIMapper {
  
  // Enhance basic map with minimal API calls
  static async enhanceMap(basicMap: any, paperText: string): Promise<any> {
    try {
      // Single API call to enhance the entire map
      const prompt = `Analyze this research paper excerpt and improve the knowledge map:

Paper: "${paperText.slice(0, 1000)}..."

Current concepts: ${basicMap.nodes.slice(1).map((n: any) => n.title).join(', ')}

Please provide:
1. 3-5 key relationships between concepts (format: "concept1 -> concept2: relationship_type")
2. 2-3 missing important concepts
3. Rate importance of each concept (1-5)

Keep response concise and structured.`

      // Get Gemini API key from server
      const keyResponse = await fetch('/api/config/gemini-key')
      if (!keyResponse.ok) {
        throw new Error('Failed to get API key')
      }
      const keyData = await keyResponse.json()
      const apiKey = keyData.apiKey

      if (!apiKey) {
        throw new Error('Gemini API key not configured')
      }

      // Call Gemini API directly
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            },
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`)
      }

      const data = await response.json()
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
      return this.parseAIResponse(aiResponse, basicMap)
      
    } catch (error) {
      console.warn('AI enhancement failed, using basic map:', error)
      return basicMap
    }
  }

  private static parseAIResponse(aiResponse: string, basicMap: any) {
    // Simple parsing of AI response to enhance map
    const lines = aiResponse.split('\n').filter(line => line.trim())
    
    // Extract relationships
    const relationships = lines
      .filter(line => line.includes('->'))
      .map(line => {
        const [from, rest] = line.split('->')
        const [to, type] = rest.split(':')
        return {
          from: from.trim(),
          to: to.trim(),
          type: type?.trim() || 'relates_to'
        }
      })

    // Add relationships as edges
    basicMap.edges.push(...relationships.map((rel: any) => ({
      from: this.findNodeId(basicMap.nodes, rel.from),
      to: this.findNodeId(basicMap.nodes, rel.to),
      type: rel.type,
      strength: 0.8
    })).filter((edge: any) => edge.from && edge.to))

    return basicMap
  }

  private static findNodeId(nodes: any[], title: string): string | null {
    const node = nodes.find(n => 
      n.title.toLowerCase().includes(title.toLowerCase()) ||
      title.toLowerCase().includes(n.title.toLowerCase())
    )
    return node?.id || null
  }
}

// Free alternatives for concept extraction
export class FreeNLPTools {
  
  // Extract entities using simple patterns
  static extractEntities(text: string) {
    const patterns = {
      methods: /\b(method|approach|technique|algorithm|model|framework)\w*\b/gi,
      findings: /\b(found|discovered|showed|demonstrated|revealed|concluded)\b.*?[.!?]/gi,
      concepts: /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g
    }

    return {
      methods: [...new Set((text.match(patterns.methods) || []).map(m => m.toLowerCase()))],
      findings: (text.match(patterns.findings) || []).slice(0, 5),
      concepts: [...new Set((text.match(patterns.concepts) || [])
        .filter(c => c.length > 3 && c.length < 30)
        .slice(0, 15))]
    }
  }

  // Simple sentiment analysis for relationship strength
  static getRelationshipStrength(context: string): number {
    const positiveWords = ['supports', 'confirms', 'validates', 'enhances', 'improves']
    const negativeWords = ['contradicts', 'challenges', 'questions', 'disputes']
    
    const positive = positiveWords.some(word => context.toLowerCase().includes(word))
    const negative = negativeWords.some(word => context.toLowerCase().includes(word))
    
    if (positive) return 0.8
    if (negative) return 0.3
    return 0.5
  }
}