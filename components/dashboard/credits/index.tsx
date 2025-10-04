"use client"
import { Card } from "@/components/dashboard/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TeamMember {
  id: number
  name: string
  role: string
  initials: string
  specialty: string
}

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Ahmed Khaled",
    role: "Full stack, team lead",
    initials: "AK",
    specialty: "Full-Stack Engineering"
  },
  {
    id: 2,
    name: "Ahmed Elsharkawy",
    role: "AI Expert",
    initials: "AE",
    specialty: "Artificial Intelligence"
  },
  {
    id: 3,
    name: "Alhussien Ahmed",
    role: "Research Expert",
    initials: "AA",
    specialty: "Research & Analysis"
  },
  {
    id: 4,
    name: "Mahmoud Elsharkawy",
    role: "Research Expert",
    initials: "ME",
    specialty: "Research & Analysis"
  },
  {
    id: 5,
    name: "Sandy Adel",
    role: "Storytelling Expert",
    initials: "SA",
    specialty: "Content & Storytelling"
  }
]

export default function Credits() {
  return (
    <Card title="APP CREATORS" intent="success">
      <div className="space-y-5">
        {teamMembers.map((member, index) => (
          <div
            key={member.id}
            className={cn(
              "flex items-center gap-4 p-4 rounded-lg transition-colors hover:bg-accent/50",
              index === 0 && "bg-primary/5 border border-primary/20", // Highlight lead
            )}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted text-muted-foreground font-display text-base font-semibold">
              {index + 1}
            </div>
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/20 text-primary font-semibold text-base">
                {member.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-base font-medium truncate">{member.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{member.specialty}</p>
              {index === 0 && (
                <Badge variant="outline" className="text-xs mt-2 bg-success/10 text-success border-success/20">
                  TEAM LEAD 🚀
                </Badge>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-display uppercase text-primary font-medium">{member.role}</p>
              <p className="text-xs text-muted-foreground mt-1">NASA SPACE APPS</p>
            </div>
          </div>
        ))}
        
        {/* Project Info Section */}
        <div className="pt-4 border-t border-border space-y-4">
          <div className="bg-accent/20 rounded-lg p-4 border border-accent/30">
            <h4 className="text-sm font-display uppercase text-primary mb-2">PROJECT TL;DR</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              An AI-powered research assistant that transforms complex scientific papers into digestible summaries. 
              Making space biology research accessible to everyone, one paper at a time.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary/5 rounded-lg p-3 text-center border border-primary/20">
              <p className="text-lg font-display font-bold text-primary">2025</p>
              <p className="text-xs text-muted-foreground uppercase">Challenge Year</p>
            </div>
            <div className="bg-success/5 rounded-lg p-3 text-center border border-success/20">
              <p className="text-lg font-display font-bold text-success">5</p>
              <p className="text-xs text-muted-foreground uppercase">Team Members</p>
            </div>
          </div>
          
          <p className="text-sm text-center text-muted-foreground">
            Built with ❤️ for NASA Space Apps Challenge 2025
          </p>
        </div>
      </div>
    </Card>
  )
}
