"use client"

import * as React from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  IconChevronDown,
  IconTrendingUp,
  IconTrendingDown,
  IconWallet,
  IconReceipt,
  IconPigMoney,
  IconArrowUpRight,
  IconArrowDownRight,
  IconLoader2,
  IconAlertTriangle,
  IconBell,
  IconCalendar,
} from "@tabler/icons-react"
import { DatePicker } from "@/components/DatePicker"
import { AreaChartComponent } from "@/components/charts/AreaChartComponent"
import { BarChartComponent } from "@/components/charts/BarChartComponent"
import { LineChartComponent } from "@/components/charts/LineChartComponent"
import { PieChartComponent } from "@/components/charts/PieChartComponent"
import { RadarChartComponent } from "@/components/charts/RadarChartComponent"
import { RadialChartComponent } from "@/components/charts/RadialChartComponent"
import Link from "next/link"
import { useDashboard } from "@/hooks/useApi"
import { useAuth } from "@/contexts/AuthContext"
import { budgetsApi, BudgetStatus, BudgetAlert } from "@/lib/api"

const categoryIcons: Record<string, string> = {
  "Food & Dining": "🍔",
  "Transportation": "🚗",
  "Shopping": "🛒",
  "Entertainment": "🎬",
  "Bills & Utilities": "💡",
  "Income": "💰",
  "Travel": "✈️",
  "Other": "📁",
}

const categoryColors = [
  "#22c55e", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444",
  "#10b981", "#ec4899", "#6366f1", "#14b8a6", "#f97316"
]

