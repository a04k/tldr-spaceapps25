"use client";

import React, { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PaperContext } from "@/types/paper";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAIContext } from "./context/ai-context";

export default function AIAssistant() {
  const {
    messages,
    paperContext,
    apiKey,
    isLoading,
    input,
    setMessages,
    setPaperContext,
    setApiKey,
    setIsLoading,
    setInput,
    addMessage,
    clearContext,
  } = useAIContext();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize API key from server-side API route
  useEffect(() => {
    const initializeApiKey = async () => {
      try {
        // Get API key from server-side endpoint
        const response = await fetch('/api/config/gemini-key')
        if (response.ok) {
          const data = await response.json()
          if (data.apiKey) {
            setApiKey(data.apiKey)
          }
        }
      } catch (error) {
        console.warn("Could not fetch Gemini API key from server")
      }
    }
    
    initializeApiKey()
  }, [])

  // Handle paper context events
  useEffect(() => {
    const handlePaperOpened = async (event: CustomEvent<PaperContext>) => {
      const newPaper = event.detail;

      // Clear messages if switching to a different paper (but keep chat open)
      if (paperContext && paperContext.id !== newPaper.id) {
        setMessages([]);
      }

      setPaperContext(newPaper);
      console.log("[AI Assistant] Paper context received:", newPaper);

      // Only add welcome message if we don't already have messages for this paper
      if (!paperContext || paperContext.id !== newPaper.id) {
        const welcomeMessage = {
          id: `msg-${Date.now()}`,
          role: "assistant" as const,
          content: `I now have context about: **"${newPaper.title}"** by ${newPaper.authors.join(", ")}. Ask me anything about this paper!`,
          timestamp: new Date().toISOString(),
        };
        setMessages([welcomeMessage]);
      }
    };

    const handlePaperClosed = () => {
      setPaperContext(null);
      setMessages([]);
      console.log("[AI Assistant] Paper context cleared");
    };

    window.addEventListener(
      "paperOpened",
      handlePaperOpened as unknown as EventListener,
    );
    window.addEventListener("paperClosed", handlePaperClosed as EventListener);
    return () => {
      window.removeEventListener(
        "paperOpened",
        handlePaperOpened as unknown as EventListener,
      );
      window.removeEventListener(
        "paperClosed",
        handlePaperClosed as EventListener,
      );
    };
  }, [paperContext, setPaperContext, setMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "auto",
        block: "nearest",
      });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: "user" as const,
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    addMessage(userMessage);
    setInput("");
    setIsLoading(true);

    if (!apiKey) {
      setTimeout(() => {
        const aiResponse = {
          id: `msg-${Date.now() + 1}`,
          role: "assistant" as const,
          content: "Please configure your Gemini API key in settings.",
          timestamp: new Date().toISOString(),
        };
        addMessage(aiResponse);
        setIsLoading(false);
      }, 500);
      return;
    }

    try {
      let systemPrompt =
        "You are a helpful AI research assistant. Provide clear, well-formatted responses using markdown. ";
      if (paperContext) {
        systemPrompt += `Context: ${paperContext.title} by ${paperContext.authors.join(", ")}.`;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: systemPrompt + "\n\nUser: " + userMessage.content,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            },
          }),
        },
      );

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const aiContent =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't generate a response.";

      const aiResponse = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant" as const,
        content: aiContent,
        timestamp: new Date().toISOString(),
      };
      addMessage(aiResponse);
    } catch (error) {
      console.error("[AI Assistant] API error:", error);
      const errorMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant" as const,
        content:
          "Error connecting to AI. Please check your API key in settings.",
        timestamp: new Date().toISOString(),
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="shrink-0 mb-4">
        <h2 className="text-base font-display uppercase leading-tight">
          AI Assistant
        </h2>
        <p className="text-xs text-muted-foreground mt-1 leading-tight">
          {paperContext
            ? `Discussing: ${paperContext.title.slice(0, 35)}...`
            : "Ask me anything"}
        </p>
      </div>

      {/* Paper Context Badge */}
      {paperContext && (
        <div className="shrink-0 mb-4 p-3 bg-accent/20 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-xs px-2 py-1">
              Context Active
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearContext}
              className="h-6 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
              title="Clear paper context"
            >
              Clear
            </Button>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            <span className="font-medium">{paperContext.title}</span>
          </p>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0 mb-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2 px-2">
              <p className="text-sm text-muted-foreground">
                Start a conversation
              </p>
              <p className="text-xs text-muted-foreground">
                {paperContext
                  ? "Ask about the current paper"
                  : "Open a paper to add context"}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                {/* Message Header */}
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {message.role === "user" ? "U" : "AI"}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {message.role === "user" ? "You" : "Assistant"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Message Content */}
                <div className="ml-8 max-w-full">
                  <div
                    className={cn(
                      "prose prose-sm dark:prose-invert max-w-none break-words",
                      "prose-p:leading-relaxed prose-p:my-2 prose-p:text-sm",
                      "prose-headings:my-2 prose-headings:font-display prose-h1:text-lg prose-h2:text-base prose-h3:text-sm",
                      "prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-li:text-sm",
                      "prose-pre:my-2 prose-pre:bg-background prose-pre:text-foreground prose-pre:text-xs prose-pre:p-2 prose-pre:rounded",
                      "prose-code:text-xs prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none",
                      "prose-strong:font-semibold prose-strong:text-foreground",
                      "prose-em:italic prose-blockquote:border-l-primary prose-blockquote:pl-3 prose-blockquote:my-2",
                      "prose-a:text-primary prose-a:underline prose-a:font-medium hover:prose-a:text-primary/80",
                    )}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium">
                    AI
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    Assistant
                  </span>
                </div>
                <div className="ml-8">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="shrink-0 border-t border-border pt-3">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              paperContext ? "Ask about this paper..." : "Ask a question..."
            }
            className="flex-1 text-sm h-9"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="sm"
            className="h-9 px-3"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
