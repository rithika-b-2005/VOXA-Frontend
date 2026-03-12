"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { IconMessageCircle, IconX, IconSend, IconLoader2, IconSparkles, IconUser, IconBulb } from "@tabler/icons-react"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface VoxaAIProps {
  context?: {
    transactions?: Array<{
      id: string
      date: string
      category: string
      payee: string
      amount: number
      type: string
    }>
    totalIncome?: number
    totalExpense?: number
  }
}

// Quick suggestion chips
const QUICK_SUGGESTIONS = [
  "How does this app work?",
  "How to reduce expenses?",
  "Show my spending",
  "Saving tips",
]

export function VoxaAI({ context }: VoxaAIProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm Voxa, your AI financial assistant. Ask me anything about your transactions, spending habits, or financial advice!",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    const transactions = context?.transactions || []
    const totalIncome = context?.totalIncome || 0
    const totalExpense = context?.totalExpense || 0

    // Calculate stats from transactions
    const totalTransactions = transactions.length
    const categories = [...new Set(transactions.map(t => t.category))]
    const categorySpending: Record<string, number> = {}

    transactions.forEach(t => {
      const amount = Math.abs(Number(t.amount))
      categorySpending[t.category] = (categorySpending[t.category] || 0) + amount
    })

    const topCategory = Object.entries(categorySpending)
      .sort((a, b) => b[1] - a[1])[0]

    // ==================== APP FEATURES & HOW IT WORKS ====================

    // How the app works
    if (lowerMessage.includes('how') && (lowerMessage.includes('app') || lowerMessage.includes('work') || lowerMessage.includes('use this'))) {
      return `🎯 **Welcome to Voxa Expense Tracker!**\n\n` +
        `Here's how it works:\n\n` +
        `**1. Add Transactions**\n` +
        `Click "Add New" to record income or expenses. You can attach receipts too!\n\n` +
        `**2. Organize by Categories**\n` +
        `Categorize your spending (Food, Transport, Shopping, etc.) for better insights.\n\n` +
        `**3. Import Data**\n` +
        `Upload Excel/CSV files to bulk import transactions from your bank.\n\n` +
        `**4. Export & Share**\n` +
        `Download Excel reports or share summaries via WhatsApp.\n\n` +
        `**5. Track & Analyze**\n` +
        `View your spending patterns, identify where money goes, and make better decisions!\n\n` +
        `Ask me anything specific about these features!`
    }

    // What features are available
    if (lowerMessage.includes('feature') || lowerMessage.includes('what can') && lowerMessage.includes('do')) {
      return `✨ **Voxa Features:**\n\n` +
        `📝 **Transaction Management**\n` +
        `• Add income & expenses\n` +
        `• Attach receipt images\n` +
        `• Edit & delete transactions\n` +
        `• Bulk select & manage\n\n` +
        `📊 **Analytics**\n` +
        `• Category-wise breakdown\n` +
        `• Spending trends\n` +
        `• Income vs Expense tracking\n\n` +
        `📤 **Import/Export**\n` +
        `• Import from Excel/CSV\n` +
        `• Export to Excel\n` +
        `• Share via WhatsApp\n\n` +
        `🤖 **AI Assistant (Me!)**\n` +
        `• Financial advice\n` +
        `• Spending analysis\n` +
        `• Budget tips`
    }

    // ==================== REDUCE EXPENSES / BUDGET ADVICE ====================

    // How to reduce expenses/spending/payments
    if (lowerMessage.includes('reduce') || lowerMessage.includes('cut') || lowerMessage.includes('lower') ||
        lowerMessage.includes('less') || lowerMessage.includes('decrease') || lowerMessage.includes('minimize')) {

      let response = `💰 **Ways to Reduce Your Expenses:**\n\n`

      // Personalized advice based on top spending category
      if (topCategory) {
        const [catName, catAmount] = topCategory
        response += `📍 **Your Top Spending: ${catName} (₹${catAmount.toFixed(0)})**\n\n`

        if (catName.toLowerCase().includes('food') || catName.toLowerCase().includes('dining')) {
          response += `For Food & Dining:\n` +
            `• Cook at home - saves 60-70% vs eating out\n` +
            `• Meal prep on weekends\n` +
            `• Use food delivery only for special occasions\n` +
            `• Carry lunch to work\n\n`
        } else if (catName.toLowerCase().includes('transport') || catName.toLowerCase().includes('travel')) {
          response += `For Transportation:\n` +
            `• Use public transport when possible\n` +
            `• Carpool with colleagues\n` +
            `• Combine multiple errands in one trip\n` +
            `• Consider walking for short distances\n\n`
        } else if (catName.toLowerCase().includes('shop') || catName.toLowerCase().includes('retail')) {
          response += `For Shopping:\n` +
            `• Follow the 24-hour rule before buying\n` +
            `• Unsubscribe from promotional emails\n` +
            `• Make a list and stick to it\n` +
            `• Buy during sales seasons only\n\n`
        } else if (catName.toLowerCase().includes('entertainment') || catName.toLowerCase().includes('subscription')) {
          response += `For Entertainment:\n` +
            `• Audit your subscriptions\n` +
            `• Share streaming accounts\n` +
            `• Look for free alternatives\n` +
            `• Set a monthly entertainment budget\n\n`
        }
      }

      response += `**General Tips:**\n` +
        `• Track every expense in this app\n` +
        `• Set a monthly budget for each category\n` +
        `• Review subscriptions monthly\n` +
        `• Use the 50/30/20 rule\n` +
        `• Avoid impulse purchases`

      return response
    }

    // Budget advice
    if (lowerMessage.includes('budget') || lowerMessage.includes('plan') && lowerMessage.includes('money')) {
      const monthlyTotal = totalExpense
      return `📋 **Budgeting Guide:**\n\n` +
        `**The 50/30/20 Rule:**\n` +
        `• 50% for Needs (rent, bills, groceries)\n` +
        `• 30% for Wants (entertainment, dining)\n` +
        `• 20% for Savings & Debt\n\n` +
        `**Based on your spending (₹${monthlyTotal.toFixed(0)}):**\n` +
        `• Needs budget: ₹${(monthlyTotal * 0.5).toFixed(0)}\n` +
        `• Wants budget: ₹${(monthlyTotal * 0.3).toFixed(0)}\n` +
        `• Savings target: ₹${(monthlyTotal * 0.2).toFixed(0)}\n\n` +
        `**Tips:**\n` +
        `• Set category limits in this app\n` +
        `• Review weekly, not just monthly\n` +
        `• Adjust based on income changes`
    }

    // ==================== FINANCIAL LITERACY ====================

    // Investment advice
    if (lowerMessage.includes('invest') || lowerMessage.includes('mutual fund') || lowerMessage.includes('stock') || lowerMessage.includes('sip')) {
      return `📈 **Investment Basics:**\n\n` +
        `**For Beginners:**\n` +
        `• Start with an emergency fund (3-6 months expenses)\n` +
        `• Then consider SIP in mutual funds\n` +
        `• Diversify across asset classes\n\n` +
        `**Popular Options in India:**\n` +
        `• PPF - Safe, tax-free returns\n` +
        `• ELSS - Tax saving + market returns\n` +
        `• Index Funds - Low cost, market tracking\n` +
        `• FDs - Guaranteed returns\n\n` +
        `**Golden Rules:**\n` +
        `• Start early, stay consistent\n` +
        `• Don't invest money you need soon\n` +
        `• Higher risk = potential higher returns\n\n` +
        `⚠️ This is general info, not financial advice. Consult a SEBI registered advisor.`
    }

    // Emergency fund
    if (lowerMessage.includes('emergency') || lowerMessage.includes('rainy day') || lowerMessage.includes('safety')) {
      const monthlyExpense = totalExpense || 30000
      return `🛡️ **Emergency Fund Guide:**\n\n` +
        `**What is it?**\n` +
        `Money set aside for unexpected expenses like medical emergencies, job loss, or urgent repairs.\n\n` +
        `**How much to save?**\n` +
        `• Minimum: 3 months of expenses\n` +
        `• Ideal: 6 months of expenses\n` +
        `• Based on your spending: ₹${(monthlyExpense * 3).toFixed(0)} - ₹${(monthlyExpense * 6).toFixed(0)}\n\n` +
        `**Where to keep it?**\n` +
        `• Savings account (instant access)\n` +
        `• Liquid mutual funds\n` +
        `• Short-term FDs\n\n` +
        `**Tip:** Build it slowly - even ₹1000/month helps!`
    }

    // Credit card / debt
    if (lowerMessage.includes('credit') || lowerMessage.includes('debt') || lowerMessage.includes('loan') || lowerMessage.includes('emi')) {
      return `💳 **Managing Debt & Credit:**\n\n` +
        `**Credit Card Tips:**\n` +
        `• Always pay full balance, not minimum\n` +
        `• Credit card interest is 24-42% per year!\n` +
        `• Set up auto-pay for full amount\n` +
        `• Keep utilization below 30%\n\n` +
        `**Debt Payoff Strategies:**\n` +
        `• Avalanche: Pay highest interest first\n` +
        `• Snowball: Pay smallest balance first\n` +
        `• Consolidate high-interest debts\n\n` +
        `**EMI Guidelines:**\n` +
        `• Total EMIs should be < 40% of income\n` +
        `• Avoid EMIs for depreciating assets\n` +
        `• Prepay loans when possible`
    }

    // Tax saving
    if (lowerMessage.includes('tax') || lowerMessage.includes('80c') || lowerMessage.includes('deduction')) {
      return `📑 **Tax Saving Tips (India):**\n\n` +
        `**Section 80C (₹1.5L limit):**\n` +
        `• ELSS Mutual Funds\n` +
        `• PPF\n` +
        `• Life Insurance Premium\n` +
        `• EPF/VPF\n` +
        `• Home Loan Principal\n\n` +
        `**Other Deductions:**\n` +
        `• 80D: Health Insurance (₹25K-₹1L)\n` +
        `• 80E: Education Loan Interest\n` +
        `• 80G: Donations\n` +
        `• 80TTA: Savings Interest (₹10K)\n\n` +
        `**Tips:**\n` +
        `• Plan investments at year start\n` +
        `• Don't buy insurance just for tax\n` +
        `• Track expenses for HRA claims`
    }

    // ==================== TRANSACTION QUERIES ====================

    // Greeting
    if (lowerMessage.match(/^(hi|hello|hey|good morning|good evening|namaste)/)) {
      const greetings = [
        `Hello! 👋 I'm Voxa, your AI financial assistant.`,
        `Hey there! I'm Voxa, ready to help with your finances.`,
        `Hi! Welcome to Voxa. How can I assist you today?`
      ]
      const greeting = greetings[Math.floor(Math.random() * greetings.length)]
      return `${greeting}\n\nYou have ${totalTransactions} transactions recorded.\n\nAsk me about:\n• How this app works\n• Your spending analysis\n• Ways to save money\n• Financial tips`
    }

    // Total spending/expense
    if (lowerMessage.includes('total') && (lowerMessage.includes('spend') || lowerMessage.includes('expense'))) {
      return `Your total expenses are ₹${totalExpense.toFixed(2)}. ${topCategory ? `Your highest spending category is "${topCategory[0]}" with ₹${topCategory[1].toFixed(2)}.` : ''}`
    }

    // Total income
    if (lowerMessage.includes('total') && lowerMessage.includes('income')) {
      return `Your total income is ₹${totalIncome.toFixed(2)}. Your net balance is ₹${(totalIncome - totalExpense).toFixed(2)}.`
    }

    // Balance/summary/spending
    if (lowerMessage.includes('balance') || lowerMessage.includes('summary') || lowerMessage.includes('overview') ||
        (lowerMessage.includes('my') && lowerMessage.includes('spending'))) {
      return `📊 **Financial Summary**\n\n` +
        `• Total Income: ₹${totalIncome.toFixed(2)}\n` +
        `• Total Expenses: ₹${totalExpense.toFixed(2)}\n` +
        `• Net Balance: ₹${(totalIncome - totalExpense).toFixed(2)}\n` +
        `• Total Transactions: ${totalTransactions}\n` +
        `• Categories: ${categories.length}\n\n` +
        (topCategory ? `💡 Top spending: ${topCategory[0]} (₹${topCategory[1].toFixed(0)})` : '')
    }

    // Category breakdown
    if (lowerMessage.includes('category') || lowerMessage.includes('categories') || lowerMessage.includes('breakdown')) {
      if (Object.keys(categorySpending).length === 0) {
        return "You don't have any categorized transactions yet. Add some transactions to see the breakdown!"
      }
      let response = "📈 **Spending by Category:**\n\n"
      Object.entries(categorySpending)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([cat, amount], idx) => {
          const percent = ((amount / totalExpense) * 100).toFixed(1)
          response += `${idx + 1}. ${cat}: ₹${amount.toFixed(0)} (${percent}%)\n`
        })
      return response
    }

    // Recent transactions
    if (lowerMessage.includes('recent') || lowerMessage.includes('latest') || lowerMessage.includes('last transaction')) {
      const recent = transactions.slice(0, 5)
      if (recent.length === 0) {
        return "You don't have any transactions yet. Click 'Add New' to create your first transaction!"
      }
      let response = "📝 **Recent Transactions:**\n\n"
      recent.forEach((t, idx) => {
        const amount = Number(t.amount)
        const sign = amount >= 0 ? '+' : ''
        response += `${idx + 1}. ${t.payee} - ${sign}₹${Math.abs(amount).toFixed(0)} (${t.category})\n`
      })
      return response
    }

    // Highest/largest transaction
    if (lowerMessage.includes('highest') || lowerMessage.includes('largest') || lowerMessage.includes('biggest')) {
      if (transactions.length === 0) {
        return "No transactions found to analyze."
      }
      const largest = [...transactions].sort((a, b) => Math.abs(Number(b.amount)) - Math.abs(Number(a.amount)))[0]
      return `Your largest transaction is "${largest.payee}" for ₹${Math.abs(Number(largest.amount)).toFixed(2)} in the "${largest.category}" category.`
    }

    // ==================== SAVING TIPS ====================

    if (lowerMessage.includes('save') || lowerMessage.includes('saving') || lowerMessage.includes('tip') || lowerMessage.includes('advice')) {
      const tips = [
        `💡 **50/30/20 Rule**\nAllocate 50% for needs, 30% for wants, 20% for savings. It's simple but effective!`,
        `💡 **Subscription Audit**\nList all your subscriptions. Cancel what you don't use weekly. Netflix, Spotify, gym - they add up!`,
        `💡 **No-Spend Days**\nChallenge yourself to 2-3 days per week where you spend ₹0. It builds discipline!`,
        `💡 **24-Hour Rule**\nWait 24 hours before any non-essential purchase. Most impulse buys won't seem important the next day.`,
        `💡 **Automate Savings**\nSet up auto-transfer to savings on payday. What you don't see, you don't spend!`,
        `💡 **Cook More**\nHome cooking costs 1/3rd of eating out. Meal prep on Sunday for the whole week.`,
        `💡 **Track Everything**\nLog every expense in this app. Awareness is the first step to control!`,
        `💡 **Cash Envelope System**\nWithdraw fixed cash for categories like food/entertainment. When it's gone, it's gone!`
      ]
      const randomTip = tips[Math.floor(Math.random() * tips.length)]

      let response = randomTip
      if (topCategory) {
        response += `\n\n📊 Based on your data, you spend most on "${topCategory[0]}". Focus on reducing this category first!`
      }
      return response
    }

    // ==================== APP SPECIFIC HELP ====================

    // Help
    if (lowerMessage.includes('help')) {
      return `🤖 **Voxa AI Assistant**\n\n` +
        `**I can help you with:**\n\n` +
        `📱 **App Usage**\n` +
        `"How does this app work?"\n` +
        `"What features are available?"\n\n` +
        `💰 **Your Finances**\n` +
        `"Show my spending"\n` +
        `"Category breakdown"\n` +
        `"Recent transactions"\n\n` +
        `💡 **Money Advice**\n` +
        `"How to reduce expenses?"\n` +
        `"Saving tips"\n` +
        `"Budget planning"\n\n` +
        `📚 **Financial Education**\n` +
        `"Investment basics"\n` +
        `"Emergency fund"\n` +
        `"Tax saving tips"\n\n` +
        `Just type your question naturally!`
    }

    // Export/download
    if (lowerMessage.includes('export') || lowerMessage.includes('download')) {
      return `📥 **Exporting Transactions:**\n\n` +
        `1. Click the **"Export"** button at the top\n` +
        `2. An Excel file will download automatically\n\n` +
        `**Pro tips:**\n` +
        `• Select specific rows to export only those\n` +
        `• File includes: Date, Description, Category, Amount, Type\n` +
        `• Great for sharing with accountants or backup!`
    }

    // WhatsApp/share
    if (lowerMessage.includes('share') || lowerMessage.includes('whatsapp')) {
      return `📱 **Sharing via WhatsApp:**\n\n` +
        `1. Click the green **"Share"** button\n` +
        `2. WhatsApp opens with a formatted summary\n` +
        `3. Choose a contact or group to send\n\n` +
        `**What's shared:**\n` +
        `• Total income & expenses\n` +
        `• Net balance\n` +
        `• List of transactions\n\n` +
        `**Tip:** Select specific rows to share only those transactions!`
    }

    // Import
    if (lowerMessage.includes('import') || lowerMessage.includes('upload')) {
      return `📤 **Importing Transactions:**\n\n` +
        `1. Click **"Import"** button\n` +
        `2. Select your Excel or CSV file\n` +
        `3. Preview the data before importing\n` +
        `4. Choose "Replace All" or "Append"\n\n` +
        `**Supported formats:** .xlsx, .xls, .csv\n\n` +
        `**File should have columns for:**\n` +
        `• Date\n` +
        `• Description/Name\n` +
        `• Amount\n` +
        `• Category (optional)`
    }

    // Add transaction
    if (lowerMessage.includes('add') && (lowerMessage.includes('transaction') || lowerMessage.includes('expense') || lowerMessage.includes('income'))) {
      return `➕ **Adding Transactions:**\n\n` +
        `1. Click **"Add New"** button\n` +
        `2. Fill in the details:\n` +
        `   • Description/Payee name\n` +
        `   • Amount\n` +
        `   • Category\n` +
        `   • Date\n` +
        `   • Payment mode\n` +
        `3. Optionally attach a receipt image\n` +
        `4. Click **"Add Transaction"**\n\n` +
        `**Tip:** Toggle between Income/Expense using the buttons!`
    }

    // Thank you
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      const responses = [
        "You're welcome! Happy to help with your finances! 😊",
        "Glad I could help! Feel free to ask anytime! 💰",
        "No problem! I'm always here for your financial questions! ✨",
        "You're welcome! Keep tracking your expenses! 📊"
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }

    // Who are you
    if (lowerMessage.includes('who are you') || lowerMessage.includes('what are you') || lowerMessage.includes('your name')) {
      return `👋 **I'm Voxa!**\n\n` +
        `Your AI-powered financial assistant built into this expense tracker.\n\n` +
        `**What I do:**\n` +
        `• Analyze your spending patterns\n` +
        `• Provide personalized money advice\n` +
        `• Answer questions about the app\n` +
        `• Share financial education tips\n\n` +
        `I'm here 24/7 to help you manage your money better!`
    }

    // ==================== DEFAULT RESPONSE ====================

    return `I'm not sure I understood that completely. 🤔\n\n` +
      `**Try asking:**\n` +
      `• "How does this app work?"\n` +
      `• "Show my spending summary"\n` +
      `• "How to reduce expenses?"\n` +
      `• "Give me saving tips"\n` +
      `• "What features are available?"\n\n` +
      `Or type **"help"** to see everything I can do!`
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI thinking delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500))

    const response = generateResponse(input.trim())

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, assistantMessage])
    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickSuggestion = async (suggestion: string) => {
    if (isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: suggestion,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500))

    const response = generateResponse(suggestion)

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, assistantMessage])
    setIsLoading(false)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 ${
          isOpen
            ? 'bg-white/10 rotate-0'
            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 animate-pulse'
        }`}
      >
        {isOpen ? (
          <IconX className="h-6 w-6 text-white" />
        ) : (
          <div className="relative">
            <IconSparkles className="h-6 w-6 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-purple-600"></span>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] h-[500px] bg-black border border-white/20 rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.3)] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-blue-600/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
                <IconSparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Voxa AI</h3>
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Online • Your Financial Assistant
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`p-2 rounded-full flex-shrink-0 ${
                  message.role === 'user'
                    ? 'bg-blue-500'
                    : 'bg-gradient-to-r from-purple-500 to-blue-500'
                }`}>
                  {message.role === 'user' ? (
                    <IconUser className="h-4 w-4 text-white" />
                  ) : (
                    <IconSparkles className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className={`max-w-[80%] p-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white rounded-tr-sm'
                    : 'bg-white/10 text-white rounded-tl-sm'
                }`}>
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  <p className="text-[10px] text-white/50 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
                  <IconSparkles className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white/10 p-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-white/50 mb-2 flex items-center gap-1">
                <IconBulb className="h-3 w-3" /> Quick questions:
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickSuggestion(suggestion)}
                    className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/70 hover:text-white transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Voxa anything..."
                className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                {isLoading ? (
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <IconSend className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-white/30 text-center mt-2">
              Voxa AI • Powered by your transaction data
            </p>
          </div>
        </div>
      )}
    </>
  )
}
