"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { PaperContext } from "@/types/paper";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface AIContextType {
  // State
  messages: Message[];
  paperContext: PaperContext | null;
  apiKey: string;
  isLoading: boolean;
  input: string;

  // Actions
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setPaperContext: React.Dispatch<React.SetStateAction<PaperContext | null>>;
  setApiKey: React.Dispatch<React.SetStateAction<string>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setInput: React.Dispatch<React.SetStateAction<string>>;

  // Helper functions
  addMessage: (message: Message) => void;
  clearContext: () => void;
  clearMessages: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIContextProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [paperContext, setPaperContext] = useState<PaperContext | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const clearContext = useCallback(() => {
    setPaperContext(null);
    setMessages([]);
    // Dispatch event to notify that context was manually cleared
    const event = new CustomEvent("paperClosed");
    window.dispatchEvent(event);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const value: AIContextType = {
    // State
    messages,
    paperContext,
    apiKey,
    isLoading,
    input,

    // Actions
    setMessages,
    setPaperContext,
    setApiKey,
    setIsLoading,
    setInput,

    // Helper functions
    addMessage,
    clearContext,
    clearMessages,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

export function useAIContext() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error("useAIContext must be used within an AIContextProvider");
  }
  return context;
}
