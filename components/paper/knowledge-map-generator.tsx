"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Brain, Network, Sparkles } from 'lucide-react'
import { CostEffectiveMapper } from '@/lib/knowledge-mapping'
import { BudgetAIMapper } from '@/lib/budget-ai-mapping'
import SimpleKnowledgeMap from '@/components/knowledge-map/simple-map'
import type { KnowledgeMap } from '@/lib/knowledge-mapping'

interface KnowledgeMapGeneratorProps {
  paperTitle: string
  paperContent: string
  onMapGenerated?: (map: KnowledgeMap) => void
}

export default function KnowledgeMapGenerator({ 
  paperTitle, 
  paperContent, 
  onMapGenerated 
}: KnowledgeMapGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [knowledgeMap, setKnowledgeMap] = useState<KnowledgeMap | null>(null)
  const [enhancementLevel, setEnhancementLevel] = useState<'basic' | 'enhanced' | 'advanced'>('enhanced')

  const generateMap = async () => {
    setIsGenerating(true)
    setProgress(0)

    try {
      // Validate inputs
      if (!paperContent || paperContent.trim().length === 0) {
        throw new Error('Paper content is required to generate a knowledge map')
      }

      // Step 1: Create basic map
      setProgress(20)
      console.log('Creating basic map...')
      const basicMap = CostEffectiveMapper.createBasicMap(paperContent, paperTitle)
      console.log('Basic map created:', basicMap)
      
      setProgress(40)
      
      let finalMap = basicMap
      
      if (enhancementLevel !== 'basic') {
        try {
          // Step 2: AI Enhancement
          setProgress(60)
          console.log('Enhancing with AI...')
          finalMap = await BudgetAIMapper.enhanceMap(basicMap, paperContent)
          
          if (enhancementLevel === 'advanced') {
            // Step 3: Advanced AI features
            setProgress(80)
            console.log('Applying advanced AI analysis...')
            // Add more sophisticated analysis here
            finalMap = await BudgetAIMapper.enhanceMap(finalMap, paperContent)
          }
          
          console.log('AI enhancement complete')
        } catch (aiError) {
          console.warn('AI enhancement failed, using basic map:', aiError)
          // Continue with basic map if AI fails
        }
      }
      
      setProgress(100)
      setKnowledgeMap(finalMap)
      onMapGenerated?.(finalMap)
      console.log('Knowledge map generated successfully')
      
    } catch (error) {
      console.error('Map generation failed:', error)
      alert(`Failed to generate knowledge map: ${error}`)
    } finally {
      setIsGenerating(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-4">
      {!knowledgeMap ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Knowledge Map Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">AI Enhancement Level</span>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    type="radio"
                    name="enhancement"
                    value="basic"
                    checked={enhancementLevel === 'basic'}
                    onChange={(e) => setEnhancementLevel(e.target.value as any)}
                    className="text-primary"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">Basic Mapping</div>
                    <div className="text-xs text-muted-foreground">Fast concept extraction and basic relationships</div>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors bg-primary/5 border-primary/30">
                  <input
                    type="radio"
                    name="enhancement"
                    value="enhanced"
                    checked={enhancementLevel === 'enhanced'}
                    onChange={(e) => setEnhancementLevel(e.target.value as any)}
                    className="text-primary"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm flex items-center gap-2">
                      AI Enhanced <Sparkles className="h-3 w-3 text-yellow-500" />
                    </div>
                    <div className="text-xs text-muted-foreground">Smart relationship detection and concept importance scoring</div>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    type="radio"
                    name="enhancement"
                    value="advanced"
                    checked={enhancementLevel === 'advanced'}
                    onChange={(e) => setEnhancementLevel(e.target.value as any)}
                    className="text-primary"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm flex items-center gap-2">
                      Advanced AI <Brain className="h-3 w-3 text-primary" />
                    </div>
                    <div className="text-xs text-muted-foreground">Deep semantic analysis and cross-domain connections</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20">
              <div className="text-sm text-foreground">
                {enhancementLevel === 'basic' && (
                  <>
                    <p className="font-medium mb-2">🔍 Basic Analysis includes:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Automatic concept extraction from text</li>
                      <li>Basic keyword relationship mapping</li>
                      <li>Simple visual knowledge graph</li>
                    </ul>
                  </>
                )}
                {enhancementLevel === 'enhanced' && (
                  <>
                    <p className="font-medium mb-2">✨ AI Enhancement includes:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Intelligent relationship detection between concepts</li>
                      <li>AI-powered concept importance scoring</li>
                      <li>Smart clustering of related ideas</li>
                      <li>Enhanced visual layout optimization</li>
                    </ul>
                  </>
                )}
                {enhancementLevel === 'advanced' && (
                  <>
                    <p className="font-medium mb-2">🧠 Advanced AI includes:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Deep semantic understanding of concepts</li>
                      <li>Cross-domain knowledge connections</li>
                      <li>Advanced relationship inference</li>
                      <li>Multi-layered concept hierarchies</li>
                      <li>Contextual importance weighting</li>
                    </ul>
                  </>
                )}
              </div>
            </div>

            {isGenerating && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  {progress < 20 && "Analyzing paper content..."}
                  {progress >= 20 && progress < 40 && "Extracting key concepts..."}
                  {progress >= 40 && progress < 60 && "Building knowledge graph..."}
                  {progress >= 60 && progress < 80 && "Enhancing with AI..."}
                  {progress >= 80 && "Applying advanced analysis..."}
                </p>
              </div>
            )}

            <Button 
              onClick={generateMap} 
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Brain className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating Knowledge Map...' : 'Generate AI Knowledge Map'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">AI Knowledge Map</h3>
              <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">
                {enhancementLevel.charAt(0).toUpperCase() + enhancementLevel.slice(1)}
              </div>
            </div>
            <Button variant="outline" onClick={() => setKnowledgeMap(null)}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate New Map
            </Button>
          </div>
          
          <div className="h-[600px] border rounded-lg overflow-hidden bg-gradient-to-br from-background to-muted/20">
            <SimpleKnowledgeMap knowledgeMap={knowledgeMap} />
          </div>
        </div>
      )}
    </div>
  )
}