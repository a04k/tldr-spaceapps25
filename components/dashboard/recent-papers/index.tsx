"use client"
import { Card } from "@/components/dashboard/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Clock } from "lucide-react"

interface RecentPaper {
  id: string
  title: string
  authors: string[]
  visitedAt: string
  timeAgo: string
}

interface RecentPapersProps {
  papers?: RecentPaper[]
}

export default function RecentPapers({ papers = [] }: RecentPapersProps) {
  return (
    <Card title="RECENTLY VISITED" intent="default">
      <div className="space-y-4">
        {papers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-2">No recent papers</p>
            <p className="text-xs text-muted-foreground/70">
              Papers you visit will appear here
            </p>
          </div>
        ) : (
          papers.slice(0, 5).map((paper, index) => (
            <div
              key={paper.id}
              className={cn(
                "flex items-start gap-4 p-3 rounded-lg transition-colors hover:bg-accent/50 cursor-pointer",
                index === 0 && "bg-accent/20", // Highlight most recent
              )}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-display text-sm">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2 mb-1">{paper.title}</p>
                <p className="text-xs text-muted-foreground mb-2">
                  {paper.authors.slice(0, 2).join(", ")}
                  {paper.authors.length > 2 && ` +${paper.authors.length - 2} more`}
                </p>
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {paper.timeAgo}
                </Badge>
              </div>
            </div>
          ))
        )}
        {papers.length > 5 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              Showing last 5 of {papers.length} recent papers
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
