"use client"

import * as React from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  IconUser,
  IconMail,
  IconPhone,
  IconCrown,
  IconLoader2,
  IconPigMoney,
  IconShoppingCart,
  IconScale,
  IconTarget,
  IconTrendingUp,
  IconTrendingDown,
  IconChartPie,
  IconMoodHappy,
  IconMoodSad,
  IconBulb,
  IconCheck,
  IconStar,
} from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import { useDashboard } from "@/hooks/useApi"
import { budgetsApi, userApi, BudgetStatus } from "@/lib/api"

type SpendingPersonality = 'SAVER' | 'SPENDER' | 'BALANCED' | 'INVESTOR' | 'IMPULSIVE'

interface PersonalityProfile {
  type: SpendingPersonality
  title: string
  description: string
  icon: any
  color: string
  tips: string[]
  traits: string[]
}

const personalityProfiles: Record<SpendingPersonality, PersonalityProfile> = {
  SAVER: {
    type: 'SAVER',
    title: 'The Saver',
    description: 'You prioritize saving money and are very mindful of your spending. You rarely exceed budgets and prefer to save for the future.',
    icon: IconPigMoney,
    color: '#10B981',
    tips: [
      'Consider investing some savings for growth',
      'Set aside a small "fun money" budget',
      'Review if you\'re missing out on valuable experiences',
    ],
    traits: ['Frugal', 'Disciplined', 'Future-focused', 'Risk-averse'],
  },
  SPENDER: {
    type: 'SPENDER',
    title: 'The Spender',
    description: 'You enjoy spending on experiences and things you love. You believe in living in the moment but may need to watch your budgets.',
    icon: IconShoppingCart,
    color: '#EF4444',
    tips: [
      'Set up automatic savings before spending',
      'Use the 24-hour rule for non-essential purchases',
      'Track subscriptions to avoid waste',
    ],
    traits: ['Generous', 'Experience-focused', 'Spontaneous', 'Present-minded'],
  },
  BALANCED: {
    type: 'BALANCED',
    title: 'The Balanced',
    description: 'You have a healthy relationship with money. You save consistently while also enjoying your earnings responsibly.',
    icon: IconScale,
    color: '#3B82F6',
    tips: [
      'Keep up the great work!',
      'Consider increasing investment contributions',
      'Set new financial goals to stay motivated',
    ],
    traits: ['Moderate', 'Thoughtful', 'Consistent', 'Well-planned'],
  },
  INVESTOR: {
    type: 'INVESTOR',
    title: 'The Investor',
    description: 'You focus on growing your wealth through investments and are always looking for opportunities to make your money work for you.',
    icon: IconTrendingUp,
    color: '#8B5CF6',
    tips: [
      'Diversify your investment portfolio',
      'Maintain an emergency fund',
      'Don\'t forget to enjoy some earnings today',
    ],
    traits: ['Strategic', 'Growth-oriented', 'Patient', 'Analytical'],
  },
  IMPULSIVE: {
    type: 'IMPULSIVE',
    title: 'The Impulsive',
    description: 'You make quick spending decisions and may regret some purchases later. Building awareness of spending triggers can help.',
    icon: IconMoodSad,
    color: '#F59E0B',
    tips: [
      'Wait 48 hours before large purchases',
      'Unsubscribe from marketing emails',
      'Set spending limits on cards',
    ],
    traits: ['Spontaneous', 'Emotional', 'Quick-decision', 'Trend-following'],
  },
}

