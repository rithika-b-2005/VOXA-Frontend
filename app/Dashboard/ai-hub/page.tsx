"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  IconMicrophone,
  IconMicrophoneOff,
  IconSend,
  IconSparkles,
  IconBrain,
  IconReceipt,
  IconCalendarEvent,
  IconChartLine,
  IconShieldCheck,
  IconCreditCard,
  IconUsers,
  IconLeaf,
  IconWand,
  IconVolume,
  IconPlayerPlay,
  IconLoader2,
  IconCheck,
  IconArrowRight,
  IconBrandWhatsapp,
  IconBrandSlack,
  IconFileInvoice,
  IconCurrencyDollar,
  IconAlertTriangle,
  IconTrendingUp,
  IconTrendingDown,
  IconBulb,
  IconRobot,
  IconX,
  IconUpload,
  IconScan,
  IconRefresh,
} from "@tabler/icons-react"
import { VoiceCommand } from "@/components/ai/VoiceCommand"
import { SmartOCR } from "@/components/ai/SmartOCR"
import { PredictiveInsights } from "@/components/ai/PredictiveInsights"
import { ComplianceCalendar } from "@/components/ai/ComplianceCalendar"
import { FinancialHealthScore } from "@/components/ai/FinancialHealthScore"
import { QuickActions } from "@/components/ai/QuickActions"

interface Message {
  id: number
  type: "user" | "ai"
  content: string
  timestamp: Date
  action?: {
    type: "invoice" | "expense" | "report" | "payment" | "reminder"
    status: "pending" | "completed" | "failed"
    data?: Record<string, unknown>
  }
}

const commandExamples = [
  { icon: IconFileInvoice, text: "Generate GST invoice for Client A", category: "Invoicing" },
  { icon: IconReceipt, text: "Show unpaid bills from last month", category: "Bills" },
  { icon: IconChartLine, text: "Forecast my cash flow for Q1", category: "Analytics" },
  { icon: IconCalendarEvent, text: "Generate payroll for November", category: "Payroll" },
  { icon: IconCurrencyDollar, text: "Pay vendor invoice #1234", category: "Payments" },
  { icon: IconShieldCheck, text: "Check my GST compliance status", category: "Compliance" },
]

const aiCapabilities = [
  {
    icon: IconBrain,
    title: "Conversational AI",
    description: "Natural language commands for all financial operations",
    color: "from-purple-500 to-violet-600",
  },
  {
    icon: IconReceipt,
    title: "Smart OCR",
    description: "Scan receipts & invoices with auto-categorization",
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: IconChartLine,
    title: "Predictive Insights",
    description: "AI forecasts tax liabilities & cash flow",
    color: "from-green-500 to-emerald-600",
  },
  {
    icon: IconShieldCheck,
    title: "Compliance Engine",
    description: "One-click GST filing & multi-jurisdiction taxes",
    color: "from-orange-500 to-amber-600",
  },
  {
    icon: IconCreditCard,
    title: "Smart Payments",
    description: "In-app payments with auto reconciliation",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: IconLeaf,
    title: "Carbon Tracking",
    description: "AI calculates sustainability impact of expenses",
    color: "from-teal-500 to-green-600",
  },
]

