"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  IconChartLine,
  IconTrendingUp,
  IconTrendingDown,
  IconAlertTriangle,
  IconBulb,
  IconRefresh,
  IconCalendar,
  IconCurrencyDollar,
  IconArrowUpRight,
  IconArrowDownRight,
  IconSparkles,
  IconBrain,
  IconTarget,
  IconClock,
  IconShieldCheck,
  IconChartBar,
  IconReceipt,
  IconWallet,
  IconBuildingBank,
} from "@tabler/icons-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

interface Prediction {
  id: number
  type: "cash_flow" | "tax" | "expense" | "risk"
  title: string
  description: string
  value: number
  trend: "up" | "down" | "stable"
  confidence: number
  timeframe: string
  severity: "low" | "medium" | "high"
}

const cashFlowData = [
  { month: "Jan", actual: 125000, predicted: null },
  { month: "Feb", actual: 145000, predicted: null },
  { month: "Mar", actual: 132000, predicted: null },
  { month: "Apr", actual: 168000, predicted: null },
  { month: "May", actual: 155000, predicted: null },
  { month: "Jun", actual: null, predicted: 175000 },
  { month: "Jul", actual: null, predicted: 182000 },
  { month: "Aug", actual: null, predicted: 195000 },
]

const expenseBreakdown = [
  { category: "Operations", current: 45000, predicted: 48000 },
  { category: "Salaries", current: 120000, predicted: 125000 },
  { category: "Marketing", current: 25000, predicted: 30000 },
  { category: "Utilities", current: 8000, predicted: 9500 },
  { category: "Software", current: 15000, predicted: 15000 },
]

const predictions: Prediction[] = [
  {
    id: 1,
    type: "cash_flow",
    title: "Cash Flow Crunch Detected",
    description: "Predicted cash shortfall of ₹2.5L in February due to annual insurance renewal and quarterly tax payments.",
    value: -250000,
    trend: "down",
    confidence: 87,
    timeframe: "Feb 2025",
    severity: "high",
  },
  {
    id: 2,
    type: "tax",
    title: "GST Liability Forecast",
    description: "Based on current invoicing patterns, your Q4 GST liability is projected to be ₹4.2L.",
    value: 420000,
    trend: "up",
    confidence: 92,
    timeframe: "Q4 2024",
    severity: "medium",
  },
  {
    id: 3,
    type: "expense",
    title: "Expense Optimization",
    description: "Switching to annual billing for SaaS subscriptions could save ₹45,000/year.",
    value: 45000,
    trend: "down",
    confidence: 95,
    timeframe: "Next 12 months",
    severity: "low",
  },
  {
    id: 4,
    type: "risk",
    title: "Overdue Payment Risk",
    description: "3 clients have delayed payments by 15+ days. Risk of ₹1.8L becoming overdue.",
    value: 180000,
    trend: "up",
    confidence: 78,
    timeframe: "Next 30 days",
    severity: "high",
  },
]

const aiInsights = [
  {
    icon: IconBulb,
    title: "Revenue Pattern",
    insight: "Your revenue peaks in Q3. Consider building reserves during this period for Q1 dip.",
    action: "Set up auto-transfer",
  },
  {
    icon: IconTarget,
    title: "Budget Optimization",
    insight: "Marketing spend efficiency dropped 15% this quarter. Review campaign ROI.",
    action: "View analysis",
  },
  {
    icon: IconShieldCheck,
    title: "Compliance Alert",
    insight: "TDS filing deadline approaching. 5 vendor payments need TDS deduction.",
    action: "Process now",
  },
]

export function PredictiveInsights() {
  const [selectedPeriod, setSelectedPeriod] = React.useState("6m")
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-400 bg-red-500/10 border-red-500/20"
      case "medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
      default:
        return "text-green-400 bg-green-500/10 border-green-500/20"
    }
  }

  return (
    <div className="flex-1 flex flex-col rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500">
              <IconBrain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">AI Predictive Insights</h3>
              <p className="text-xs text-muted-foreground">
                Forecasts based on your financial data
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
              {["3m", "6m", "1y"].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 text-xs rounded-md transition-all ${
                    selectedPeriod === period
                      ? "bg-white/10 text-white"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleRefresh}
            >
              <IconRefresh
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Cash Flow Forecast Chart */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium flex items-center gap-2">
                <IconChartLine className="h-4 w-4 text-emerald-400" />
                Cash Flow Forecast
              </h4>
              <p className="text-xs text-muted-foreground">
                Actual vs Predicted (AI model confidence: 89%)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                Actual
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-purple-500 opacity-50" />
                Predicted
              </span>
            </div>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData}>
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#actualGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="#a855f7"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#predictedGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Predictions Grid */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <IconSparkles className="h-4 w-4 text-purple-400" />
            AI Predictions & Alerts
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {predictions.map((prediction) => (
              <div
                key={prediction.id}
                className={`p-4 rounded-xl border ${getSeverityColor(prediction.severity)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {prediction.type === "cash_flow" && (
                      <IconWallet className="h-4 w-4" />
                    )}
                    {prediction.type === "tax" && (
                      <IconReceipt className="h-4 w-4" />
                    )}
                    {prediction.type === "expense" && (
                      <IconCurrencyDollar className="h-4 w-4" />
                    )}
                    {prediction.type === "risk" && (
                      <IconAlertTriangle className="h-4 w-4" />
                    )}
                    <span className="text-xs uppercase font-medium">
                      {prediction.type.replace("_", " ")}
                    </span>
                  </div>
                  <span className="text-[10px] opacity-70">{prediction.timeframe}</span>
                </div>

                <h5 className="text-sm font-medium mb-1">{prediction.title}</h5>
                <p className="text-xs opacity-80 mb-3">{prediction.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {prediction.trend === "up" ? (
                      <IconArrowUpRight className="h-4 w-4 text-red-400" />
                    ) : prediction.trend === "down" ? (
                      <IconArrowDownRight className="h-4 w-4 text-green-400" />
                    ) : null}
                    <span className="font-mono text-sm">
                      ₹{Math.abs(prediction.value).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">
                    {prediction.confidence}% confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Forecast */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <IconChartBar className="h-4 w-4 text-blue-400" />
            Next Quarter Expense Forecast
          </h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                <YAxis dataKey="category" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
                />
                <Bar dataKey="current" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Current" />
                <Bar dataKey="predicted" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Predicted" opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <IconBulb className="h-4 w-4 text-yellow-400" />
            Smart Recommendations
          </h4>
          <div className="space-y-2">
            {aiInsights.map((insight, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-yellow-500/30 transition-all"
              >
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <insight.icon className="h-4 w-4 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{insight.title}</p>
                  <p className="text-xs text-muted-foreground">{insight.insight}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-xs shrink-0">
                  {insight.action}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
