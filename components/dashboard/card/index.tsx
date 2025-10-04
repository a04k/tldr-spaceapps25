import type React from "react"
import { Card as UICard, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Bullet } from "@/components/ui/bullet"

interface DashboardCardProps extends Omit<React.ComponentProps<typeof UICard>, "title"> {
  title: string
  addon?: React.ReactNode
  intent?: "default" | "success"
  children: React.ReactNode
}

export default function DashboardCard({
  title,
  addon,
  intent = "default",
  children,
  className,
  ...props
}: DashboardCardProps) {
  return (
    <UICard className={className} {...props}>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2.5">
          <Bullet variant={intent} />
          {title}
        </CardTitle>
        {addon && <div>{addon}</div>}
      </CardHeader>

      <CardContent className="flex-1 relative">{children}</CardContent>
    </UICard>
  )
}

export { DashboardCard as Card }
