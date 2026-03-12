"use client"

import * as React from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  IconPlus,
  IconSearch,
  IconTrash,
  IconEdit,
  IconTarget,
  IconPlane,
  IconCar,
  IconHome,
  IconDeviceLaptop,
  IconSchool,
  IconHeartHandshake,
  IconPigMoney,
  IconCurrencyDollar,
  IconLoader2,
  IconCheck,
  IconTrendingUp,
  IconCalendar,
  IconGift,
  IconBeach,
  IconBriefcase,
} from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useGoals } from "@/hooks/useApi"
import { goalsApi, CreateGoalData } from "@/lib/api"

interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: Date | null
  icon: string
  color: string
  monthlyContribution: number
  isCompleted: boolean
  createdAt: Date
  notes?: string
}

const iconOptions = [
  { icon: IconPlane, name: "Travel", color: "#3B82F6" },
  { icon: IconCar, name: "Car", color: "#6366F1" },
  { icon: IconHome, name: "Home", color: "#8B5CF6" },
  { icon: IconDeviceLaptop, name: "Tech", color: "#EC4899" },
  { icon: IconSchool, name: "Education", color: "#F59E0B" },
  { icon: IconHeartHandshake, name: "Wedding", color: "#EF4444" },
  { icon: IconPigMoney, name: "Emergency", color: "#10B981" },
  { icon: IconGift, name: "Gift", color: "#F97316" },
  { icon: IconBeach, name: "Vacation", color: "#14B8A6" },
  { icon: IconBriefcase, name: "Business", color: "#64748B" },
  { icon: IconCurrencyDollar, name: "Other", color: "#A3A3A3" },
]

