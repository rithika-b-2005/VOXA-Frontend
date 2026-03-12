"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  IconLeaf,
  IconTrendingUp,
  IconTrendingDown,
  IconShieldCheck,
  IconWallet,
  IconReceipt,
  IconChartBar,
  IconTarget,
  IconAward,
  IconFlame,
  IconStar,
  IconCheck,
  IconX,
  IconArrowUp,
  IconArrowDown,
  IconInfoCircle,
  IconRefresh,
  IconShare,
  IconDownload,
  IconBolt,
  IconCoin,
  IconScale,
  IconBuildingBank,
  IconPlant,
  IconCloudRain,
  IconSun,
} from "@tabler/icons-react"

interface HealthMetric {
  id: string
  name: string
  score: number
  maxScore: number
  status: "excellent" | "good" | "fair" | "poor"
  trend: "up" | "down" | "stable"
  description: string
  tips: string[]
}

interface Achievement {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  unlocked: boolean
  progress?: number
}

const healthMetrics: HealthMetric[] = [
  {
    id: "compliance",
    name: "Compliance Score",
    score: 95,
    maxScore: 100,
    status: "excellent",
    trend: "up",
    description: "All GST filings on time, TDS deposited regularly",
    tips: ["File GSTR-1 before 11th for bonus points"],
  },
  {
    id: "cash_flow",
    name: "Cash Flow Health",
    score: 78,
    maxScore: 100,
    status: "good",
    trend: "stable",
    description: "Positive cash flow with 2-month runway",
    tips: ["Collect pending receivables to improve score"],
  },
  {
    id: "expense",
    name: "Expense Efficiency",
    score: 72,
    maxScore: 100,
    status: "good",
    trend: "down",
    description: "Expenses within budget, some optimization possible",
    tips: ["Review software subscriptions", "Switch to annual billing"],
  },
  {
    id: "receivables",
    name: "Receivables Health",
    score: 65,
    maxScore: 100,
    status: "fair",
    trend: "down",
    description: "3 invoices overdue, ₹1.8L outstanding",
    tips: ["Send payment reminders", "Offer early payment discounts"],
  },
  {
    id: "sustainability",
    name: "Carbon Footprint",
    score: 82,
    maxScore: 100,
    status: "good",
    trend: "up",
    description: "23% reduction in carbon emissions this quarter",
    tips: ["Switch to green energy vendors"],
  },
]

const achievements: Achievement[] = [
  {
    id: 1,
    title: "Tax Wizard",
    description: "Filed all taxes on time for 6 months",
    icon: <IconShieldCheck className="h-5 w-5" />,
    unlocked: true,
  },
  {
    id: 2,
    title: "Budget Master",
    description: "Stayed under budget for 3 consecutive months",
    icon: <IconWallet className="h-5 w-5" />,
    unlocked: true,
  },
  {
    id: 3,
    title: "Eco Warrior",
    description: "Reduced carbon footprint by 25%",
    icon: <IconLeaf className="h-5 w-5" />,
    unlocked: false,
    progress: 92,
  },
  {
    id: 4,
    title: "Cash King",
    description: "Maintained 6-month cash runway",
    icon: <IconCoin className="h-5 w-5" />,
    unlocked: false,
    progress: 33,
  },
  {
    id: 5,
    title: "Invoice Ninja",
    description: "Zero overdue invoices for 30 days",
    icon: <IconReceipt className="h-5 w-5" />,
    unlocked: false,
    progress: 70,
  },
  {
    id: 6,
    title: "Streak Legend",
    description: "7-day login streak maintained",
    icon: <IconFlame className="h-5 w-5" />,
    unlocked: true,
  },
]

const carbonMetrics = [
  { category: "Travel", emissions: 2.5, icon: IconCloudRain, color: "text-blue-400" },
  { category: "Energy", emissions: 1.8, icon: IconBolt, color: "text-yellow-400" },
  { category: "Supplies", emissions: 0.9, icon: IconReceipt, color: "text-green-400" },
  { category: "Services", emissions: 0.4, icon: IconBuildingBank, color: "text-purple-400" },
]

