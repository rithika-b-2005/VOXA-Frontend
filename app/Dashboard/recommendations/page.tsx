"use client"

import * as React from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  IconBook,
  IconVideo,
  IconNews,
  IconHeadphones,
  IconExternalLink,
  IconBookmark,
  IconBookmarkFilled,
  IconSparkles,
  IconFilter,
  IconClock,
  IconTrendingUp,
  IconPigMoney,
  IconChartLine,
  IconCreditCard,
  IconHome,
  IconShoppingCart,
  IconRefresh,
  IconCheck,
  IconLoader2,
  IconAlertTriangle,
} from "@tabler/icons-react"
import { useRecommendations } from "@/hooks/useApi"
import { useAuth } from "@/contexts/AuthContext"
import { recommendationsApi } from "@/lib/api"

interface ContentItem {
  id: string
  title: string
  description: string
  type: "article" | "video" | "podcast" | "course"
  category: string
  readTime: string
  url: string
  thumbnail?: string
  author?: string
  relevanceScore: number
  tags: string[]
  isSaved?: boolean
  isCompleted?: boolean
}

interface RecommendationsSummary {
  totalContent: number
  savedCount: number
  completedCount: number
  topMatchScore: number
  categories: string[]
}

export default function RecommendationsPage() {
  const { user } = useAuth()
  const [selectedType, setSelectedType] = React.useState<string>("all")
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")
  const { data: recommendationsData, loading, error, refetch } = useRecommendations(selectedType !== "all" ? selectedType : undefined)
  const [content, setContent] = React.useState<ContentItem[]>([])
  const [summary, setSummary] = React.useState<RecommendationsSummary | null>(null)
  const [savedContent, setSavedContent] = React.useState<string[]>([])
  const [completedContent, setCompletedContent] = React.useState<string[]>([])
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  // Sync API data to local state
  React.useEffect(() => {
    if (recommendationsData) {
      setContent(recommendationsData.items || [])
      setSummary(recommendationsData.summary || null)
      setSavedContent(recommendationsData.savedIds || [])
      setCompletedContent(recommendationsData.completedIds || [])
    }
  }, [recommendationsData])

  // Filter content by category (client-side since type filtering is done via API)
  const filteredContent = React.useMemo(() => {
    if (selectedCategory === "all") return content
    return content.filter(item => item.category === selectedCategory)
  }, [content, selectedCategory])

  // Get unique categories
  const categories = React.useMemo(() => {
    if (summary?.categories) return summary.categories
    return [...new Set(content.map(c => c.category))]
  }, [content, summary])

  const toggleSave = async (id: string) => {
    const isSaved = savedContent.includes(id)

    // Optimistic update
    setSavedContent(prev =>
      isSaved ? prev.filter(i => i !== id) : [...prev, id]
    )

    try {
      if (isSaved) {
        await recommendationsApi.unsave(id)
      } else {
        await recommendationsApi.save(id)
      }
    } catch (err) {
      // Revert on error
      setSavedContent(prev =>
        isSaved ? [...prev, id] : prev.filter(i => i !== id)
      )
    }
  }

  const toggleComplete = async (id: string) => {
    const isCompleted = completedContent.includes(id)

    // Optimistic update
    setCompletedContent(prev =>
      isCompleted ? prev.filter(i => i !== id) : [...prev, id]
    )

    try {
      if (!isCompleted) {
        await recommendationsApi.markCompleted(id)
      }
    } catch (err) {
      // Revert on error
      setCompletedContent(prev =>
        isCompleted ? [...prev, id] : prev.filter(i => i !== id)
      )
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "article":
        return <IconNews className="h-4 w-4" />
      case "video":
        return <IconVideo className="h-4 w-4" />
      case "podcast":
        return <IconHeadphones className="h-4 w-4" />
      case "course":
        return <IconBook className="h-4 w-4" />
      default:
        return <IconNews className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "article":
        return "text-blue-400 bg-blue-500/10"
      case "video":
        return "text-red-400 bg-red-500/10"
      case "podcast":
        return "text-purple-400 bg-purple-500/10"
      case "course":
        return "text-green-400 bg-green-500/10"
      default:
        return "text-gray-400 bg-gray-500/10"
    }
  }

  const getCategoryIcon = (category: string) => {
    const lower = category.toLowerCase()
    if (lower.includes("budget")) return <IconChartLine className="h-5 w-5" />
    if (lower.includes("saving")) return <IconPigMoney className="h-5 w-5" />
    if (lower.includes("debt") || lower.includes("credit")) return <IconCreditCard className="h-5 w-5" />
    if (lower.includes("invest")) return <IconTrendingUp className="h-5 w-5" />
    if (lower.includes("housing") || lower.includes("home")) return <IconHome className="h-5 w-5" />
    if (lower.includes("food") || lower.includes("shop")) return <IconShoppingCart className="h-5 w-5" />
    return <IconBook className="h-5 w-5" />
  }

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/10 bg-background/95 backdrop-blur">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />
            <h1 className="text-lg font-semibold">Content Recommendations</h1>
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
            <h1 className="text-lg font-semibold">Content Recommendations</h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <IconAlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-muted-foreground">Failed to load recommendations</p>
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
          <h1 className="text-lg font-semibold">Content Recommendations</h1>
          <div className="ml-auto">
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
          {/* AI Banner */}
          <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20">
                <IconSparkles className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="font-medium">Personalized For You</p>
                <p className="text-sm text-muted-foreground">
                  Content recommendations based on your spending patterns and financial interests.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/20">
                  <IconBook className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Available Content</p>
                  <p className="text-xl font-bold">{summary?.totalContent || content.length}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-yellow-500/20">
                  <IconBookmarkFilled className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Saved</p>
                  <p className="text-xl font-bold">{summary?.savedCount || savedContent.length}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-green-500/10 to-emerald-500/5 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-500/20">
                  <IconCheck className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="text-xl font-bold">{summary?.completedCount || completedContent.length}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-500/5 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/20">
                  <IconTrendingUp className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Top Match</p>
                  <p className="text-xl font-bold">{summary?.topMatchScore || filteredContent[0]?.relevanceScore || 0}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <IconFilter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filter:</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {["all", "article", "video", "podcast", "course"].map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedType === type
                      ? "bg-white text-black"
                      : "bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10"
                  }`}
                >
                  {type === "all" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === "all"
                    ? "bg-white text-black"
                    : "bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10"
                }`}
              >
                All Topics
              </button>
              {categories.slice(0, 6).map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-white text-black"
                      : "bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContent.map(item => (
              <div
                key={item.id}
                className={`rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition-all ${
                  completedContent.includes(item.id) || item.isCompleted ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg ${getTypeColor(item.type)}`}>
                      {getTypeIcon(item.type)}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleComplete(item.id)}
                      className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                        completedContent.includes(item.id) || item.isCompleted ? "text-green-400" : "text-muted-foreground"
                      }`}
                      title={completedContent.includes(item.id) || item.isCompleted ? "Mark as incomplete" : "Mark as complete"}
                    >
                      <IconCheck className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleSave(item.id)}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      {savedContent.includes(item.id) || item.isSaved ? (
                        <IconBookmarkFilled className="h-4 w-4 text-yellow-400" />
                      ) : (
                        <IconBookmark className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-white/5">
                    {getCategoryIcon(item.category)}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{item.category}</span>
                </div>

                <h3 className="font-semibold mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconClock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{item.readTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Match:</span>
                    <span className={`text-xs font-medium ${
                      item.relevanceScore >= 85 ? "text-green-400" :
                      item.relevanceScore >= 70 ? "text-yellow-400" : "text-muted-foreground"
                    }`}>
                      {item.relevanceScore}%
                    </span>
                  </div>
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {item.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => window.open(item.url, '_blank')}
                >
                  <IconExternalLink className="h-4 w-4 mr-2" />
                  {item.type === "article" ? "Read Article" :
                   item.type === "video" ? "Watch Video" :
                   item.type === "podcast" ? "Listen Now" : "Start Course"}
                </Button>
              </div>
            ))}
          </div>

          {filteredContent.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
              <IconBook className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Content Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters to see more recommendations.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
