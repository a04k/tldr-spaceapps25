"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/dashboard/card"
import { Paper } from "@/types/paper"

interface PaperSearchProps {
  onPaperSelect?: (paper: Paper) => void;
  onSearchChange?: (query: string) => void;
}

export default function PaperSearch({ onPaperSelect, onSearchChange }: PaperSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Notify parent of search changes with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearchChange?.(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, onSearchChange]);

  return (
    <Card title="SEARCH PAPERS" description="Find research papers in the database">
      <div className="space-y-4">
        <div className="flex gap-3">
          <Input
            type="text"
            placeholder="Search by title, author, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 h-12 text-base"
          />
        </div>
      </div>
    </Card>
  )
}