export default function AIHubPage() {
  const [inputValue, setInputValue] = React.useState("")
  const [isListening, setIsListening] = React.useState(false)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [messages, setMessages] = React.useState<Message[]>([])
  const [activeTab, setActiveTab] = React.useState<"chat" | "voice" | "scan" | "insights" | "compliance" | "health">("chat")
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const processCommand = (command: string) => {
    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: command,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsProcessing(true)

    // Simulate AI processing with contextual responses
    setTimeout(() => {
      const response = generateAIResponse(command)
      const aiMessage: Message = {
        id: Date.now() + 1,
        type: "ai",
        content: response.content,
        timestamp: new Date(),
        action: response.action,
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsProcessing(false)
    }, 1500)
  }

  const generateAIResponse = (command: string): { content: string; action?: Message["action"] } => {
    const cmd = command.toLowerCase()

    if (cmd.includes("invoice") && cmd.includes("generate")) {
      return {
        content: "I've generated the GST invoice for Client A.\n\n**Invoice Details:**\n- Invoice #: INV-2024-0156\n- Amount: ₹45,000\n- GST (18%): ₹8,100\n- Total: ₹53,100\n\nThe invoice has been saved and is ready to send. Would you like me to email it to the client?",
        action: { type: "invoice", status: "completed", data: { invoiceId: "INV-2024-0156" } },
      }
    }

    if (cmd.includes("unpaid") || cmd.includes("bills")) {
      return {
        content: "Here are your unpaid bills from last month:\n\n1. **Office Rent** - ₹35,000 (Due: Dec 5)\n2. **Cloud Services** - ₹12,500 (Due: Dec 10)\n3. **Marketing Agency** - ₹28,000 (Overdue by 5 days)\n\n**Total Outstanding:** ₹75,500\n\nWould you like me to schedule payments or send reminders?",
        action: { type: "expense", status: "pending" },
      }
    }

    if (cmd.includes("forecast") || cmd.includes("cash flow")) {
      return {
        content: "**Q1 2025 Cash Flow Forecast:**\n\n📈 **Projected Revenue:** ₹12,45,000\n📉 **Projected Expenses:** ₹8,90,000\n💰 **Net Cash Flow:** ₹3,55,000\n\n⚠️ **Alert:** I've detected a potential cash crunch in February due to annual insurance renewal. Consider deferring ₹1,20,000 in non-essential expenses.\n\nWould you like a detailed breakdown?",
        action: { type: "report", status: "completed" },
      }
    }

    if (cmd.includes("payroll")) {
      return {
        content: "**Payroll Generation - November 2024**\n\n👥 **Employees:** 12\n💵 **Gross Salaries:** ₹4,80,000\n🏦 **Deductions (PF, ESI, TDS):** ₹72,000\n💰 **Net Payroll:** ₹4,08,000\n\n✅ Payslips generated for all employees\n✅ Bank transfer file ready\n✅ Statutory reports prepared\n\nShall I initiate the salary transfers?",
        action: { type: "payment", status: "pending" },
      }
    }

    if (cmd.includes("pay") && cmd.includes("vendor")) {
      return {
        content: "**Processing Vendor Payment**\n\n🏢 **Vendor:** TechSupplies Ltd\n📄 **Invoice:** #1234\n💰 **Amount:** ₹24,500\n\n✅ Invoice verified against PO\n✅ GST Input Credit: ₹3,780\n⏳ Payment scheduled for today\n\nAuthorizing payment from your linked account...",
        action: { type: "payment", status: "completed" },
      }
    }

    if (cmd.includes("gst") || cmd.includes("compliance")) {
      return {
        content: "**GST Compliance Status - December 2024**\n\n✅ **GSTR-1:** Filed (Nov)\n✅ **GSTR-3B:** Filed (Nov)\n⏳ **GSTR-1:** Due Dec 11\n⏳ **GSTR-3B:** Due Dec 20\n\n📊 **Summary:**\n- Output GST Liability: ₹1,45,000\n- Input Tax Credit: ₹98,000\n- Net GST Payable: ₹47,000\n\nAll filings are up to date. Would you like me to prepare the December returns?",
        action: { type: "reminder", status: "completed" },
      }
    }

    return {
      content: "I understand you want to: \"" + command + "\"\n\nI can help you with:\n\n• **Invoicing**: Generate, send, and track invoices\n• **Expenses**: Scan receipts, categorize spending\n• **Payments**: Pay bills, process payroll\n• **Analytics**: Cash flow forecasts, spending insights\n• **Compliance**: GST filing, tax calculations\n\nHow would you like me to proceed?",
    }
  }

  const handleSend = () => {
    if (!inputValue.trim()) return
    processCommand(inputValue)
    setInputValue("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleVoiceResult = (transcript: string) => {
    processCommand(transcript)
    setIsListening(false)
  }

  return (
    <div className="flex flex-col min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            AI Command Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Control your entire financial workflow with natural language
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 border-white/10 hover:bg-white/5">
            <IconBrandWhatsapp className="h-4 w-4 text-green-500" />
            WhatsApp
          </Button>
          <Button variant="outline" size="sm" className="gap-2 border-white/10 hover:bg-white/5">
            <IconBrandSlack className="h-4 w-4 text-purple-500" />
            Slack
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
        {[
          { id: "chat", label: "AI Chat", icon: IconBrain },
          { id: "voice", label: "Voice Command", icon: IconMicrophone },
          { id: "scan", label: "Smart OCR", icon: IconScan },
          { id: "insights", label: "Predictions", icon: IconChartLine },
          { id: "compliance", label: "Compliance", icon: IconShieldCheck },
          { id: "health", label: "Health Score", icon: IconLeaf },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-12 gap-6">
        {/* Left Panel - AI Interaction */}
        <div className="col-span-8 flex flex-col">
          {activeTab === "chat" && (
            <div className="flex-1 flex flex-col rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
                    <IconSparkles className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Voxa AI</h3>
                    <p className="text-xs text-muted-foreground">
                      Ask me anything or give me a command
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-green-400">Ready</span>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="space-y-6">
                    <div className="flex gap-3">
                      <div className="p-2 rounded-full bg-purple-500/20 h-fit">
                        <IconRobot className="h-4 w-4 text-purple-400" />
                      </div>
                      <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/10">
                        <p className="text-sm mb-3">
                          👋 Welcome to the <strong>AI Command Center</strong>! I'm your intelligent financial assistant.
                          You can control your entire workflow using natural language.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Try saying: "Hey Voxa, generate payroll for November" or type a command below.
                        </p>
                      </div>
                    </div>

                    {/* Command Examples */}
                    <div className="pl-12">
                      <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                        <IconBulb className="h-3 w-3" />
                        Try these commands
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {commandExamples.map((example, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setInputValue(example.text)
                              setTimeout(() => handleSend(), 100)
                            }}
                            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all text-left group"
                          >
                            <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20">
                              <example.icon className="h-4 w-4 text-purple-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{example.text}</p>
                              <p className="text-[10px] text-muted-foreground">{example.category}</p>
                            </div>
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
                      <div
                        className={`p-2 rounded-full h-fit ${
                          message.type === "user" ? "bg-blue-500/20" : "bg-purple-500/20"
                        }`}
                      >
                        {message.type === "user" ? (
                          <span className="text-xs px-1">You</span>
                        ) : (
                          <IconRobot className="h-4 w-4 text-purple-400" />
                        )}
                      </div>
                      <div
                        className={`flex-1 max-w-[80%] p-4 rounded-2xl ${
                          message.type === "user"
                            ? "bg-blue-500/20 border border-blue-500/30"
                            : "bg-white/5 border border-white/10"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                        {message.action && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <div className="flex items-center gap-2">
                              {message.action.status === "completed" ? (
                                <span className="flex items-center gap-1 text-xs text-green-400">
                                  <IconCheck className="h-3 w-3" /> Action completed
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-xs text-yellow-400">
                                  <IconLoader2 className="h-3 w-3 animate-spin" /> Processing...
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        <span className="text-[10px] text-muted-foreground mt-2 block">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}

                {isProcessing && (
                  <div className="flex gap-3">
                    <div className="p-2 rounded-full bg-purple-500/20 h-fit">
                      <IconRobot className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-1">
                        <span
                          className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <span
                          className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`shrink-0 rounded-full ${
                      isListening
                        ? "bg-red-500/20 text-red-400 animate-pulse"
                        : "hover:bg-white/10"
                    }`}
                    onClick={() => setIsListening(!isListening)}
                  >
                    {isListening ? (
                      <IconMicrophoneOff className="h-5 w-5" />
                    ) : (
                      <IconMicrophone className="h-5 w-5" />
                    )}
                  </Button>

                  <div className="relative flex-1">
                    <Input
                      placeholder={
                        isListening
                          ? "Listening... Say your command"
                          : "Ask me anything or give a command..."
                      }
                      className="flex-1 bg-white/5 border-white/10 rounded-full pr-12"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isListening || isProcessing}
                    />
                    <Button
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                      onClick={handleSend}
                      disabled={!inputValue.trim() || isProcessing}
                    >
                      {isProcessing ? (
                        <IconLoader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <IconSend className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {isListening && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-sm text-red-400">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Recording... Speak your command
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "voice" && <VoiceCommand onResult={handleVoiceResult} />}
          {activeTab === "scan" && <SmartOCR />}
          {activeTab === "insights" && <PredictiveInsights />}
          {activeTab === "compliance" && <ComplianceCalendar />}
          {activeTab === "health" && <FinancialHealthScore />}
        </div>

        {/* Right Panel - Quick Actions & Capabilities */}
        <div className="col-span-4 space-y-6">
          {/* Quick Actions */}
          <QuickActions onAction={processCommand} />

          {/* AI Capabilities */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <IconWand className="h-4 w-4 text-purple-400" />
              AI Capabilities
            </h3>
            <div className="space-y-3">
              {aiCapabilities.map((capability, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all cursor-pointer"
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${capability.color}`}>
                    <capability.icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{capability.title}</p>
                    <p className="text-xs text-muted-foreground">{capability.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Integration Status */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <IconRefresh className="h-4 w-4 text-blue-400" />
              Connected Services
            </h3>
            <div className="space-y-2">
              {[
                { name: "GST Portal", status: "connected", color: "text-green-400" },
                { name: "Bank Account", status: "connected", color: "text-green-400" },
                { name: "WhatsApp Business", status: "pending", color: "text-yellow-400" },
                { name: "Slack Workspace", status: "pending", color: "text-yellow-400" },
              ].map((service, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/5"
                >
                  <span className="text-sm">{service.name}</span>
                  <span className={`text-xs ${service.color} capitalize`}>{service.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
