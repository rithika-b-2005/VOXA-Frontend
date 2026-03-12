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
  IconUsers,
  IconChevronDown,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconChartBar,
  IconTarget,
  IconMedal,
  IconInfoCircle,
  IconRefresh,
  IconFilter,
  IconLoader2,
  IconAlertTriangle,
} from "@tabler/icons-react"
import { useBenchmarks } from "@/hooks/useApi"
import { useAuth } from "@/contexts/AuthContext"
import { benchmarksApi } from "@/lib/api"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface BenchmarkCategory {
  category: string
  yourSpending: number
  averageSpending: number
  topSaversSpending: number
  percentile: number
  status: "below" | "average" | "above"
}

interface DemographicFilter {
  ageGroup: string
  incomeRange: string
  location: string
}

interface BenchmarkSummary {
  avgPercentile: number
  betterThanAverage: number
  worseThanAverage: number
  totalYourSpending: number
  totalAverageSpending: number
  savingsVsAverage: number
}

export default function BenchmarksPage() {
  const { user } = useAuth()
  const [demographicFilter, setDemographicFilter] = React.useState<DemographicFilter>({
    ageGroup: "25-34",
    incomeRange: "50k-75k",
    location: "urban",
  })
  const { data: benchmarkData, loading, error, refetch } = useBenchmarks(demographicFilter)
  const [benchmarks, setBenchmarks] = React.useState<BenchmarkCategory[]>([])
  const [summary, setSummary] = React.useState<BenchmarkSummary | null>(null)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  // Sync API data to local state
  React.useEffect(() => {
    if (benchmarkData) {
      setBenchmarks((benchmarkData as unknown as BenchmarkCategory[]) || [])
      setSummary(null)
    }
  }, [benchmarkData])

  // Calculate overall stats from benchmarks or use summary from API
  const overallStats = React.useMemo(() => {
    if (summary) {
      return {
        totalYour: summary.totalYourSpending,
        totalAverage: summary.totalAverageSpending,
        avgPercentile: summary.avgPercentile,
        betterThanAverage: summary.betterThanAverage,
        worseThanAverage: summary.worseThanAverage,
        savingsVsAverage: summary.savingsVsAverage,
      }
    }

    const totalYour = benchmarks.reduce((sum, b) => sum + b.yourSpending, 0)
    const totalAverage = benchmarks.reduce((sum, b) => sum + b.averageSpending, 0)
    const avgPercentile = benchmarks.length > 0
      ? benchmarks.reduce((sum, b) => sum + b.percentile, 0) / benchmarks.length
      : 50

    const betterThanAverage = benchmarks.filter(b => b.status === "below").length
    const worseThanAverage = benchmarks.filter(b => b.status === "above").length

    return {
      totalYour,
      totalAverage,
      avgPercentile,
      betterThanAverage,
      worseThanAverage,
      savingsVsAverage: totalAverage - totalYour,
    }
  }, [benchmarks, summary])

  // Chart data
  const chartData = benchmarks.map(b => ({
    name: b.category.length > 12 ? b.category.substring(0, 12) + "..." : b.category,
    fullName: b.category,
    you: b.yourSpending,
    average: b.averageSpending,
    topSavers: b.topSaversSpending,
  }))

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "below":
        return <IconTrendingDown className="h-4 w-4 text-green-400" />
      case "above":
        return <IconTrendingUp className="h-4 w-4 text-red-400" />
      default:
        return <IconMinus className="h-4 w-4 text-yellow-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "below":
        return "text-green-400 bg-green-500/10"
      case "above":
        return "text-red-400 bg-red-500/10"
      default:
        return "text-yellow-400 bg-yellow-500/10"
    }
  }

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 75) return "text-green-400"
    if (percentile >= 50) return "text-yellow-400"
    return "text-red-400"
  }

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/10 bg-background/95 backdrop-blur">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />
            <h1 className="text-lg font-semibold">Similar User Benchmarks</h1>
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
            <h1 className="text-lg font-semibold">Similar User Benchmarks</h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <IconAlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-muted-foreground">Failed to load benchmark data</p>
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
          <h1 className="text-lg font-semibold">Similar User Benchmarks</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <IconRefresh className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Demographic Filters */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 mb-4">
              <IconFilter className="h-5 w-5 text-blue-400" />
              <h3 className="font-semibold">Compare With Similar Users</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Age Group</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {demographicFilter.ageGroup}
                      <IconChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[200px]">
                    <DropdownMenuRadioGroup
                      value={demographicFilter.ageGroup}
                      onValueChange={(value) => setDemographicFilter(prev => ({ ...prev, ageGroup: value }))}
                    >
                      <DropdownMenuRadioItem value="18-24">18-24</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="25-34">25-34</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="35-44">35-44</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="45-54">45-54</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="55+">55+</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Income Range</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      ${demographicFilter.incomeRange}
                      <IconChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[200px]">
                    <DropdownMenuRadioGroup
                      value={demographicFilter.incomeRange}
                      onValueChange={(value) => setDemographicFilter(prev => ({ ...prev, incomeRange: value }))}
                    >
                      <DropdownMenuRadioItem value="25k-50k">$25k - $50k</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="50k-75k">$50k - $75k</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="75k-100k">$75k - $100k</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="100k+">$100k+</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Location Type</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {demographicFilter.location.charAt(0).toUpperCase() + demographicFilter.location.slice(1)}
                      <IconChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[200px]">
                    <DropdownMenuRadioGroup
                      value={demographicFilter.location}
                      onValueChange={(value) => setDemographicFilter(prev => ({ ...prev, location: value }))}
                    >
                      <DropdownMenuRadioItem value="urban">Urban</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="suburban">Suburban</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="rural">Rural</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/20">
                  <IconUsers className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Your Percentile</p>
                  <p className={`text-xl font-bold ${getPercentileColor(overallStats.avgPercentile)}`}>
                    Top {(100 - overallStats.avgPercentile).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-green-500/10 to-emerald-500/5 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-500/20">
                  <IconMedal className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Better Than Average</p>
                  <p className="text-xl font-bold">{overallStats.betterThanAverage} categories</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-yellow-500/20">
                  <IconTarget className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Room to Improve</p>
                  <p className="text-xl font-bold">{overallStats.worseThanAverage} categories</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-500/5 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/20">
                  <IconChartBar className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">vs Average</p>
                  <p className={`text-xl font-bold ${overallStats.savingsVsAverage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {overallStats.savingsVsAverage >= 0 ? '+' : ''}${overallStats.savingsVsAverage.toFixed(0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="font-semibold mb-4">Spending Comparison by Category</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#888', fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fill: '#888' }} tickFormatter={(value) => `$${value}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number, name: string) => [`$${value.toFixed(0)}`, name]}
                      labelFormatter={(label) => {
                        const item = chartData.find(d => d.name === label)
                        return item?.fullName || label
                      }}
                    />
                    <Legend />
                    <Bar dataKey="you" name="Your Spending" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="average" name="Average" fill="#6b7280" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="topSavers" name="Top Savers" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Category Details */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="font-semibold mb-4">Detailed Category Breakdown</h3>
            {benchmarks.length > 0 ? (
              <div className="space-y-3">
                {benchmarks.map(benchmark => (
                  <div
                    key={benchmark.category}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(benchmark.status)}
                      <div>
                        <p className="font-medium">{benchmark.category}</p>
                        <p className="text-sm text-muted-foreground">
                          You: ${benchmark.yourSpending.toFixed(0)} | Avg: ${benchmark.averageSpending.toFixed(0)} | Top: ${benchmark.topSaversSpending.toFixed(0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getPercentileColor(benchmark.percentile)}`}>
                          Top {(100 - benchmark.percentile).toFixed(0)}%
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(benchmark.status)}`}>
                          {benchmark.status === "below" ? "Below Avg" : benchmark.status === "above" ? "Above Avg" : "Average"}
                        </span>
                      </div>
                      <div className="w-24 bg-white/10 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            benchmark.status === "below" ? "bg-green-500" :
                            benchmark.status === "above" ? "bg-red-500" : "bg-yellow-500"
                          }`}
                          style={{ width: `${benchmark.percentile}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <IconChartBar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No benchmark data available yet.</p>
                <p className="text-sm text-muted-foreground">Add transactions to see how you compare with similar users.</p>
              </div>
            )}
          </div>

          {/* Info Note */}
          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4">
            <div className="flex items-start gap-3">
              <IconInfoCircle className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <p className="font-medium text-blue-400">About Benchmarks</p>
                <p className="text-sm text-muted-foreground">
                  Benchmarks are based on anonymized data from users with similar demographics.
                  "Top Savers" represents the 90th percentile of savers in each category.
                  Your spending data is always kept private and secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