export default function GoalsPage() {
  const { data: apiGoals, loading, error, refetch } = useGoals()
  const [goals, setGoals] = React.useState<SavingsGoal[]>([])
  const [saving, setSaving] = React.useState(false)

  // Sync API data to local state
  React.useEffect(() => {
    if (apiGoals) {
      setGoals(apiGoals.map(g => ({
        id: g.id,
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        deadline: g.deadline ? new Date(g.deadline) : null,
        icon: g.icon || 'Other',
        color: g.color || '#A3A3A3',
        monthlyContribution: g.monthlyContribution || 0,
        isCompleted: g.isCompleted,
        createdAt: new Date(g.createdAt),
        notes: g.description,
      })))
    }
  }, [apiGoals])
  const [selectedRows, setSelectedRows] = React.useState<string[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterStatus, setFilterStatus] = React.useState<'all' | 'active' | 'completed'>('all')

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [contributeOpen, setContributeOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)

  // Form states
  const [formName, setFormName] = React.useState("")
  const [formTarget, setFormTarget] = React.useState("")
  const [formCurrent, setFormCurrent] = React.useState("")
  const [formDeadline, setFormDeadline] = React.useState("")
  const [formIcon, setFormIcon] = React.useState("Other")
  const [formMonthly, setFormMonthly] = React.useState("")
  const [formNotes, setFormNotes] = React.useState("")

  const [contributeAmount, setContributeAmount] = React.useState("")
  const [contributeGoalId, setContributeGoalId] = React.useState<string | null>(null)

  // Filter goals
  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.name.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false

    switch (filterStatus) {
      case 'active': return !goal.isCompleted
      case 'completed': return goal.isCompleted
      default: return true
    }
  }).sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1
    return b.currentAmount / b.targetAmount - a.currentAmount / a.targetAmount
  })

  // Calculate stats
  const activeGoals = goals.filter(g => !g.isCompleted)
  const totalTargeted = activeGoals.reduce((sum, g) => sum + g.targetAmount, 0)
  const totalSaved = activeGoals.reduce((sum, g) => sum + g.currentAmount, 0)
  const totalMonthly = activeGoals.reduce((sum, g) => sum + g.monthlyContribution, 0)
  const completedGoals = goals.filter(g => g.isCompleted)

  const toggleRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selectedRows.length === filteredGoals.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(filteredGoals.map(g => g.id))
    }
  }

  const resetForm = () => {
    setFormName("")
    setFormTarget("")
    setFormCurrent("")
    setFormDeadline("")
    setFormIcon("Other")
    setFormMonthly("")
    setFormNotes("")
    setEditingId(null)
  }

  const handleAdd = () => {
    resetForm()
    setDialogOpen(true)
  }

  const handleEdit = () => {
    if (selectedRows.length === 1) {
      const goal = goals.find(g => g.id === selectedRows[0])
      if (goal) {
        setFormName(goal.name)
        setFormTarget(goal.targetAmount.toString())
        setFormCurrent(goal.currentAmount.toString())
        setFormDeadline(goal.deadline ? goal.deadline.toISOString().split('T')[0] : "")
        setFormIcon(goal.icon)
        setFormMonthly(goal.monthlyContribution.toString())
        setFormNotes(goal.notes || "")
        setEditingId(goal.id)
        setDialogOpen(true)
      }
    }
  }

  const handleDelete = async () => {
    for (const id of selectedRows) {
      await goalsApi.delete(id)
    }
    refetch()
    setSelectedRows([])
  }

  const handleSave = async () => {
    setSaving(true)
    const goalData: CreateGoalData = {
      name: formName,
      targetAmount: parseFloat(formTarget),
      currentAmount: parseFloat(formCurrent) || 0,
      deadline: formDeadline || undefined,
      icon: formIcon,
      color: iconOptions.find(i => i.name === formIcon)?.color || '#A3A3A3',
      monthlyContribution: parseFloat(formMonthly) || 0,
      description: formNotes || undefined,
    }

    if (editingId) {
      const result = await goalsApi.update(editingId, goalData)
      if (!result.error) refetch()
    } else {
      const result = await goalsApi.create(goalData)
      if (!result.error) refetch()
    }

    setSaving(false)
    setDialogOpen(false)
    setSelectedRows([])
    resetForm()
  }

  const handleContribute = (goalId: string) => {
    setContributeGoalId(goalId)
    setContributeAmount("")
    setContributeOpen(true)
  }

  const handleSaveContribution = async () => {
    if (!contributeGoalId) return
    const amount = parseFloat(contributeAmount)
    if (isNaN(amount) || amount <= 0) return

    const result = await goalsApi.contribute(contributeGoalId, amount)
    if (!result.error) refetch()

    setContributeOpen(false)
    setContributeGoalId(null)
    setContributeAmount("")
  }

  const getIconComponent = (iconName: string) => {
    const found = iconOptions.find(i => i.name === iconName)
    return found ? found.icon : IconCurrencyDollar
  }

  const getIconColor = (iconName: string) => {
    const found = iconOptions.find(i => i.name === iconName)
    return found ? found.color : "#A3A3A3"
  }

  const calculateTimeRemaining = (deadline: Date | null) => {
    if (!deadline) return null
    const days = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (days < 0) return { text: 'Overdue', color: 'text-red-400' }
    if (days === 0) return { text: 'Today', color: 'text-yellow-400' }
    if (days <= 30) return { text: `${days} days`, color: 'text-yellow-400' }
    if (days <= 90) return { text: `${Math.ceil(days / 7)} weeks`, color: 'text-blue-400' }
    return { text: `${Math.ceil(days / 30)} months`, color: 'text-muted-foreground' }
  }

  const calculateProjectedDate = (goal: SavingsGoal) => {
    if (goal.isCompleted || goal.monthlyContribution <= 0) return null
    const remaining = goal.targetAmount - goal.currentAmount
    const monthsNeeded = Math.ceil(remaining / goal.monthlyContribution)
    const projectedDate = new Date()
    projectedDate.setMonth(projectedDate.getMonth() + monthsNeeded)
    return projectedDate
  }

  if (loading) {
    return (
      <div className="p-4 h-full">
        <div className="rounded-3xl bg-card border border-white/10 h-full overflow-hidden flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading goals...</p>
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
            <p className="text-red-400">Error loading goals: {error}</p>
            <Button variant="outline" onClick={() => refetch()}>Retry</Button>
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
          <h1 className="text-lg font-semibold">Savings Goals</h1>
        </header>
        <main className="flex-1 p-6 pt-8 px-10 overflow-auto h-[calc(100%-4rem)]">
          <div className="grid gap-6 max-w-7xl mx-auto">

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <IconTarget className="h-5 w-5 text-blue-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">Active Goals</span>
                </div>
                <p className="text-2xl font-bold">{activeGoals.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {completedGoals.length} completed
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <IconTrendingUp className="h-5 w-5 text-purple-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">Total Targeted</span>
                </div>
                <p className="text-2xl font-bold">${totalTargeted.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  across all active goals
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <IconPigMoney className="h-5 w-5 text-green-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">Total Saved</span>
                </div>
                <p className="text-2xl font-bold text-green-400">${totalSaved.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalTargeted > 0 ? ((totalSaved / totalTargeted) * 100).toFixed(0) : 0}% of target
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <IconCalendar className="h-5 w-5 text-yellow-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">Monthly Savings</span>
                </div>
                <p className="text-2xl font-bold">${totalMonthly.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  planned contributions
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Your Goals</h2>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleAdd}>
                <IconPlus className="h-4 w-4" />
                Add Goal
              </Button>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              if (!open) {
                setDialogOpen(false)
                resetForm()
              }
            }}>
              <DialogContent className="bg-black border border-white/20 p-6 sm:max-w-[500px] rounded-xl shadow-[0_0_40px_rgba(192,192,192,0.5)]">
                <DialogHeader>
                  <DialogTitle className="text-xl">{editingId ? 'Edit Goal' : 'Create Savings Goal'}</DialogTitle>
                  <DialogDescription>
                    {editingId ? 'Update your savings goal.' : 'Set a new savings goal to track your progress.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Goal Name</label>
                    <Input
                      placeholder="e.g. Dream Vacation to Japan"
                      className="bg-white/5 border-white/10"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Target Amount ($)</label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g. 5000"
                        className="bg-white/5 border-white/10"
                        value={formTarget}
                        onChange={(e) => setFormTarget(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Already Saved ($)</label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g. 1000"
                        className="bg-white/5 border-white/10"
                        value={formCurrent}
                        onChange={(e) => setFormCurrent(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Target Date (Optional)</label>
                      <Input
                        type="date"
                        className="bg-white/5 border-white/10"
                        value={formDeadline}
                        onChange={(e) => setFormDeadline(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Monthly Contribution ($)</label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g. 400"
                        className="bg-white/5 border-white/10"
                        value={formMonthly}
                        onChange={(e) => setFormMonthly(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Icon</label>
                    <div className="flex gap-2 flex-wrap">
                      {iconOptions.map((opt) => {
                        const Icon = opt.icon
                        return (
                          <button
                            key={opt.name}
                            className={`p-2 rounded-lg border-2 ${formIcon === opt.name ? 'border-white' : 'border-transparent'} bg-white/5 hover:bg-white/10`}
                            onClick={() => setFormIcon(opt.name)}
                            title={opt.name}
                          >
                            <Icon className="h-5 w-5" style={{ color: opt.color }} />
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Notes (Optional)</label>
                    <Input
                      placeholder="e.g. For our 10th anniversary"
                      className="bg-white/5 border-white/10"
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3 mt-4">
                    <Button variant="outline" className="flex-1" onClick={() => {
                      setDialogOpen(false)
                      resetForm()
                    }}>
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-white text-black hover:bg-white/90"
                      onClick={handleSave}
                      disabled={!formName || !formTarget}
                    >
                      {editingId ? 'Save Changes' : 'Create Goal'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Contribute Dialog */}
            <Dialog open={contributeOpen} onOpenChange={setContributeOpen}>
              <DialogContent className="bg-black border border-white/20 p-6 sm:max-w-[400px] rounded-xl shadow-[0_0_40px_rgba(192,192,192,0.5)]">
                <DialogHeader>
                  <DialogTitle className="text-xl">Add Contribution</DialogTitle>
                  <DialogDescription>
                    Record a contribution towards your goal.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Amount ($)</label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="e.g. 100"
                      className="bg-white/5 border-white/10"
                      value={contributeAmount}
                      onChange={(e) => setContributeAmount(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button variant="outline" className="flex-1" onClick={() => setContributeOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-green-500 hover:bg-green-600"
                      onClick={handleSaveContribution}
                      disabled={!contributeAmount || parseFloat(contributeAmount) <= 0}
                    >
                      Add ${contributeAmount || '0'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search goals..."
                    className="pl-11 bg-white/5 border-white/10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-1">
                  {(['all', 'active', 'completed'] as const).map(status => (
                    <Button
                      key={status}
                      variant={filterStatus === status ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setFilterStatus(status)}
                      className={filterStatus === status ? 'bg-white text-black' : ''}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              {selectedRows.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={handleEdit}
                    disabled={selectedRows.length !== 1}
                  >
                    <IconEdit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                    onClick={handleDelete}
                  >
                    <IconTrash className="h-4 w-4" />
                    Delete ({selectedRows.length})
                  </Button>
                </div>
              )}
            </div>

            {/* Goals Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {filteredGoals.length === 0 ? (
                <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
                  <IconTarget className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No goals found. Create your first savings goal!</p>
                </div>
              ) : (
                filteredGoals.map((goal) => {
                  const IconComponent = getIconComponent(goal.icon)
                  const iconColor = getIconColor(goal.icon)
                  const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
                  const remaining = goal.targetAmount - goal.currentAmount
                  const timeRemaining = calculateTimeRemaining(goal.deadline)
                  const projectedDate = calculateProjectedDate(goal)

                  return (
                    <div
                      key={goal.id}
                      className={`rounded-2xl border bg-white/5 p-6 transition-all ${
                        goal.isCompleted ? 'border-green-500/30 bg-green-500/5' : 'border-white/10'
                      } ${selectedRows.includes(goal.id) ? 'ring-2 ring-white/30' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedRows.includes(goal.id)}
                            onCheckedChange={() => toggleRow(goal.id)}
                          />
                          <div
                            className="p-2.5 rounded-xl"
                            style={{ backgroundColor: `${iconColor}20` }}
                          >
                            <IconComponent className="h-6 w-6" style={{ color: iconColor }} />
                          </div>
                          <div>
                            <h3 className={`font-semibold ${goal.isCompleted ? 'text-green-400' : ''}`}>
                              {goal.name}
                            </h3>
                            {goal.notes && (
                              <p className="text-xs text-muted-foreground">{goal.notes}</p>
                            )}
                          </div>
                        </div>
                        {goal.isCompleted && (
                          <span className="flex items-center gap-1 px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs">
                            <IconCheck className="h-3 w-3" />
                            Completed
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{percentage.toFixed(0)}%</span>
                        </div>
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: goal.isCompleted ? '#10B981' : iconColor,
                            }}
                          />
                        </div>
                      </div>

                      {/* Amount Info */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-3 rounded-lg bg-white/5">
                          <p className="text-xs text-muted-foreground">Saved</p>
                          <p className="text-lg font-bold text-green-400">${goal.currentAmount.toLocaleString()}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/5">
                          <p className="text-xs text-muted-foreground">Target</p>
                          <p className="text-lg font-bold">${goal.targetAmount.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Time & Projection */}
                      {!goal.isCompleted && (
                        <div className="flex items-center justify-between text-sm mb-4">
                          {timeRemaining && (
                            <div>
                              <span className="text-muted-foreground">Deadline: </span>
                              <span className={timeRemaining.color}>{timeRemaining.text}</span>
                            </div>
                          )}
                          {projectedDate && (
                            <div>
                              <span className="text-muted-foreground">Est. completion: </span>
                              <span>{projectedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      {!goal.isCompleted && (
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 bg-green-500 hover:bg-green-600"
                            size="sm"
                            onClick={() => handleContribute(goal.id)}
                          >
                            <IconPlus className="h-4 w-4 mr-1" />
                            Add Money
                          </Button>
                          {remaining > 0 && (
                            <div className="flex items-center px-3 rounded-lg bg-white/5 text-sm text-muted-foreground">
                              ${remaining.toLocaleString()} to go
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