export function FinancialHealthScore() {
  const [showDetails, setShowDetails] = React.useState<string | null>(null)

  const overallScore = Math.round(
    healthMetrics.reduce((acc, m) => acc + m.score, 0) / healthMetrics.length
  )

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400"
    if (score >= 70) return "text-yellow-400"
    if (score >= 50) return "text-orange-400"
    return "text-red-400"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "good":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "fair":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      default:
        return "bg-red-500/10 text-red-400 border-red-500/20"
    }
  }

  const getScoreGradient = (score: number) => {
    if (score >= 90) return "from-green-500 to-emerald-500"
    if (score >= 70) return "from-yellow-500 to-amber-500"
    if (score >= 50) return "from-orange-500 to-red-500"
    return "from-red-500 to-pink-500"
  }

  return (
    <div className="flex-1 flex flex-col rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-green-500/10 to-teal-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-teal-500">
              <IconLeaf className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Financial Health Score</h3>
              <p className="text-xs text-muted-foreground">
                Gamified dashboard for your business health
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <IconShare className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <IconDownload className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Overall Score */}
        <div className="flex items-center justify-center py-6">
          <div className="relative">
            {/* Outer ring */}
            <svg className="w-48 h-48 transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(overallScore / 100) * 553} 553`}
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Score display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}
              </span>
              <span className="text-sm text-muted-foreground">out of 100</span>
              <div className="flex items-center gap-1 mt-2">
                <IconTrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-xs text-green-400">+5 this month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weather Icon based on score */}
        <div className="flex justify-center">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            {overallScore >= 80 ? (
              <>
                <IconSun className="h-5 w-5 text-yellow-400" />
                <span className="text-sm">Sunny outlook!</span>
              </>
            ) : overallScore >= 60 ? (
              <>
                <IconPlant className="h-5 w-5 text-green-400" />
                <span className="text-sm">Growing steadily</span>
              </>
            ) : (
              <>
                <IconCloudRain className="h-5 w-5 text-blue-400" />
                <span className="text-sm">Needs attention</span>
              </>
            )}
          </div>
        </div>

        {/* Health Metrics */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <IconChartBar className="h-4 w-4 text-blue-400" />
            Health Breakdown
          </h4>
          {healthMetrics.map((metric) => (
            <div
              key={metric.id}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              onClick={() =>
                setShowDetails(showDetails === metric.id ? null : metric.id)
              }
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{metric.name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusBadge(
                      metric.status
                    )}`}
                  >
                    {metric.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${getScoreColor(metric.score)}`}>
                    {metric.score}
                  </span>
                  {metric.trend === "up" && (
                    <IconArrowUp className="h-3 w-3 text-green-400" />
                  )}
                  {metric.trend === "down" && (
                    <IconArrowDown className="h-3 w-3 text-red-400" />
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getScoreGradient(
                    metric.score
                  )} transition-all duration-500`}
                  style={{ width: `${metric.score}%` }}
                />
              </div>

              {/* Expanded details */}
              {showDetails === metric.id && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-muted-foreground mb-2">
                    {metric.description}
                  </p>
                  <div className="space-y-1">
                    {metric.tips.map((tip, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs"
                      >
                        <IconBolt className="h-3 w-3 text-yellow-400" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <IconAward className="h-4 w-4 text-yellow-400" />
            Achievements
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`relative p-3 rounded-xl text-center transition-all ${
                  achievement.unlocked
                    ? "bg-gradient-to-b from-yellow-500/10 to-amber-500/10 border border-yellow-500/30"
                    : "bg-white/5 border border-white/10 opacity-60"
                }`}
              >
                <div
                  className={`p-2 rounded-full mx-auto mb-2 w-fit ${
                    achievement.unlocked
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-white/10 text-muted-foreground"
                  }`}
                >
                  {achievement.icon}
                </div>
                <p className="text-xs font-medium truncate">{achievement.title}</p>
                {!achievement.unlocked && achievement.progress !== undefined && (
                  <div className="mt-2">
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500"
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {achievement.progress}%
                    </p>
                  </div>
                )}
                {achievement.unlocked && (
                  <IconStar className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 fill-yellow-400" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Carbon Footprint */}
        <div className="p-4 rounded-xl bg-gradient-to-b from-green-500/10 to-teal-500/10 border border-green-500/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium flex items-center gap-2">
              <IconPlant className="h-4 w-4 text-green-400" />
              Carbon Footprint
            </h4>
            <span className="text-sm font-mono text-green-400">
              5.6 tCO₂e
            </span>
          </div>
          <div className="space-y-2">
            {carbonMetrics.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <item.icon className={`h-4 w-4 ${item.color}`} />
                <span className="text-xs flex-1">{item.category}</span>
                <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${(item.emissions / 5.6) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono w-12 text-right">
                  {item.emissions}t
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            🌱 You're 23% more eco-friendly than similar businesses
          </p>
        </div>
      </div>
    </div>
  )
}
