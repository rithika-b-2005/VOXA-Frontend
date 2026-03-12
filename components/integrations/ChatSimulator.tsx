"use client"

import * as React from "react"
import {
  IconBrandWhatsapp,
  IconBrandSlack,
  IconSend,
  IconPaperclip,
  IconMicrophone,
  IconCheck,
  IconChecks,
} from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface Message {
  id: string
  type: "bot" | "user"
  content: string
  timestamp: string
  status?: "sent" | "delivered" | "read"
}

interface ChatSimulatorProps {
  platform: "whatsapp" | "slack"
}

const initialMessages: Message[] = [
  {
    id: "1",
    type: "bot",
    content: "Welcome to Voxa Finance Bot! 🤖\n\nI can help you:\n• Approve/reject expenses\n• Check balances\n• View pending items\n• Generate reports\n\nType /help for all commands.",
    timestamp: "9:00 AM",
  },
]

const commandResponses: Record<string, string> = {
  "/help": "📋 Available Commands:\n\n/approve [ID] - Approve expense\n/reject [ID] [reason] - Reject expense\n/balance - Check balance\n/pending - View pending items\n/status [ID] - Check status\n/report [type] - Generate report\n\nOr just ask me in natural language!",
  "/balance": "💰 Account Balance Summary:\n\n• Operating Account: $45,230.50\n• Payroll Account: $125,000.00\n• Expense Account: $12,450.75\n\nTotal Available: $182,681.25",
  "/pending": "📝 Pending Approvals (4):\n\n1. EXP-4523 - $345.00 (Alex Turner)\n   Client dinner - HIGH priority\n\n2. EXP-4524 - $75.00 (Jessica Wu)\n   Software subscription\n\n3. PAY-1089 - $5,400.00 (Finance)\n   Vendor payment - HIGH priority\n\n4. EXP-4525 - $89.99 (Tom Wilson)\n   Office supplies\n\nReply /approve [ID] or /reject [ID] [reason]",
  "/report weekly": "📊 Generating Weekly Report...\n\n✅ Report Generated!\n\n• Total Expenses: $12,450.00\n• Approved: 23 claims\n• Rejected: 3 claims\n• Pending: 4 claims\n\n📈 vs Last Week: +15% spending\n\nFull report sent to your email.",
}

export function ChatSimulator({ platform }: ChatSimulatorProps) {
  const [messages, setMessages] = React.useState<Message[]>(initialMessages)
  const [input, setInput] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase().trim()

    // Check for exact command matches
    for (const [cmd, response] of Object.entries(commandResponses)) {
      if (lowerMessage.startsWith(cmd)) {
        return response
      }
    }

    // Check for approve command
    if (lowerMessage.startsWith("/approve")) {
      const id = lowerMessage.split(" ")[1]
      if (id) {
        return `✅ Expense ${id.toUpperCase()} has been approved!\n\nThe submitter has been notified. This expense will be processed in the next payment cycle.`
      }
      return "Please specify an expense ID. Example: /approve EXP-4523"
    }

    // Check for reject command
    if (lowerMessage.startsWith("/reject")) {
      const parts = lowerMessage.split(" ")
      const id = parts[1]
      const reason = parts.slice(2).join(" ")
      if (id && reason) {
        return `❌ Expense ${id.toUpperCase()} has been rejected.\n\nReason: ${reason}\n\nThe submitter has been notified and can resubmit with corrections.`
      }
      return "Please specify an expense ID and reason. Example: /reject EXP-4518 missing receipt"
    }

    // Natural language understanding
    if (lowerMessage.includes("balance") || lowerMessage.includes("how much")) {
      return commandResponses["/balance"]
    }

    if (lowerMessage.includes("pending") || lowerMessage.includes("waiting")) {
      return commandResponses["/pending"]
    }

    if (lowerMessage.includes("approve") && lowerMessage.includes("alex")) {
      return "✅ Expense EXP-4523 from Alex Turner ($345.00) has been approved!\n\nAlex has been notified via email and WhatsApp."
    }

    if (lowerMessage.includes("report")) {
      return commandResponses["/report weekly"]
    }

    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return "Hello! 👋 How can I help you today?\n\nYou can:\n• Check your /balance\n• View /pending approvals\n• Generate a /report\n\nOr just ask me anything!"
    }

    // Default response
    return "I understand you're asking about: \"" + userMessage + "\"\n\nI'm still learning! Try these commands:\n• /help - See all commands\n• /pending - View pending items\n• /balance - Check balances\n\nOr ask me to approve expenses, check payments, or generate reports."
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

    const botResponse: Message = {
      id: (Date.now() + 1).toString(),
      type: "bot",
      content: generateResponse(input),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setIsTyping(false)
    setMessages(prev => [...prev, botResponse])
  }

  const isWhatsApp = platform === "whatsapp"

  return (
    <Card className={`overflow-hidden ${isWhatsApp ? "bg-[#0b141a]" : "bg-[#1a1d21]"} border-white/10`}>
      <CardHeader className={`py-3 ${isWhatsApp ? "bg-[#202c33]" : "bg-[#350d36]"}`}>
        <div className="flex items-center gap-3">
          {isWhatsApp ? (
            <IconBrandWhatsapp className="h-6 w-6 text-green-500" />
          ) : (
            <IconBrandSlack className="h-6 w-6 text-purple-500" />
          )}
          <div>
            <CardTitle className="text-base">Voxa Finance Bot</CardTitle>
            <p className="text-xs text-muted-foreground">
              {isTyping ? "typing..." : "online"}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Messages Area */}
        <div className="h-80 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === "user"
                    ? isWhatsApp
                      ? "bg-[#005c4b]"
                      : "bg-[#1264a3]"
                    : isWhatsApp
                    ? "bg-[#202c33]"
                    : "bg-[#222529]"
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[10px] text-muted-foreground">{message.timestamp}</span>
                  {message.type === "user" && message.status && (
                    <IconChecks className="h-3 w-3 text-blue-400" />
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className={`rounded-lg p-3 ${isWhatsApp ? "bg-[#202c33]" : "bg-[#222529]"}`}>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={`p-3 ${isWhatsApp ? "bg-[#202c33]" : "bg-[#222529]"} border-t border-white/10`}>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
              <IconPaperclip className="h-5 w-5" />
            </Button>
            <Input
              placeholder="Type a message or command..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className={`flex-1 border-0 ${isWhatsApp ? "bg-[#2a3942]" : "bg-[#1a1d21]"}`}
            />
            {input.trim() ? (
              <Button
                size="icon"
                onClick={handleSend}
                className={isWhatsApp ? "bg-[#00a884] hover:bg-[#00a884]/80" : "bg-[#007a5a] hover:bg-[#007a5a]/80"}
              >
                <IconSend className="h-5 w-5" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                <IconMicrophone className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`p-2 ${isWhatsApp ? "bg-[#111b21]" : "bg-[#19171d]"} border-t border-white/10`}>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {["/pending", "/balance", "/help", "/report weekly"].map((cmd) => (
              <Button
                key={cmd}
                variant="outline"
                size="sm"
                className="shrink-0 text-xs bg-white/5 border-white/10 hover:bg-white/10"
                onClick={() => {
                  setInput(cmd)
                }}
              >
                {cmd}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
