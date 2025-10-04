"use client"
import { Card } from "@/components/dashboard/card"
import { cn } from "@/lib/utils"
import type { SystemStatusType } from "@/types/dashboard"

interface SystemStatusProps {
  statuses: SystemStatusType[]
}

export default function SystemStatus({ statuses }: SystemStatusProps) {
  return (
    <Card title="SYSTEM STATUS" description="Real-time monitoring">
      <div className="space-y-4">
        {statuses.map((status, index) => (
          <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex-1">
              <p className="text-sm font-display uppercase">{status.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{status.status}</p>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  "text-2xl font-display",
                  status.variant === "success" && "text-success",
                  status.variant === "warning" && "text-warning",
                  status.variant === "destructive" && "text-destructive",
                )}
              >
                {status.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
