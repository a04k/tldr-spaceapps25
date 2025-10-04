"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AIResponse } from "@/components/ui/ai-response"
import { X, MessageSquare, Plus, Send, Sparkles, Brain, Search, Trash2, Copy, Volume2, ChevronLeft, ChevronRight, GraduationCap, Briefcase, FlaskConical, Settings, Play, Video } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"
import type { PaperContext } from "@/types/paper"



interface FullScreenChatProps {
  isOpen: boolean
  onClose: () => void
}

export default function FullScreenChat({ isOpen, onClose }: FullScreenChatProps) {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeConversationId, setActiveConversationId] = useState<Id<"conversations"> | null>(null)
  const [showHistory, setShowHistory] = useState(true)
  const [contextMenu, setContextMenu] = useState<{
    show: boolean
    x: number
    y: number
    conversationId: Id<"conversations"> | null
  }>({ show: false, x: 0, y: 0, conversationId: null })

  const [userType, setUserType] = useState<'business' | 'student' | 'researcher'>('researcher')
  const [paperContext, setPaperContext] = useState<PaperContext | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [voiceLanguage, setVoiceLanguage] = useState('en')
  const [isFirstTime, setIsFirstTime] = useState(true)
  const [showUserTypeModal, setShowUserTypeModal] = useState(false)
  const [isPlayingVoice, setIsPlayingVoice] = useState(false)
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Client-side only state
  const [isClient, setIsClient] = useState(false)

  // Convex queries and mutations - only run on client
  const conversations = useQuery(api.conversations.list, isClient ? {} : "skip")
  const messages = useQuery(
    api.conversations.getMessages,
    isClient && activeConversationId ? { conversationId: activeConversationId } : "skip"
  )
  const createConversation = useMutation(api.conversations.create)
  const addMessage = useMutation(api.conversations.addMessage)
  const updateTitle = useMutation(api.conversations.updateTitle)
  const deleteConversation = useMutation(api.conversations.deleteConversation)

  // Set client-side flag after hydration and load settings
  useEffect(() => {
    setIsClient(true)

    // Load user preferences from localStorage
    const savedUserType = localStorage.getItem('tldr-user-type') as 'business' | 'student' | 'researcher' | null
    const savedVoiceLanguage = localStorage.getItem('tldr-voice-language') || 'en'

    if (savedUserType) {
      setUserType(savedUserType)
      setIsFirstTime(false)
    } else {
      setIsFirstTime(true)
      setShowUserTypeModal(true)
    }

    setVoiceLanguage(savedVoiceLanguage)
  }, [])

  // Handle paper context events
  useEffect(() => {
    const handlePaperOpened = (event: CustomEvent<PaperContext>) => {
      const paper = event.detail
      setPaperContext(paper)
      console.log("[FullScreen Chat] Paper context received:", paper)
    }

    const handlePaperClosed = () => {
      setPaperContext(null)
      console.log("[FullScreen Chat] Paper context cleared")
    }

    window.addEventListener(
      "paperOpened",
      handlePaperOpened as unknown as EventListener,
    )
    window.addEventListener("paperClosed", handlePaperClosed as EventListener)

    return () => {
      window.removeEventListener(
        "paperOpened",
        handlePaperOpened as unknown as EventListener,
      )
      window.removeEventListener("paperClosed", handlePaperClosed as EventListener)
    }
  }, [])

  // Sample suggested questions
  const suggestedQuestions = [
    "What are the latest trends in space biology research?",
    "How does microgravity affect plant growth?",
    "Explain the challenges of long-term space missions",
    "What are the applications of astrobiology?",
    "How do we study extremophiles for space research?",
    "What is the role of AI in space exploration?"
  ]

  // Auto-select the most recent conversation on load
  useEffect(() => {
    if (conversations && conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0]._id)
    }
  }, [conversations, activeConversationId])

  useEffect(() => {
    // Auto-scroll to bottom
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userContent = input.trim()
    setInput("")
    setIsLoading(true)

    try {
      // Create new conversation if none active
      let conversationId = activeConversationId
      if (!conversationId) {
        conversationId = await createConversation({ title: "New Conversation" })
        setActiveConversationId(conversationId)
      }

      // Add user message to Convex
      await addMessage({
        conversationId,
        role: "user",
        content: userContent,
      })

      // Update conversation title if this is the first message
      if (!messages || messages.length === 0) {
        await updateTitle({
          conversationId,
          title: userContent.slice(0, 50) + (userContent.length > 50 ? "..." : ""),
        })
      }

      // Create context-aware prompt based on user type
      const getUserTypeContext = (type: string) => {
        switch (type) {
          case 'business':
            return "Instruction : DO NOT REFRENCE PAPERS / OR SEND REFRENCES , You are responding to a business professional. Focus on practical applications, commercial viability, market implications, and business opportunities & ideas. Use clear, professional language and emphasize ROI, scalability, and real-world implementation, without being too scientific as the user isn't nerdy. "
          case 'student':
            return "You are responding to a student. Provide educational explanations, break down complex concepts into understandable parts, include learning objectives, and suggest further reading or study areas. Use encouraging and supportive language."
          case 'researcher':
            return "You are responding to a researcher. Provide detailed scientific information, cite recent studies, discuss methodologies, highlight research gaps, and suggest potential research directions. Use precise scientific terminology and focus on evidence-based information."
          default:
            return ""
        }
      }

      // Create context-aware prompt that includes paper context if available
      let contextualPrompt = getUserTypeContext(userType)

      if (paperContext) {
        contextualPrompt += `\n\nPaper Context: I'm currently discussing the research paper "${paperContext.title}" by ${paperContext.authors.join(", ")}.\n\nPaper Abstract: ${paperContext.abstract}\n\nPaper Content: ${paperContext.fullContent ? paperContext.fullContent.substring(0, 2000) + '...' : 'Not available'}\n\n`
      }

      contextualPrompt += `User question: ${userContent}`

      console.log('🔍 Calling TL;DR Chat API')
      console.log('📝 Request prompt length:', contextualPrompt.length)

      // Call through Next.js API route to avoid CORS issues
      const response = await fetch('/api/tldr-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: contextualPrompt
        })
      })

      console.log('📡 TL;DR API Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ TL;DR API Error Response:', errorText)
        throw new Error(`TL;DR API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      const aiContent = data.response || "Sorry, I couldn't generate a response."
      console.log('✅ Response length:', aiContent.length, 'characters')
      console.log('📋 Response preview:', aiContent.substring(0, 200) + '...')

      // Add AI response to Convex
      await addMessage({
        conversationId,
        role: "assistant",
        content: aiContent,
      })

    } catch (error) {
      console.error("AI API error:", error)

      let errorMessage = "I'm sorry, I encountered an error while processing your request. Please try again."

      // Provide more specific error messages based on the error type
      if (error instanceof Error) {
        if (error.message.includes('503')) {
          errorMessage = "The AI service is temporarily unavailable. Please try again in a moment."
        } else if (error.message.includes('timeout')) {
          errorMessage = "The request timed out. Please try with a shorter question or try again later."
        } else if (error.message.includes('500')) {
          errorMessage = "There was a server error. Please try again or contact support if the issue persists."
        }
      }

      // Add error message to Convex if we have a conversation
      if (activeConversationId) {
        await addMessage({
          conversationId: activeConversationId,
          role: "assistant",
          content: errorMessage,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
  }

  const createNewConversation = async () => {
    const conversationId = await createConversation({ title: "New Conversation" })
    setActiveConversationId(conversationId)
  }

  const selectConversation = (conversationId: Id<"conversations">) => {
    setActiveConversationId(conversationId)
  }



  const handleRightClick = (e: React.MouseEvent, conversationId: Id<"conversations">) => {
    e.preventDefault()
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      conversationId
    })
  }

  const handleDeleteConversation = async () => {
    if (contextMenu.conversationId) {
      await deleteConversation({ conversationId: contextMenu.conversationId })

      // If we deleted the active conversation, clear the selection
      if (activeConversationId === contextMenu.conversationId) {
        setActiveConversationId(null)
      }
    }
    setContextMenu({ show: false, x: 0, y: 0, conversationId: null })
  }



  // Handle user type selection and save to localStorage
  const handleUserTypeSelect = (type: 'business' | 'student' | 'researcher') => {
    setUserType(type)
    localStorage.setItem('tldr-user-type', type)
    setShowUserTypeModal(false)
    setIsFirstTime(false)
  }

  // Handle settings save
  const handleSettingsSave = (newUserType: 'business' | 'student' | 'researcher', newVoiceLanguage: string) => {
    setUserType(newUserType)
    setVoiceLanguage(newVoiceLanguage)
    localStorage.setItem('tldr-user-type', newUserType)
    localStorage.setItem('tldr-voice-language', newVoiceLanguage)
    setShowSettings(false)
  }

  // Handle copy message
  const handleCopyMessageAction = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  // Handle voice summary
  const handleVoiceSummary = async (content: string) => {
    setIsPlayingVoice(true)
    try {
      const voiceName = voiceLanguage === 'en' ? 'en-GB-Standard-A' :
        voiceLanguage === 'ar' ? 'ar-XA-Standard-A' :
          voiceLanguage === 'fr' ? 'fr-FR-Standard-A' :
            'en-GB-Standard-A'

      const response = await fetch('/api/voice-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_text: content,
          language: voiceLanguage,
          voice_name: voiceName
        })
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)

        audio.onended = () => setIsPlayingVoice(false)
        audio.onerror = () => setIsPlayingVoice(false)

        await audio.play()
      }
    } catch (error) {
      console.error('Voice summary error:', error)
      setIsPlayingVoice(false)
    }
  }

  // Handle generate video
  const handleGenerateVideo = async () => {
    setIsGeneratingVideo(true)
    setShowVideoModal(true)

    setTimeout(() => {
      setIsGeneratingVideo(false)
    }, 4000)
  }

  // Close context menus when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu({ show: false, x: 0, y: 0, conversationId: null })
    }

    if (contextMenu.show) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [contextMenu.show])

  // Don't render anything during SSR or if not open
  if (!isOpen || !isClient) return null

  return (
    <div className="fixed inset-0 z-50 bg-background flex">
      {/* Conversation History Sidebar */}
      {showHistory && (
        <div className="w-64 border-r border-border flex flex-col bg-background">
          <div className="p-3 border-b border-border">
            <Button onClick={createNewConversation} className="w-full gap-2 mb-3 h-10">
              <Plus className="h-4 w-4" />
              New chat
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2">
              {/* Group conversations by date */}
              {(() => {
                if (!conversations || conversations.length === 0) {
                  return (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      No conversations yet.
                      <br />Start a new chat!
                    </div>
                  )
                }

                // Group conversations by date
                const groupedConversations = conversations.reduce((groups: Record<string, typeof conversations>, conv) => {
                  const date = new Date(conv.createdAt)
                  const today = new Date()
                  const yesterday = new Date(today)
                  yesterday.setDate(yesterday.getDate() - 1)

                  let dateKey: string
                  if (date.toDateString() === today.toDateString()) {
                    dateKey = 'Today'
                  } else if (date.toDateString() === yesterday.toDateString()) {
                    dateKey = 'Yesterday'
                  } else if (date.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) {
                    dateKey = 'Previous 7 days'
                  } else {
                    dateKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  }

                  if (!groups[dateKey]) {
                    groups[dateKey] = []
                  }
                  groups[dateKey].push(conv)
                  return groups
                }, {} as Record<string, typeof conversations>)

                return Object.entries(groupedConversations).map(([dateGroup, convs]: [string, any]) => (
                  <div key={dateGroup} className="mb-4">
                    <h3 className="text-xs font-medium text-muted-foreground px-2 py-1 mb-1">
                      {dateGroup}
                    </h3>
                    <div className="space-y-1">
                      {convs.map((conv: any) => (
                        <button
                          key={conv._id}
                          onClick={() => selectConversation(conv._id)}
                          onContextMenu={(e) => handleRightClick(e, conv._id)}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors group relative overflow-hidden",
                            activeConversationId === conv._id
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <div className="flex items-center gap-2 w-full min-w-0">
                            <MessageSquare className="h-3 w-3 shrink-0 opacity-70" />
                            <div className="flex-1 min-w-0 overflow-hidden">
                              <p className="truncate text-sm leading-5">
                                {conv.title}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              })()}
            </div>
          </ScrollArea>

          {/* Settings and Collapse Buttons */}
          <div className="p-2 border-t border-border space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground h-8"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(false)}
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground h-8"
            >
              <ChevronLeft className="h-4 w-4" />
              Close sidebar
            </Button>
          </div>
        </div>
      )}

      {/* Expand Button (when sidebar is collapsed) - Small arrow on far left, vertically centered */}
      {!showHistory && (
        <div className="fixed left-0 top-1/2 -translate-y-1/2 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(true)}
            className="h-12 w-8 p-0 rounded-r-lg rounded-l-none border-l-0 bg-background/95 backdrop-blur-sm shadow-lg"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Main Chat Area with Reference Panel */}
      <div className="flex-1 flex">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col">
          {/* Header with User Type Selector */}
          <div className="border-b border-border bg-background/95 backdrop-blur-sm">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-xl font-display uppercase tracking-wide">
                        {userType === 'business' ? 'TS;SDR' : 'TL;DR AI'}
                      </h1>
                      <p className="text-sm text-muted-foreground">
                        {userType === 'business'
                          ? (paperContext ? `Discussing: ${paperContext.title.slice(0, 40)}...` : "Your investment assistant for all things science and tech")
                          : (paperContext ? `Discussing: ${paperContext.title.slice(0, 40)}...` : "Research Assistant")
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col h-[calc(100vh-80px)]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto">
              <div
                className="w-full py-4 transition-all duration-200"
                style={{
                  marginLeft: showHistory ? '-64px' : '0',
                  paddingLeft: showHistory ? '64px' : '0'
                }}
              >
                {!messages || messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center space-y-8">
                    <div className="space-y-4">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <Sparkles className="h-10 w-10 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-display uppercase mb-2">Ask TL;DR AI</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl">
                          Get instant answers about space biology, research papers, and scientific concepts
                        </p>
                      </div>
                    </div>

                    {/* Suggested Questions */}
                    <div className="w-full max-w-3xl space-y-4">
                      <h3 className="text-sm font-display uppercase text-muted-foreground text-center">
                        Try asking about:
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {suggestedQuestions.map((question, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestedQuestion(question)}
                            className="p-4 text-left rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 group"
                          >
                            <div className="flex items-start gap-3">
                              <Search className="h-4 w-4 text-muted-foreground group-hover:text-primary mt-1 flex-shrink-0" />
                              <p className="text-sm text-foreground group-hover:text-primary transition-colors">
                                {question}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-5xl mx-auto px-4">
                    {messages.map((message: any) => (
                      <div
                        key={message._id || `${message.timestamp}-${message.role}`}
                        className={cn(
                          "group py-4 px-6 border-b border-border/30 hover:bg-muted/10 transition-colors",
                          message.role === "assistant" ? "bg-muted/5" : ""
                        )}
                      >
                        <div className="flex gap-4 max-w-none">
                          {/* Avatar */}
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                            message.role === "assistant"
                              ? "bg-primary text-primary-foreground"
                              : "bg-blue-600 text-white"
                          )}>
                            {message.role === "assistant" ? (
                              <Brain className="h-4 w-4" />
                            ) : (
                              <span className="text-xs font-semibold">U</span>
                            )}
                          </div>

                          {/* Message Content */}
                          <div className="flex-1 min-w-0 space-y-2">
                            {/* Message Header */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">
                                {message.role === "assistant" ? "TL;DR AI" : "You"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(message.timestamp).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>

                            {/* Message Content */}
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              {message.role === "user" ? (
                                <p className="text-foreground leading-relaxed whitespace-pre-wrap m-0">
                                  {message.content}
                                </p>
                              ) : (
                                <AIResponse
                                  content={message.content}
                                />
                              )}
                            </div>

                            {/* Message Action Buttons - Only for AI messages */}
                            {message.role === "assistant" && (
                              <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyMessageAction(message.content)}
                                  className="h-8 px-3 text-xs"
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleVoiceSummary(message.content)}
                                  className="h-8 px-3 text-xs"
                                  disabled={isPlayingVoice}
                                >
                                  {isPlayingVoice ? (
                                    <>
                                      <div className="w-3 h-3 mr-1 rounded-full bg-primary animate-pulse" />
                                      Playing...
                                    </>
                                  ) : (
                                    <>
                                      <Volume2 className="h-3 w-3 mr-1" />
                                      Read Summary
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleGenerateVideo}
                                  className="h-8 px-3 text-xs"
                                >
                                  <Video className="h-3 w-3 mr-1" />
                                  Generate Video
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="group py-6 px-4 border-b border-border/50 bg-muted/10">
                        <div className="flex gap-4 max-w-none">
                          {/* Avatar */}
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                            <Brain className="h-4 w-4 animate-pulse" />
                          </div>

                          {/* Loading Content */}
                          <div className="flex-1 min-w-0 space-y-2">
                            {/* Message Header */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">TL;DR AI</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date().toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>

                            {/* Loading Animation */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="flex gap-1">
                                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  Searching for the latest research...
                                </span>
                              </div>

                              {/* Simulated loading content */}
                              <div className="space-y-2">
                                <div className="h-3 bg-muted/50 rounded animate-pulse w-3/4" />
                                <div className="h-3 bg-muted/50 rounded animate-pulse w-1/2" />
                                <div className="h-3 bg-muted/50 rounded animate-pulse w-2/3" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>

AI            <div className="border-t border-border bg-background/95 backdrop-blur-sm">
              <div className="px-6 py-4">
                <div className="max-w-4xl mx-auto">
                  <div className="relative">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about space biology, research papers, or any scientific topic..."
                      className="pr-12 h-12 text-base bg-background border-2 border-border focus:border-primary/50 rounded-lg"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSend}
                      disabled={isLoading || !input.trim()}
                      size="sm"
                      className="absolute right-2 top-2 h-8 w-8 p-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Press Enter to send • Shift+Enter for new line
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Context Menu for Conversations */}
          {contextMenu.show && (
            <div
              className="fixed z-[60] bg-background border border-border rounded-lg shadow-lg py-1 min-w-[120px]"
              style={{
                left: contextMenu.x,
                top: contextMenu.y,
              }}
            >
              <button
                onClick={handleDeleteConversation}
                className="w-full px-3 py-2 text-left text-sm hover:bg-destructive hover:text-destructive-foreground transition-colors flex items-center gap-2"
              >
                <Trash2 className="h-3 w-3" />
                Delete Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* First Time User Type Selection Modal */}
      <Dialog open={showUserTypeModal} onOpenChange={setShowUserTypeModal}>
        <DialogContent className="sm:max-w-lg bg-gradient-to-br from-background via-background to-primary/5 border-primary/20">
          <DialogHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-display uppercase tracking-wide">
                Welcome to TL;DR AI
              </DialogTitle>
              <p className="text-muted-foreground mt-2">
                Let's personalize your experience. What best describes you?
              </p>
            </div>
          </DialogHeader>
          <div className="space-y-4 mt-6">
            <div className="space-y-3">
              <div
                onClick={() => handleUserTypeSelect('researcher')}
                className="group relative p-4 rounded-xl border-2 border-border hover:border-primary/50 bg-gradient-to-r from-background to-primary/5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <FlaskConical className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Researcher</h3>
                    <p className="text-sm text-muted-foreground">
                      Get detailed scientific information and evidence-based responses
                    </p>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 group-hover:border-primary transition-colors" />
                </div>
              </div>

              <div
                onClick={() => handleUserTypeSelect('student')}
                className="group relative p-4 rounded-xl border-2 border-border hover:border-primary/50 bg-gradient-to-r from-background to-green-500/5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                    <GraduationCap className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Student</h3>
                    <p className="text-sm text-muted-foreground">
                      Learn with clear explanations and educational guidance
                    </p>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 group-hover:border-primary transition-colors" />
                </div>
              </div>

              <div
                onClick={() => handleUserTypeSelect('business')}
                className="group relative p-4 rounded-xl border-2 border-border hover:border-primary/50 bg-gradient-to-r from-background to-orange-500/5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                    <Briefcase className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Business Professional</h3>
                    <p className="text-sm text-muted-foreground">
                      Focus on opportunities, market insights, and practical applications
                    </p>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 group-hover:border-primary transition-colors" />
                </div>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground mt-6">
              You can change this anytime in settings
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-display">Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-8">
            {/* User Type Selection */}
            <div className="space-y-4">
              <label className="text-sm font-medium">User Type</label>
              <div className="space-y-3">
                <div
                  onClick={() => setUserType('researcher')}
                  className={cn(
                    "group relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md",
                    userType === 'researcher'
                      ? "border-blue-500 bg-blue-500/5"
                      : "border-border hover:border-blue-500/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <FlaskConical className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Researcher</h3>
                      <p className="text-xs text-muted-foreground">Detailed scientific information</p>
                    </div>
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      userType === 'researcher'
                        ? "border-blue-500 bg-blue-500"
                        : "border-muted-foreground/30"
                    )}>
                      {userType === 'researcher' && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setUserType('student')}
                  className={cn(
                    "group relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md",
                    userType === 'student'
                      ? "border-green-500 bg-green-500/5"
                      : "border-border hover:border-green-500/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <GraduationCap className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Student</h3>
                      <p className="text-xs text-muted-foreground">Educational explanations</p>
                    </div>
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      userType === 'student'
                        ? "border-green-500 bg-green-500"
                        : "border-muted-foreground/30"
                    )}>
                      {userType === 'student' && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setUserType('business')}
                  className={cn(
                    "group relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md",
                    userType === 'business'
                      ? "border-orange-500 bg-orange-500/5"
                      : "border-border hover:border-orange-500/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Business Professional</h3>
                      <p className="text-xs text-muted-foreground">Market insights & ROI</p>
                    </div>
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      userType === 'business'
                        ? "border-orange-500 bg-orange-500"
                        : "border-muted-foreground/30"
                    )}>
                      {userType === 'business' && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Voice Language Selection */}
            <div className="space-y-4">
              <label className="text-sm font-medium">Voice Summary Language</label>
              <div className="grid grid-cols-3 gap-3">
                <div
                  onClick={() => setVoiceLanguage('en')}
                  className={cn(
                    "p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 text-center hover:shadow-md",
                    voiceLanguage === 'en'
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="text-lg mb-1">🇬🇧</div>
                  <div className="text-sm font-medium">English</div>
                </div>

                <div
                  onClick={() => setVoiceLanguage('ar')}
                  className={cn(
                    "p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 text-center hover:shadow-md",
                    voiceLanguage === 'ar'
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="text-lg mb-1">🇸🇦</div>
                  <div className="text-sm font-medium">Arabic</div>
                </div>

                <div
                  onClick={() => setVoiceLanguage('fr')}
                  className={cn(
                    "p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 text-center hover:shadow-md",
                    voiceLanguage === 'fr'
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="text-lg mb-1">🇫🇷</div>
                  <div className="text-sm font-medium">French</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleSettingsSave(userType, voiceLanguage)}>
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Modal */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Generated Video
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
              {isGeneratingVideo ? (
                <div className="flex flex-col items-center gap-4 text-white">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    <Video className="absolute inset-0 m-auto h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium">Generating Video...</p>
                    <p className="text-sm text-white/70">This may take a few moments</p>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-white animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              ) : (
                <video
                  controls
                  className="w-full h-full rounded-lg"
                  preload="metadata"
                >
                  <source src="/videos/placeholder-demo.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
            {!isGeneratingVideo && (
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-primary mb-1">Video Generated!</h4>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3">
              {!isGeneratingVideo && (
                <Button variant="outline" onClick={() => setShowVideoModal(false)}>
                  Download
                </Button>
              )}
              <Button onClick={() => setShowVideoModal(false)}>
                {isGeneratingVideo ? 'Cancel' : 'Close'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
