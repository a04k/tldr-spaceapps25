"use client";
import { Card } from "@/components/dashboard/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BookOpen, Coffee, Zap, Brain } from "lucide-react";
import { useState, useEffect } from "react";

interface JokeWidget {
  id: number;
  title: string;
  content: string;
  punchline?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const jokes: JokeWidget[] = [
  {
    id: 1,
    title: "RESEARCH STATUS",
    content: "Papers read today: 0",
    punchline: "Papers TL;DR'd: 47 📚",
    icon: BookOpen,
    color: "text-primary",
  },
  {
    id: 2,
    title: "ATTENTION SPAN",
    content: "Abstract: Too long",
    punchline: "Conclusion: Perfect! ✨",
    icon: Zap,
    color: "text-warning",
  },
  {
    id: 3,
    title: "SCIENTIFIC METHOD",
    content: "Step 1: Find paper",
    punchline: 'Step 2: Ctrl+F "conclusion" 🔍',
    icon: Brain,
    color: "text-success",
  },
  {
    id: 4,
    title: "PRODUCTIVITY HACK",
    content: "Read 300-page paper",
    punchline: "Or ask AI to summarize it 🤖",
    icon: Coffee,
    color: "text-destructive",
  },
];

const funFacts = [
  "💡 Fun fact: The average researcher spends 2.5 hours finding the right paper and 5 minutes reading it",
  "📊 Statistics show: 73% of citations come from reading just the abstract",
  '⚡ Life hack: Ctrl+F "however" to find where the real findings start',
  "🎯 Pro tip: The conclusion is just the abstract with different words",
  "🚀 Advanced move: Reading the figures and calling it a day",
];

export default function JokeWidgets() {
  const [currentJoke, setCurrentJoke] = useState(0);
  const [currentFact, setCurrentFact] = useState(0);

  useEffect(() => {
    const jokeTimer = setInterval(() => {
      setCurrentJoke((prev) => (prev + 1) % jokes.length);
    }, 8000); // Change joke every 8 seconds

    const factTimer = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % funFacts.length);
    }, 12000); // Change fun fact every 12 seconds

    return () => {
      clearInterval(jokeTimer);
      clearInterval(factTimer);
    };
  }, []);

  const joke = jokes[currentJoke];
  const IconComponent = joke.icon;

  return (
    <div className="space-y-6">
      {/* Top: Who Are We Widget - Full Width */}
      <Card title="WHO ARE WE?" intent="success">
        <div className="space-y-4">
          <div className="p-6 rounded-lg bg-gradient-to-r from-primary/5 via-success/5 to-warning/5 border border-primary/20">
            <h3 className="text-lg font-display uppercase mb-4 text-primary">
              THE TL;DR TEAM 🚀
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium mb-2">🎯 Our Mission:</p>
                <p className="text-muted-foreground">
                  Making research digestible, one summary at a time. Because
                  life's too short for 50-page papers!
                </p>
              </div>
              <div>
                <p className="font-medium mb-2">⚡ Our Superpower:</p>
                <p className="text-muted-foreground">
                  Turning academic jargon into human language faster than you
                  can say "methodology"!
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">
                <span className="font-medium text-primary">
                  Built by researchers, for researchers
                </span>{" "}
                who understand the struggle 💪
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Bottom: Two smaller widgets stacked vertically */}
      <div className="space-y-4">
        {/* Main Joke Widget */}
        <Card title="TL;DR MOOD" intent="default">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 transition-all duration-500">
              <div className={cn("p-3 rounded-full bg-background", joke.color)}>
                <IconComponent className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-display uppercase text-muted-foreground mb-1">
                  {joke.title}
                </p>
                <p className="text-base font-medium mb-2">{joke.content}</p>
                {joke.punchline && (
                  <p className="text-sm text-primary font-medium">
                    {joke.punchline}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-center space-x-2">
              {jokes.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    index === currentJoke ? "bg-primary" : "bg-muted",
                  )}
                />
              ))}
            </div>
          </div>
        </Card>

        {/* Fun Facts Widget */}
        <Card title="RESEARCH REALITY" intent="default">
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-accent/20 border border-accent/30 min-h-[100px] flex items-center">
              <p className="text-sm leading-relaxed transition-all duration-500">
                {funFacts[currentFact]}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <Badge variant="outline" className="text-xs">
                REALITY CHECK #{currentFact + 1}
              </Badge>
              <div className="flex space-x-1">
                {funFacts.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-300",
                      index === currentFact ? "bg-primary" : "bg-muted",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
