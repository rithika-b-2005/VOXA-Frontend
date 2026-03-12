"use client"

import * as React from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  IconBulb,
  IconTrendingDown,
  IconPigMoney,
  IconReceipt,
  IconCoffee,
  IconShoppingCart,
  IconCar,
  IconHome,
  IconDeviceGamepad,
  IconRefresh,
  IconSparkles,
  IconChartBar,
  IconTarget,
  IconAlertTriangle,
  IconCheck,
  IconBookmark,
  IconBookmarkFilled,
  IconLoader2,
} from "@tabler/icons-react"
import { useSavingTips } from "@/hooks/useApi"
import { useAuth } from "@/contexts/AuthContext"
import { savingTipsApi } from "@/lib/api"

interface SavingTip {
  id: string
  title: string
  description: string
  potentialSaving: number
  difficulty: "easy" | "medium" | "hard"
  category: string
  actionSteps: string[]
  priority: "high" | "medium" | "low"
  isApplied?: boolean
  isDismissed?: boolean
}

interface SpendingPattern {
  category: string
  amount: number
  percentage: number
  trend: "up" | "down" | "stable"
}

interface SavingTipsSummary {
  totalPotentialSavings: number
  activeTips: number
  appliedTips: number
  highPriorityCount: number
  spendingPatterns: SpendingPattern[]
}

export default function SavingTipsPage() {
  const { user } = useAuth()
  const { data: tipsData, loading, error, refetch } = useSavingTips()
  const [tips, setTips] = React.useState<SavingTip[]>([])
  const [summary, setSummary] = React.useState<SavingTipsSummary | null>(null)
  const [savedTips, setSavedTips] = React.useState<string[]>([])
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  // Sync API data to local state
  React.useEffect(() => {
    if (tipsData) {
      const data = tipsData as unknown as { tips?: SavingTip[]; summary?: SavingTipsSummary; savedTipIds?: string[] } | SavingTip[]
      if (Array.isArray(data)) {
        setTips(data)
      } else {
        setTips(data.tips || [])
        setSummary(data.summary || null)
        setSavedTips(data.savedTipIds || [])
      }
    }
  }, [tipsData])

  const toggleSaveTip = async (tipId: string) => {
    const isSaved = savedTips.includes(tipId)

    // Optimistic update
    setSavedTips(prev =>
      isSaved ? prev.filter(id => id !== tipId) : [...prev, tipId]
    )

    try {
      if (isSaved) {
        await savingTipsApi.dismiss(tipId)
      } else {
        await savingTipsApi.markApplied(tipId)
      }
    } catch (err) {
      // Revert on error
      setSavedTips(prev =>
        isSaved ? [...prev, tipId] : prev.filter(id => id !== tipId)
      )
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  const totalPotentialSavings = summary?.totalPotentialSavings || tips.reduce((sum, tip) => sum + tip.potentialSaving, 0)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-400 bg-green-500/10"
      case "medium": return "text-yellow-400 bg-yellow-500/10"
      case "hard": return "text-red-400 bg-red-500/10"
      default: return "text-muted-foreground bg-white/5"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-red-500/50"
      case "medium": return "border-yellow-500/50"
      case "low": return "border-green-500/50"
      default: return "border-white/10"
    }
  }

  const getCategoryIcon = (category: string) => {
    const lower = category.toLowerCase()
    if (lower.includes('food') || lower.includes('dining') || lower.includes('coffee')) return <IconCoffee className="h-5 w-5" />
    if (lower.includes('shopping') || lower.includes('retail')) return <IconShoppingCart className="h-5 w-5" />
    if (lower.includes('transport') || lower.includes('car') || lower.includes('gas')) return <IconCar className="h-5 w-5" />
    if (lower.includes('home') || lower.includes('housing') || lower.includes('rent')) return <IconHome className="h-5 w-5" />
    if (lower.includes('entertainment') || lower.includes('game')) return <IconDeviceGamepad className="h-5 w-5" />
    if (lower.includes('budget') || lower.includes('alert')) return <IconAlertTriangle className="h-5 w-5" />
    if (lower.includes('saving') || lower.includes('general')) return <IconPigMoney className="h-5 w-5" />
    return <IconReceipt className="h-5 w-5" />
  }

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/10 bg-background/95 backdrop-blur">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />
            <h1 className="text-lg font-semibold">Personalized Saving Tips</h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/10 bg-background/95 backdrop-blur">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />
            <h1 className="text-lg font-semibold">Personalized Saving Tips</h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <IconAlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-muted-foreground">Failed to load saving tips</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <h1 className="text-lg font-semibold">Personalized Saving Tips</h1>
          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <IconRefresh className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Tips
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-green-500/10 to-emerald-500/5 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-500/20">
                  <IconPigMoney className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Potential Monthly Savings</p>
                  <p className="text-xl font-bold text-green-400">${totalPotentialSavings.toFixed(0)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/20">
                  <IconBulb className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active Tips</p>
                  <p className="text-xl font-bold">{summary?.activeTips || tips.length}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-yellow-500/20">
                  <IconBookmarkFilled className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Applied Tips</p>
                  <p className="text-xl font-bold">{summary?.appliedTips || savedTips.length}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-500/5 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/20">
                  <IconTarget className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">High Priority</p>
                  <p className="text-xl font-bold">{summary?.highPriorityCount || tips.filter(t => t.priority === "high").length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights Banner */}
          <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20">
                <IconSparkles className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="font-medium">AI-Powered Insights</p>
                <p className="text-sm text-muted-foreground">
                  These tips are personalized based on your spending patterns, budget goals, and financial habits.
                </p>
              </div>
            </div>
          </div>

          {/* Tips Grid */}
          {tips.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {tips.map(tip => (
                <div
                  key={tip.id}
                  className={`rounded-2xl border-2 ${getPriorityColor(tip.priority)} bg-white/5 p-5 hover:bg-white/10 transition-all`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white/10">
                        {getCategoryIcon(tip.category)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{tip.title}</h3>
                        <span className="text-xs text-muted-foreground">{tip.category}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSaveTip(tip.id)}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      {savedTips.includes(tip.id) || tip.isApplied ? (
                        <IconBookmarkFilled className="h-5 w-5 text-yellow-400" />
                      ) : (
                        <IconBookmark className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{tip.description}</p>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1">
                      <IconTrendingDown className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-medium text-green-400">
                        Save ~${tip.potentialSaving.toFixed(0)}/mo
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(tip.difficulty)}`}>
                      {tip.difficulty}
                    </span>
                  </div>

                  {tip.actionSteps && tip.actionSteps.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Action Steps:</p>
                      <ul className="space-y-1">
                        {tip.actionSteps.map((action, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <IconCheck className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
              <IconBulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Tips Available Yet</h3>
              <p className="text-muted-foreground">
                Add more transactions to get personalized saving tips based on your spending patterns.
              </p>
            </div>
          )}

          {/* Spending Analysis */}
          {summary?.spendingPatterns && summary.spendingPatterns.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2 mb-4">
                <IconChartBar className="h-5 w-5 text-blue-400" />
                <h3 className="font-semibold">Your Spending Breakdown</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {summary.spendingPatterns.slice(0, 8).map(pattern => (
                  <div key={pattern.category} className="p-3 rounded-xl bg-white/5">
                    <p className="text-sm font-medium truncate">{pattern.category}</p>
                    <p className="text-lg font-bold">${pattern.amount.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">{pattern.percentage.toFixed(1)}% of total</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