export default function DashboardPage() {
  const [chartType, setChartType] = React.useState("area")
  const [categoryChartType, setCategoryChartType] = React.useState("pie")
  const [budgetStatus, setBudgetStatus] = React.useState<{ budgets: BudgetStatus[], overall: { totalBudget: number, totalSpent: number, percentage: number } } | null>(null)
  const [budgetAlerts, setBudgetAlerts] = React.useState<BudgetAlert[]>([])

  const { user } = useAuth()
  const { data, loading, error } = useDashboard()

  // Fetch budget data
  React.useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        const [statusRes, alertsRes] = await Promise.all([
          budgetsApi.getStatus(),
          budgetsApi.getAlerts()
        ])
        if (statusRes.data) setBudgetStatus(statusRes.data)
        if (alertsRes.data) setBudgetAlerts(alertsRes.data)
      } catch (err) {
        console.error("Failed to fetch budget data:", err)
      }
    }
    fetchBudgetData()
  }, [])

  // Calculate totals from API data
  const totalExpenses = data?.stats?.total?._sum?.amount || 0
  const expenseCount = data?.stats?.total?._count || 0

  // Calculate income (expenses with positive amounts or Income category)
  const incomeExpenses = data?.expenses?.filter((e: any) => e.amount > 0 || e.category?.name === "Income") || []
  const totalIncome = incomeExpenses.reduce((sum: number, e: any) => sum + Math.abs(e.amount), 0)

  const balance = totalIncome - Math.abs(totalExpenses)
  const expenseChange = 12.5 // TODO: calculate from historical data
  const incomeChange = 8.2 // TODO: calculate from historical data

  // Transform expenses for recent transactions
  const recentTransactions = (data?.expenses || []).slice(0, 5).map((expense: any, index: number) => ({
    id: expense.id,
    payee: expense.merchant || expense.description || "Unknown",
    category: expense.category?.name || "Other",
    amount: expense.amount,
    date: new Date(expense.date).toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
    icon: categoryIcons[expense.category?.name] || "📁"
  }))

  // Use real budget data if available, otherwise fallback to category data
  const budgets = budgetStatus?.budgets?.length
    ? budgetStatus.budgets.map((b) => ({
        category: b.categoryName || "Overall",
        spent: b.spent,
        budget: b.limit,
        color: b.categoryColor || categoryColors[0],
        status: b.status,
        percentage: b.percentage,
        daysRemaining: b.daysRemaining,
        period: b.period
      }))
    : (data?.categories || []).map((cat: any, index: number) => ({
        category: cat.name,
        spent: Math.abs(data?.stats?.byCategory?.find((s: any) => s.categoryId === cat.id)?._sum?.amount || 0),
        budget: 0,
        color: cat.color || categoryColors[index % categoryColors.length],
        status: 'GOOD' as const,
        percentage: 0,
        daysRemaining: 0,
        period: 'MONTHLY'
      }))

  // Transform for category legend
  const categoryLegend = (data?.categories || []).map((cat: any, index: number) => ({
    name: cat.name,
    color: cat.color || categoryColors[index % categoryColors.length],
    amount: Math.abs(data?.stats?.byCategory?.find((s: any) => s.categoryId === cat.id)?._sum?.amount || 0)
  }))

  // Generate dynamic insights based on budget data
  const generateInsights = () => {
    const insights: { type: 'warning' | 'success' | 'info', icon: any, title: string, message: string }[] = []

    if (budgetStatus?.budgets) {
      // Find exceeded budgets
      const exceededBudgets = budgetStatus.budgets.filter(b => b.status === 'EXCEEDED')
      if (exceededBudgets.length > 0) {
        const worst = exceededBudgets.reduce((a, b) => a.percentage > b.percentage ? a : b)
        const overAmount = worst.spent - worst.limit
        insights.push({
          type: 'warning',
          icon: IconAlertTriangle,
          title: `${worst.categoryName || 'Budget'} Alert`,
          message: `You've exceeded your budget by $${overAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
        })
      }

      // Find good budgets (under 50%)
      const goodBudgets = budgetStatus.budgets.filter(b => b.status === 'GOOD' && b.percentage > 0)
      if (goodBudgets.length > 0) {
        const best = goodBudgets.reduce((a, b) => a.percentage < b.percentage ? a : b)
        const savedAmount = best.limit - best.spent
        insights.push({
          type: 'success',
          icon: IconPigMoney,
          title: 'Great Savings!',
          message: `${best.categoryName || 'Budget'} is ${(100 - best.percentage).toFixed(0)}% under budget ($${savedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} remaining)`
        })
      }

      // Warning budgets (50-80%)
      const warningBudgets = budgetStatus.budgets.filter(b => b.status === 'WARNING')
      if (warningBudgets.length > 0) {
        insights.push({
          type: 'info',
          icon: IconBell,
          title: 'Heads Up',
          message: `${warningBudgets.length} budget${warningBudgets.length > 1 ? 's' : ''} at 50%+ usage this period`
        })
      }

      // Critical budgets (80-100%)
      const criticalBudgets = budgetStatus.budgets.filter(b => b.status === 'CRITICAL')
      if (criticalBudgets.length > 0) {
        insights.push({
          type: 'warning',
          icon: IconAlertTriangle,
          title: 'Almost There',
          message: `${criticalBudgets.length} budget${criticalBudgets.length > 1 ? 's are' : ' is'} above 80% usage`
        })
      }
    }

    // Default insights if no budget data
    if (insights.length === 0) {
      insights.push({
        type: 'info',
        icon: IconReceipt,
        title: 'Set Up Budgets',
        message: 'Create category budgets to get spending insights'
      })
    }

    // Always add tips
    if (insights.length < 3) {
      insights.push({
        type: 'info',
        icon: IconReceipt,
        title: 'Tip',
        message: 'Add receipts to track expenses better'
      })
    }

    if (insights.length < 3) {
      insights.push({
        type: 'info',
        icon: IconPigMoney,
        title: 'Save More',
        message: 'Review subscriptions monthly to cut unused services'
      })
    }

    return insights.slice(0, 3)
  }

  const insights = generateInsights()

  if (loading) {
    return (
      <div className="p-4 h-full">
        <div className="rounded-3xl bg-card border border-white/10 h-full overflow-hidden flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 h-full">
        <div className="rounded-3xl bg-card border border-white/10 h-full overflow-hidden flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <p className="text-red-400">Error loading dashboard: {error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 h-full">
      <div className="rounded-3xl bg-card border border-white/10 h-full overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 !h-3" />
          <h1 className="text-lg font-semibold">Dashboard</h1>
          {budgetAlerts.length > 0 && (
            <div className="ml-auto flex items-center gap-2 text-yellow-400">
              <IconBell className="h-4 w-4" />
              <span className="text-sm">{budgetAlerts.length} alert{budgetAlerts.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </header>
        <main className="flex-1 p-6 pt-8 px-10 overflow-auto h-[calc(100%-4rem)]">
          <div className="grid gap-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Good to see you, {user?.firstName || user?.email?.split('@')[0] || 'User'}</h2>
                <p className="text-muted-foreground text-sm mt-1">Here's your financial overview</p>
              </div>
              <DatePicker />
            </div>

            {/* Budget Alert Banner */}
            {budgetAlerts.length > 0 && (
              <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <IconAlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-400">Budget Alerts</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {budgetAlerts.map(a => a.message).join(' • ')}
                    </p>
                  </div>
                  <Link href="/Dashboard/categories">
                    <Button variant="outline" size="sm" className="text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/20">
                      View Budgets
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <IconReceipt className="h-5 w-5 text-red-400" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${expenseChange > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {expenseChange > 0 ? <IconArrowUpRight className="h-4 w-4" /> : <IconArrowDownRight className="h-4 w-4" />}
                    {Math.abs(expenseChange)}%
                  </div>
                </div>
                <p className="text-3xl font-bold mt-4">${Math.abs(totalExpenses).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Expenses</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <IconWallet className="h-5 w-5 text-green-400" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${incomeChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {incomeChange > 0 ? <IconArrowUpRight className="h-4 w-4" /> : <IconArrowDownRight className="h-4 w-4" />}
                    {Math.abs(incomeChange)}%
                  </div>
                </div>
                <p className="text-3xl font-bold mt-4">${totalIncome.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Income</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <IconPigMoney className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {balance >= 0 ? <IconTrendingUp className="h-4 w-4" /> : <IconTrendingDown className="h-4 w-4" />}
                    {balance >= 0 ? 'Surplus' : 'Deficit'}
                  </div>
                </div>
                <p className={`text-3xl font-bold mt-4 ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${Math.abs(balance).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Balance</p>
              </div>

              {/* Budget Overview Card */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <IconCalendar className="h-5 w-5 text-purple-400" />
                  </div>
                  {budgetStatus?.overall && (
                    <div className={`flex items-center gap-1 text-sm ${budgetStatus.overall.percentage >= 100 ? 'text-red-400' : budgetStatus.overall.percentage >= 80 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {budgetStatus.overall.percentage.toFixed(0)}% used
                    </div>
                  )}
                </div>
                <p className="text-3xl font-bold mt-4">
                  ${(budgetStatus?.overall?.totalBudget || 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Total Budget</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Transaction Trend Chart */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Spending Trend</h2>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1">
                        {chartType === "area" && "Area Chart"}
                        {chartType === "line" && "Line Chart"}
                        {chartType === "bar" && "Bar Chart"}
                        <IconChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-40">
                      <DropdownMenuRadioGroup value={chartType} onValueChange={setChartType}>
                        <DropdownMenuRadioItem value="area">Area Chart</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="line">Line Chart</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="bar">Bar Chart</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {chartType === "area" && <AreaChartComponent />}
                {chartType === "line" && <LineChartComponent />}
                {chartType === "bar" && <BarChartComponent />}
              </div>

              {/* Category Pie Chart */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">By Category</h2>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1">
                        {categoryChartType === "pie" && "Pie"}
                        {categoryChartType === "radar" && "Radar"}
                        {categoryChartType === "radial" && "Radial"}
                        <IconChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-40">
                      <DropdownMenuRadioGroup value={categoryChartType} onValueChange={setCategoryChartType}>
                        <DropdownMenuRadioItem value="pie">Pie Chart</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="radar">Radar Chart</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="radial">Radial Chart</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div>
                  {categoryChartType === "pie" && <PieChartComponent />}
                  {categoryChartType === "radar" && <RadarChartComponent />}
                  {categoryChartType === "radial" && <RadialChartComponent />}
                </div>
                {/* Category Legend */}
                <div className="mt-4 space-y-2">
                  {categoryLegend.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-muted-foreground">{cat.name}</span>
                      </div>
                      <span className="font-medium">${cat.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Budget Progress & Recent Transactions */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Budget Progress */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Budget Progress</h2>
                  <Link href="/Dashboard/categories">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                      Manage
                    </Button>
                  </Link>
                </div>
                <div className="space-y-4">
                  {budgets.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground text-sm">No budgets set up yet</p>
                      <Link href="/Dashboard/categories">
                        <Button variant="outline" size="sm" className="mt-3">
                          Create Budget
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    budgets.slice(0, 5).map((budget) => {
                      const isOver = budget.spent > budget.budget && budget.budget > 0
                      const statusColor = budget.status === 'EXCEEDED' ? 'text-red-400'
                        : budget.status === 'CRITICAL' ? 'text-orange-400'
                        : budget.status === 'WARNING' ? 'text-yellow-400'
                        : 'text-muted-foreground'

                      return (
                        <div key={budget.category}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{budget.category}</span>
                              {budget.period && (
                                <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded bg-white/5">
                                  {budget.period.charAt(0) + budget.period.slice(1).toLowerCase()}
                                </span>
                              )}
                            </div>
                            <span className={`text-sm ${statusColor}`}>
                              {budget.budget > 0 ? (
                                <>
                                  ${budget.spent.toLocaleString(undefined, { maximumFractionDigits: 0 })} / ${budget.budget.toLocaleString()}
                                </>
                              ) : (
                                <span className="text-muted-foreground">No limit</span>
                              )}
                            </span>
                          </div>
                          {budget.budget > 0 && (
                            <>
                              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : ''}`}
                                  style={{
                                    width: `${Math.min(budget.percentage, 100)}%`,
                                    backgroundColor: isOver ? undefined : budget.color
                                  }}
                                />
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <span className={`text-xs ${statusColor}`}>
                                  {budget.percentage.toFixed(0)}%
                                </span>
                                {budget.daysRemaining !== undefined && budget.daysRemaining > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    {budget.daysRemaining} days left
                                  </span>
                                )}
                              </div>
                              {isOver && (
                                <p className="text-xs text-red-400 mt-1">
                                  Over budget by ${(budget.spent - budget.budget).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Recent Transactions</h2>
                  <Link href="/Dashboard/transaction">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                      View All
                    </Button>
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentTransactions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground text-sm">No transactions yet</p>
                    </div>
                  ) : (
                    recentTransactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg">
                            {tx.icon}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{tx.payee}</p>
                            <p className="text-xs text-muted-foreground">{tx.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${tx.amount >= 0 ? 'text-green-400' : ''}`}>
                            {tx.amount >= 0 ? '+' : ''}{tx.amount < 0 ? '-' : ''}${Math.abs(tx.amount).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">{tx.date}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Spending Insights */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6">
              <h2 className="text-lg font-semibold mb-3">Spending Insights</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {insights.map((insight, index) => {
                  const IconComponent = insight.icon
                  const bgColor = insight.type === 'warning' ? 'bg-yellow-500/20'
                    : insight.type === 'success' ? 'bg-green-500/20'
                    : 'bg-blue-500/20'
                  const iconColor = insight.type === 'warning' ? 'text-yellow-400'
                    : insight.type === 'success' ? 'text-green-400'
                    : 'text-blue-400'

                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${bgColor}`}>
                        <IconComponent className={`h-5 w-5 ${iconColor}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{insight.title}</p>
                        <p className="text-xs text-muted-foreground">{insight.message}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
