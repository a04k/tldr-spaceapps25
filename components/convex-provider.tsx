"use client"

import { ConvexProvider, ConvexReactClient } from "convex/react"
import type { ReactNode } from "react"
import { useEffect, useState } from "react"

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [convexClient, setConvexClient] = useState<ConvexReactClient | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch Convex URL from server-side API
    const initializeConvex = async () => {
      try {
        const response = await fetch('/api/config/convex-url')
        if (response.ok) {
          const data = await response.json()
          if (data.convexUrl) {
            const client = new ConvexReactClient(data.convexUrl)
            setConvexClient(client)
            console.log("Convex client initialized with URL:", data.convexUrl)
          }
        }
      } catch (error) {
        console.error("Failed to initialize Convex client:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    initializeConvex()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!convexClient) {
    console.warn("No Convex client available, rendering children without ConvexProvider")
    return <>{children}</>
  }

  return <ConvexProvider client={convexClient}>{children}</ConvexProvider>
}