export default function ProfilePage() {
  const { user, refetchUser } = useAuth()
  const { data: dashboardData } = useDashboard()
  const [budgetStatus, setBudgetStatus] = React.useState<{ budgets: BudgetStatus[], overall: { totalBudget: number, totalSpent: number, percentage: number } } | null>(null)
  const [isEditing, setIsEditing] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [firstName, setFirstName] = React.useState(user?.firstName || '')
  const [lastName, setLastName] = React.useState(user?.lastName || '')
  const [phone, setPhone] = React.useState(user?.phone || '')

  // Fetch budget data
  React.useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        const { data } = await budgetsApi.getStatus()
        if (data) setBudgetStatus(data)
      } catch (err) {
        console.error("Failed to fetch budget data:", err)
      }
    }
    fetchBudgetData()
  }, [])

  React.useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '')
      setLastName(user.lastName || '')
      setPhone(user.phone || '')
    }
  }, [user])

  // Calculate spending personality based on budget behavior
  const calculatePersonality = (): SpendingPersonality => {
    if (!budgetStatus?.budgets?.length) return 'BALANCED'

    const totalBudgeted = budgetStatus.overall.totalBudget
    const totalSpent = budgetStatus.overall.totalSpent

    if (totalBudgeted === 0) return 'SPENDER'

    const spendingRatio = totalSpent / totalBudgeted

    // Check exceeded budgets
    const exceededCount = budgetStatus.budgets.filter(b => b.status === 'EXCEEDED').length
    const goodCount = budgetStatus.budgets.filter(b => b.status === 'GOOD').length
    const totalBudgets = budgetStatus.budgets.length

    if (exceededCount > totalBudgets * 0.5) return 'IMPULSIVE'
    if (spendingRatio > 1.2) return 'SPENDER'
    if (spendingRatio < 0.4) return 'SAVER'
    if (goodCount > totalBudgets * 0.7 && spendingRatio < 0.7) return 'INVESTOR'
    return 'BALANCED'
  }

  const personality = personalityProfiles[calculatePersonality()]

  // Calculate financial health score (0-100)
  const calculateHealthScore = () => {
    if (!budgetStatus?.budgets?.length) return 50

    let score = 50

    const spendingRatio = budgetStatus.overall.percentage / 100

    // Under budget is good
    if (spendingRatio <= 0.8) score += 30
    else if (spendingRatio <= 1.0) score += 15
    else score -= 20

    // Bonus for having budgets set
    score += Math.min(budgetStatus.budgets.length * 3, 15)

    // Penalty for exceeded budgets
    const exceededCount = budgetStatus.budgets.filter(b => b.status === 'EXCEEDED').length
    score -= exceededCount * 5

    return Math.max(0, Math.min(100, score))
  }

  const healthScore = calculateHealthScore()

  const getHealthLabel = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-400' }
    if (score >= 60) return { label: 'Good', color: 'text-blue-400' }
    if (score >= 40) return { label: 'Fair', color: 'text-yellow-400' }
    return { label: 'Needs Work', color: 'text-red-400' }
  }

  const healthLabel = getHealthLabel(healthScore)

  const handleSaveProfile = async () => {
    setIsSubmitting(true)
    try {
      const { error } = await userApi.updateProfile({
        firstName,
        lastName,
        phone,
      })
      if (!error) {
        setIsEditing(false)
        refetchUser()
      }
    } catch (err) {
      console.error("Failed to update profile:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate spending insights
  const topCategories = React.useMemo(() => {
    if (!budgetStatus?.budgets) return []
    return budgetStatus.budgets
      .filter(b => b.spent > 0)
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 3)
  }, [budgetStatus])

  return (
    <div className="p-4 h-full">
      <div className="rounded-3xl bg-card border border-white/10 h-full overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 !h-3" />
          <h1 className="text-lg font-semibold">Profile & Insights</h1>
        </header>
        <main className="flex-1 p-6 pt-8 px-10 overflow-auto h-[calc(100%-4rem)]">
          <div className="grid gap-6 max-w-6xl mx-auto">

            {/* Profile Card & Financial Health */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Profile Card */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Your Profile</h2>
                  {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      Edit
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl font-bold">
                    {(user?.firstName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                  </div>
                  <div>
                    <p className="text-lg font-semibold">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user?.email?.split('@')[0] || 'User'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {user?.isPremium ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-xs">
                          <IconCrown className="h-3 w-3" />
                          Premium
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-white/10 text-muted-foreground text-xs">
                          Free Plan
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">First Name</label>
                        <Input
                          className="bg-white/5 border-white/10"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Last Name</label>
                        <Input
                          className="bg-white/5 border-white/10"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        className="bg-white/5 border-white/10 opacity-60"
                        value={user?.email || ''}
                        disabled
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Phone</label>
                      <Input
                        className="bg-white/5 border-white/10"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button
                        className="flex-1 bg-white text-black hover:bg-white/90"
                        onClick={handleSaveProfile}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <IconLoader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                      <IconMail className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">{user?.email}</span>
                    </div>
                    {user?.phone && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                        <IconPhone className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">{user.phone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Financial Health Score */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-semibold mb-6">Financial Health Score</h2>

                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <svg className="w-40 h-40 transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-white/10"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={`${(healthScore / 100) * 440} 440`}
                        strokeLinecap="round"
                        className={healthScore >= 80 ? 'text-green-500' : healthScore >= 60 ? 'text-blue-500' : healthScore >= 40 ? 'text-yellow-500' : 'text-red-500'}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold">{healthScore}</span>
                      <span className={`text-sm ${healthLabel.color}`}>{healthLabel.label}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-sm text-muted-foreground">Budget Usage</span>
                    <span className="text-sm font-medium">{budgetStatus?.overall?.percentage?.toFixed(0) || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-sm text-muted-foreground">Budgets on Track</span>
                    <span className="text-sm font-medium">
                      {budgetStatus?.budgets?.filter(b => b.status === 'GOOD' || b.status === 'WARNING').length || 0} / {budgetStatus?.budgets?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Spending Personality */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-white/[0.02] p-6">
              <h2 className="text-xl font-semibold mb-6">Your Spending Personality</h2>

              <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                {/* Personality Card */}
                <div
                  className="rounded-2xl p-6"
                  style={{ backgroundColor: `${personality.color}10`, borderColor: `${personality.color}30`, borderWidth: 1 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: `${personality.color}20` }}
                    >
                      <personality.icon className="h-6 w-6" style={{ color: personality.color }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: personality.color }}>
                        {personality.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {personality.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {personality.traits.map((trait) => (
                      <span
                        key={trait}
                        className="px-2 py-1 rounded text-xs"
                        style={{ backgroundColor: `${personality.color}20`, color: personality.color }}
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tips & Insights */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <IconBulb className="h-4 w-4 text-yellow-400" />
                      Personalized Tips
                    </h4>
                    <div className="space-y-2">
                      {personality.tips.map((tip, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-white/5">
                          <IconCheck className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                          <span className="text-sm">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Spending Categories */}
                  {topCategories.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <IconChartPie className="h-4 w-4 text-blue-400" />
                        Top Spending Categories
                      </h4>
                      <div className="space-y-2">
                        {topCategories.map((cat, index) => (
                          <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{index + 1}.</span>
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: cat.categoryColor || '#A3A3A3' }}
                              />
                              <span className="text-sm">{cat.categoryName || 'Uncategorized'}</span>
                            </div>
                            <span className="text-sm font-medium">${cat.spent.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* All Personality Types */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold mb-6">All Spending Personalities</h2>
              <div className="grid gap-4 md:grid-cols-5">
                {Object.values(personalityProfiles).map((profile) => {
                  const isCurrentType = profile.type === personality.type
                  const Icon = profile.icon
                  return (
                    <div
                      key={profile.type}
                      className={`rounded-xl p-4 border transition-all ${
                        isCurrentType
                          ? 'border-white/30 bg-white/10'
                          : 'border-white/5 bg-white/[0.02] opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${profile.color}20` }}
                        >
                          <Icon className="h-4 w-4" style={{ color: profile.color }} />
                        </div>
                        {isCurrentType && (
                          <IconStar className="h-4 w-4 text-yellow-400" />
                        )}
                      </div>
                      <h4 className="text-sm font-semibold" style={{ color: isCurrentType ? profile.color : undefined }}>
                        {profile.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {profile.description.slice(0, 80)}...
                      </p>
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
