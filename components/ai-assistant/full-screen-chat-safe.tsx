"use client"

import React, { useState, useEffect } from "react"
import dynamic from "next/dynamic"

// Dynamically import the actual chat component to prevent SSR issues
const FullScreenChatComponent = dynamic(() => import("./full-screen-chat"), {
  ssr: false,
  loading: () => null
})

interface FullScreenChatSafeProps {
  isOpen: boolean
  onClose: () => void
}

export default function FullScreenChatSafe({ isOpen, onClose }: FullScreenChatSafeProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Don't render anything if not on client or chat is not open
  if (!isClient || !isOpen) {
    return null
  }

  return <FullScreenChatComponent isOpen={isOpen} onClose={onClose} />
}