"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  IconRobot,
  IconX,
  IconMicrophone,
  IconMicrophoneOff,
  IconSend,
  IconSparkles,
  IconBulb,
  IconChartBar,
  IconWallet,
  IconAlertTriangle,
  IconTrendingUp,
  IconLoader2,
} from "@tabler/icons-react"

interface Message {
  id: number
  type: "user" | "ai"
  content: string
  timestamp: Date
}

interface Suggestion {
  icon: React.ReactNode
  title: string
  description: string
  action: string
}

const quickSuggestions: Suggestion[] = [
  {
    icon: <IconChartBar className="h-4 w-4" />,
    title: "Spending Analysis",
    description: "Analyze my spending patterns",
    action: "Analyze my spending patterns this month"
  },
  {
    icon: <IconWallet className="h-4 w-4" />,
    title: "Budget Tips",
    description: "Get personalized budget advice",
    action: "Give me tips to reduce my expenses"
  },
  {
    icon: <IconTrendingUp className="h-4 w-4" />,
    title: "Savings Goals",
    description: "Help me save more money",
    action: "How can I save more money?"
  },
  {
    icon: <IconAlertTriangle className="h-4 w-4" />,
    title: "Unusual Spending",
    description: "Detect anomalies in expenses",
    action: "Are there any unusual expenses?"
  },
]

const aiResponses: Record<string, string> = {
  "analyze": "Based on your spending data, I can see that **Food & Dining** is your largest expense category at $245 this month. That's 35% of your total spending. Consider meal prepping to reduce this by up to 40%.",
  "tips": "Here are 3 personalized tips:\n\n1. **Switch to UPI** - You're paying $12/month in card fees\n2. **Cancel unused subscriptions** - I found 2 potential candidates\n3. **Set spending alerts** - Enable notifications when you exceed 80% of budget",
  "save": "Based on your income of $3,500 and expenses of $1,200, you could save **$2,300/month**. I recommend the 50/30/20 rule:\n\n- 50% Needs: $1,750\n- 30% Wants: $1,050\n- 20% Savings: $700",
  "unusual": "I detected **2 unusual transactions**:\n\n1. Amazon - $156.99 (50% higher than your average)\n2. Electric Company - $89 (25% increase from last month)\n\nWould you like me to set up alerts for similar patterns?",
  "default": "I'm Voxa AI, your intelligent financial assistant. I can help you:\n\n- Analyze spending patterns\n- Set and track budgets\n- Identify saving opportunities\n- Detect unusual transactions\n\nHow can I assist you today?"
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<Message[]>([])
  const [inputValue, setInputValue] = React.useState("")
  const [isListening, setIsListening] = React.useState(false)
  const [isTyping, setIsTyping] = React.useState(false)
  const [voiceSupported, setVoiceSupported] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const recognitionRef = React.useRef<SpeechRecognition | null>(null)

  React.useEffect(() => {
    // Check for speech recognition support
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      setVoiceSupported(true)
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInputValue(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const toggleVoice = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const getAIResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase()
    if (msg.includes("analyz") || msg.includes("spending") || msg.includes("pattern")) {
      return aiResponses.analyze
    } else if (msg.includes("tip") || msg.includes("reduce") || msg.includes("advice")) {
      return aiResponses.tips
    } else if (msg.includes("save") || msg.includes("saving")) {
      return aiResponses.save
    } else if (msg.includes("unusual") || msg.includes("anomal") || msg.includes("strange")) {
      return aiResponses.unusual
    }
    return aiResponses.default
  }

  const handleSend = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI thinking
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() + 1,
        type: "ai",
        content: getAIResponse(userMessage.content),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const handleSuggestionClick = (action: string) => {
    setInputValue(action)
    setTimeout(() => handleSend(), 100)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating AI Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 ${
          isOpen
            ? "bg-white/10 border border-white/20"
            : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        }`}
        style={{
          boxShadow: isOpen
            ? "0 0 20px rgba(255,255,255,0.1)"
            : "0 0 30px rgba(147, 51, 234, 0.5)"
        }}
      >
        {isOpen ? (
          <IconX className="h-6 w-6 text-white" />
        ) : (
          <IconRobot className="h-6 w-6 text-white" />
        )}
      </button>

      {/* AI Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[400px] h-[600px] bg-black/95 border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ boxShadow: "0 0 50px rgba(147, 51, 234, 0.3)" }}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/20 to-blue-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
                <IconSparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Voxa AI Assistant</h3>
                <p className="text-xs text-muted-foreground">Powered by AI</p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs text-green-400">Online</span>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="space-y-4">
                {/* Welcome Message */}
                <div className="flex gap-3">
                  <div className="p-2 rounded-full bg-purple-500/20 h-fit">
                    <IconRobot className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="flex-1 p-3 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-sm">
                      Hi! I'm your AI financial assistant. I can help you analyze spending,
                      suggest budgets, and find ways to save money. What would you like to know?
                    </p>
                  </div>
                </div>

                {/* Quick Suggestions */}
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <IconBulb className="h-3 w-3" />
                    Quick suggestions
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion.action)}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all text-left group"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-purple-400 group-hover:text-purple-300">
                            {suggestion.icon}
                          </span>
                          <span className="text-xs font-medium">{suggestion.title}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{suggestion.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`p-2 rounded-full h-fit ${
                    message.type === "user"
                      ? "bg-blue-500/20"
                      : "bg-purple-500/20"
                  }`}>
                    {message.type === "user" ? (
                      <span className="text-xs">You</span>
                    ) : (
                      <IconRobot className="h-4 w-4 text-purple-400" />
                    )}
                  </div>
                  <div className={`flex-1 p-3 rounded-2xl ${
                    message.type === "user"
                      ? "bg-blue-500/20 border border-blue-500/30"
                      : "bg-white/5 border border-white/10"
                  }`}>
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <div className="p-2 rounded-full bg-purple-500/20 h-fit">
                  <IconRobot className="h-4 w-4 text-purple-400" />
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10 bg-white/5">
            <div className="flex items-center gap-2">
              {/* Voice Input Button */}
              {voiceSupported && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={`shrink-0 rounded-full ${
                    isListening
                      ? "bg-red-500/20 text-red-400 animate-pulse"
                      : "hover:bg-white/10"
                  }`}
                  onClick={toggleVoice}
                >
                  {isListening ? (
                    <IconMicrophoneOff className="h-5 w-5" />
                  ) : (
                    <IconMicrophone className="h-5 w-5" />
                  )}
                </Button>
              )}

              <Input
                placeholder={isListening ? "Listening..." : "Ask me anything..."}
                className="flex-1 bg-white/5 border-white/10 rounded-full"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isListening}
              />

              <Button
                size="icon"
                className="shrink-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
              >
                {isTyping ? (
                  <IconLoader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <IconSend className="h-5 w-5" />
                )}
              </Button>
            </div>

            {isListening && (
              <div className="mt-2 flex items-center justify-center gap-2 text-xs text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Recording... Speak now
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
