"use client"
import { Card } from "@/components/dashboard/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { ResearchActivity } from "@/types/dashboard"

interface ResearchActivityProps {
  activity: ResearchActivity[]
}

export default function ResearchActivityComponent({ activity }: ResearchActivityProps) {
  return (
    <Card title="TOP CITED PAPERS" description="Most referenced in your collection">
      <div className="space-y-4">
        {activity.map((paper, index) => (
          <div
            key={paper.id}
            className={cn(
              "flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-accent/50",
              paper.featured && "bg-primary/5 border border-primary/20",
            )}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-display text-sm">
              {index + 1}
            </div>
            <Avatar className="h-10 w-10">
              <AvatarImage src={paper.avatar || "/placeholder.svg"} alt={paper.author} />
              <AvatarFallback>{paper.author.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{paper.title}</p>
              <p className="text-xs text-muted-foreground">{paper.author}</p>
              {paper.subtitle && <p className="text-xs text-primary mt-1">{paper.subtitle}</p>}
            </div>
            <div className="text-right">
              <p className="text-lg font-display">{paper.citations}</p>
              <p className="text-xs text-muted-foreground uppercase">Citations</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
