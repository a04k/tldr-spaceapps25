"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Network, Download } from 'lucide-react'
import type { KnowledgeMap, KnowledgeNode } from '@/lib/knowledge-mapping'

interface SimpleMapProps {
  knowledgeMap: KnowledgeMap
  onNodeClick?: (node: KnowledgeNode) => void
}

export default function SimpleKnowledgeMap({ knowledgeMap, onNodeClick }: SimpleMapProps) {
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null)
  const [scale, setScale] = useState(1)
  const svgRef = useRef<SVGSVGElement>(null)

  const handleNodeClick = (node: KnowledgeNode) => {
    setSelectedNode(node)
    onNodeClick?.(node)
  }

  const getNodeColor = (type: string, importance: number) => {
    const colors = {
      concept: `hsl(210, 70%, ${Math.max(30, 90 - importance * 10)}%)`,
      method: `hsl(120, 60%, ${Math.max(30, 90 - importance * 10)}%)`,
      finding: `hsl(45, 80%, ${Math.max(30, 90 - importance * 10)}%)`,
      author: `hsl(280, 60%, ${Math.max(30, 90 - importance * 10)}%)`,
      reference: `hsl(0, 50%, ${Math.max(30, 90 - importance * 10)}%)`
    }
    return colors[type as keyof typeof colors] || colors.concept
  }

  const exportMap = () => {
    if (!svgRef.current) return
    
    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${knowledgeMap.title.replace(/\s+/g, '-')}.svg`
    link.click()
    
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">{knowledgeMap.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setScale(s => Math.min(2, s + 0.1))}>
            +
          </Button>
          <Button variant="outline" size="sm" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>
            -
          </Button>
          <Button variant="outline" size="sm" onClick={exportMap}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Map Visualization */}
        <div className="flex-1 relative overflow-hidden">
          <svg
            ref={svgRef}
            className="w-full h-full"
            viewBox="-400 -300 800 600"
            style={{ transform: `scale(${scale})` }}
          >
            {/* Edges */}
            {knowledgeMap.edges.map((edge, i) => {
              const fromNode = knowledgeMap.nodes.find(n => n.id === edge.from)
              const toNode = knowledgeMap.nodes.find(n => n.id === edge.to)
              
              if (!fromNode?.position || !toNode?.position) return null
              
              return (
                <line
                  key={i}
                  x1={fromNode.position.x}
                  y1={fromNode.position.y}
                  x2={toNode.position.x}
                  y2={toNode.position.y}
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={edge.strength * 2}
                  strokeOpacity={0.6}
                  strokeDasharray={edge.type === 'contradicts' ? '5,5' : 'none'}
                />
              )
            })}

            {/* Nodes */}
            {knowledgeMap.nodes.map((node) => {
              if (!node.position) return null
              
              const radius = 20 + (node.importance * 5)
              const isSelected = selectedNode?.id === node.id
              
              return (
                <g key={node.id}>
                  <circle
                    cx={node.position.x}
                    cy={node.position.y}
                    r={radius}
                    fill={getNodeColor(node.type, node.importance)}
                    stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--border))"}
                    strokeWidth={isSelected ? 3 : 1}
                    className="cursor-pointer hover:stroke-primary transition-colors"
                    onClick={() => handleNodeClick(node)}
                  />
                  <text
                    x={node.position.x}
                    y={node.position.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs font-medium fill-white pointer-events-none"
                    style={{ fontSize: Math.max(8, radius / 3) }}
                  >
                    {node.title.slice(0, 8)}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Side Panel */}
        {selectedNode && (
          <div className="w-80 border-l bg-muted/30 p-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{selectedNode.title}</CardTitle>
                  <Badge variant="secondary">{selectedNode.type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Content</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedNode.content}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Importance</h4>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full ${
                            i < selectedNode.importance 
                              ? 'bg-primary' 
                              : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {selectedNode.connections.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Connections</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedNode.connections.map((conn, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {conn}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="p-4 border-t bg-muted/20">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Concept</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Method</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Finding</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span>Author</span>
          </div>
        </div>
      </div>
    </div>
  )
}