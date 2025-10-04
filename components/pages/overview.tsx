"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BracketsIcon from "@/components/icons/brackets";
import Widget from "@/components/dashboard/widget";
import Credits from "@/components/dashboard/credits";
import JokeWidgets from "@/components/dashboard/joke-widgets";
import { useState, useEffect } from "react";
import type { PaperContext } from "@/types/paper";
import { Brain, Zap, Database, Users, Clock, Rocket, Star, Globe, ArrowUp, Activity } from "lucide-react";

interface RecentPaper {
  id: string;
  title: string;
  authors: string[];
  visitedAt: string;
  timeAgo: string;
}

export default function DashboardOverview() {
  const [recentPapers, setRecentPapers] = useState<RecentPaper[]>([]);

  // Load recent papers from localStorage on mount
  useEffect(() => {
    const loadRecentPapers = () => {
      try {
        const stored = localStorage.getItem("tldr_recent_papers");
        if (stored) {
          const papers = JSON.parse(stored);
          setRecentPapers(papers);
        }
      } catch (error) {
        console.error("Error loading recent papers:", error);
      }
    };

    loadRecentPapers();
  }, []);

  // Listen for paper visits to track recent papers
  useEffect(() => {
    const handlePaperOpened = (event: CustomEvent<PaperContext>) => {
      const paper = event.detail;
      const now = new Date();

      const newPaper: RecentPaper = {
        id: paper.id,
        title: paper.title,
        authors: paper.authors,
        visitedAt: now.toISOString(),
        timeAgo: "Just now",
      };

      setRecentPapers((prev) => {
        // Remove if already exists to avoid duplicates
        const filtered = prev.filter((p) => p.id !== paper.id);
        // Add to front and limit to 10 papers
        const updated = [newPaper, ...filtered].slice(0, 10);

        // Save to localStorage
        try {
          localStorage.setItem("tldr_recent_papers", JSON.stringify(updated));
        } catch (error) {
          console.error("Error saving recent papers:", error);
        }

        return updated;
      });
    };

    window.addEventListener(
      "paperOpened",
      handlePaperOpened as unknown as EventListener,
    );
    return () => {
      window.removeEventListener(
        "paperOpened",
        handlePaperOpened as unknown as EventListener,
      );
    };
  }, []);

  // Update time ago for recent papers
  useEffect(() => {
    const updateTimeAgo = () => {
      setRecentPapers((prev) =>
        prev.map((paper) => ({
          ...paper,
          timeAgo: getTimeAgo(paper.visitedAt),
        })),
      );
    };

    const interval = setInterval(updateTimeAgo, 60000); // Update every minute
    updateTimeAgo(); // Initial update

    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = (visitedAt: string) => {
    const now = new Date();
    const visited = new Date(visitedAt);
    const diffInMinutes = Math.floor(
      (now.getTime() - visited.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Content */}
      <div>
        {/* Compact Hero */}
        <div className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary shadow-lg">
                  <BracketsIcon className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground">
                    TL;DR DASHBOARD
                  </h1>
                  <p className="text-muted-foreground mt-1">Making research digestible since 2025</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-600 font-medium">All Systems Online</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Bento Grid Layout */}
          <div className="grid grid-cols-12 gap-4 min-h-[calc(100vh-200px)]">
            
            {/* Time Widget - Prominent */}
            <div className="w-full lg:col-span-12 h-48">
              <Widget
                widgetData={{
                  location: "Cairo, Egypt",
                  timezone: "UTC+2",
                  temperature: "25°C",
                  weather: "Sunny",
                  date: new Date().toLocaleDateString(),
                }}
              />
            </div>

          

            {/* Wide Stats Widget */}
            <div className="col-span-12 h-32">
              <Card className="h-full border-primary/20 group hover:scale-[1.02] transition-transform duration-300 shadow-lg">
                <CardContent className="p-6 h-full flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="p-4 rounded-xl bg-primary/10">
                      <Database className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-primary text-lg font-medium uppercase tracking-wide">Research Database</p>
                      <div className="flex items-baseline gap-4 mt-2">
                        <div>
                          <span className="text-4xl font-bold text-foreground">608</span>
                          <span className="text-muted-foreground ml-2">Summarized Papers</span>
                        </div>
                        <div className="text-muted-foreground">•</div>
                        <div>
                          <span className="text-2xl font-bold text-foreground">2000+</span>
                          <span className="text-muted-foreground ml-2">Papers in RAG</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                      Growing Daily
                    </Badge>
                    <p className="text-xs text-muted-foreground">Ready for AI analysis</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="col-span-12 lg:col-span-6">
              <Card className="h-full bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-900/60 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    App Creators
                    <Badge variant="outline" className="text-green-400 border-green-400/30 bg-green-400/10 ml-auto">
                      Active
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <Credits />
                </CardContent>
              </Card>
            </div>

            <div className="col-span-12 lg:col-span-6">
              <Card className="h-full bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-900/60 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-400" />
                    Fun Widgets
                    <div className="flex items-center gap-2 ml-auto">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-sm text-green-400 font-medium">Active</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <JokeWidgets />
                </CardContent>
              </Card>
            </div>

          </div>

          {/* Bottom Feature Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="group bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 hover:scale-105 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="p-3 rounded-xl bg-orange-500/30 group-hover:bg-orange-500/40 transition-colors w-fit mx-auto mb-4">
                  <Zap className="h-6 w-6 text-orange-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Lightning Fast</h4>
                <p className="text-slate-400 text-sm">Get research summaries in seconds</p>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30 hover:scale-105 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="p-3 rounded-xl bg-pink-500/30 group-hover:bg-pink-500/40 transition-colors w-fit mx-auto mb-4">
                  <Brain className="h-6 w-6 text-pink-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">AI Powered</h4>
                <p className="text-slate-400 text-sm">Advanced algorithms understand research</p>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border-teal-500/30 hover:scale-105 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="p-3 rounded-xl bg-teal-500/30 group-hover:bg-teal-500/40 transition-colors w-fit mx-auto mb-4">
                  <Globe className="h-6 w-6 text-teal-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Global Access</h4>
                <p className="text-slate-400 text-sm">Millions of papers worldwide</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
