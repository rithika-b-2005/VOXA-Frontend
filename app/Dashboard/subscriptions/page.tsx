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
  IconRefresh,
  IconLoader2,
  IconCalendar,
  IconCreditCard,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconBrandNetflix,
  IconBrandSpotify,
  IconBrandAmazon,
  IconCloud,
  IconDeviceTv,
  IconMusic,
  IconBook,
  IconBrandApple,
  IconBrandGoogle,
  IconCurrencyDollar,
} from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useCategories, useSubscriptions } from "@/hooks/useApi"
import { subscriptionsApi, CreateSubscriptionData } from "@/lib/api"

interface Subscription {
  id: string
  name: string
  amount: number
  frequency: 'weekly' | 'monthly' | 'yearly'
  nextBillingDate: Date
  categoryId?: string
  categoryName?: string
  categoryColor?: string
  icon: string
  status: 'active' | 'paused' | 'cancelled'
  startDate: Date
  notes?: string
}

const iconOptions = [
  { icon: IconBrandNetflix, name: "Netflix", color: "#E50914" },
  { icon: IconBrandSpotify, name: "Spotify", color: "#1DB954" },
  { icon: IconBrandAmazon, name: "Amazon", color: "#FF9900" },
  { icon: IconCloud, name: "Cloud", color: "#3B82F6" },
  { icon: IconDeviceTv, name: "Streaming", color: "#8B5CF6" },
  { icon: IconMusic, name: "Music", color: "#EC4899" },
  { icon: IconBook, name: "Books", color: "#F59E0B" },
  { icon: IconBrandApple, name: "Apple", color: "#A3A3A3" },
  { icon: IconBrandGoogle, name: "Google", color: "#4285F4" },
  { icon: IconCurrencyDollar, name: "Other", color: "#10B981" },
]

const frequencyOptions = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

export default function SubscriptionsPage() {
  const { data: categoriesData } = useCategories()
  const { data: apiSubscriptions, loading, error, refetch } = useSubscriptions()
  const [subscriptions, setSubscriptions] = React.useState<Subscription[]>([])
  const [saving, setSaving] = React.useState(false)

  // Sync API data to local state
  React.useEffect(() => {
    if (apiSubscriptions) {
      setSubscriptions(apiSubscriptions.map(s => ({
        id: s.id,
        name: s.name,
        amount: s.amount,
        frequency: s.billingCycle,
        nextBillingDate: new Date(s.nextBillingDate),
        categoryId: s.categoryId,
        categoryName: s.category?.name,
        categoryColor: s.category?.color,
        icon: 'Other',
        status: s.status,
        startDate: new Date(s.createdAt),
        notes: s.notes,
      })))
    }
  }, [apiSubscriptions])
  const [selectedRows, setSelectedRows] = React.useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const [addNewOpen, setAddNewOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)

  // Form states
  const [formName, setFormName] = React.useState("")
  const [formAmount, setFormAmount] = React.useState("")
  const [formFrequency, setFormFrequency] = React.useState<'weekly' | 'monthly' | 'yearly'>('monthly')
  const [formNextBilling, setFormNextBilling] = React.useState("")
  const [formCategory, setFormCategory] = React.useState("")
  const [formIcon, setFormIcon] = React.useState("Other")
  const [formNotes, setFormNotes] = React.useState("")
  const [editingId, setEditingId] = React.useState<string | null>(null)

  const categories = React.useMemo(() => {
    if (!categoriesData || !Array.isArray(categoriesData)) return []
    return categoriesData as any[]
  }, [categoriesData])

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calculate totals
  const monthlyTotal = subscriptions
    .filter(s => s.status === 'ACTIVE')
    .reduce((sum, s) => {
      switch (s.frequency) {
        case 'DAILY': return sum + s.amount * 30
        case 'WEEKLY': return sum + s.amount * 4.33
        case 'MONTHLY': return sum + s.amount
        case 'YEARLY': return sum + s.amount / 12
        default: return sum
      }
    }, 0)

  const yearlyTotal = monthlyTotal * 12

  const upcomingBills = subscriptions
    .filter(s => s.status === 'ACTIVE')
    .filter(s => {
      const daysUntil = Math.ceil((s.nextBillingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return daysUntil <= 7 && daysUntil >= 0
    })

  const toggleRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selectedRows.length === filteredSubscriptions.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(filteredSubscriptions.map(s => s.id))
    }
  }

  const handleAdd = () => {
    resetForm()
    setAddNewOpen(true)
  }

  const handleEdit = () => {
    if (selectedRows.length === 1) {
      const sub = subscriptions.find(s => s.id === selectedRows[0])
      if (sub) {
        setFormName(sub.name)
        setFormAmount(sub.amount.toString())
        setFormFrequency(sub.frequency)
        setFormNextBilling(sub.nextBillingDate.toISOString().split('T')[0])
        setFormCategory(sub.categoryId || "")
        setFormIcon(sub.icon)
        setFormNotes(sub.notes || "")
        setEditingId(sub.id)
        setEditOpen(true)
      }
    }
  }

  const handleDelete = async () => {
    for (const id of selectedRows) {
      await subscriptionsApi.delete(id)
    }
    refetch()
    setSelectedRows([])
  }

  const resetForm = () => {
    setFormName("")
    setFormAmount("")
    setFormFrequency('monthly')
    setFormNextBilling("")
    setFormCategory("")
    setFormIcon("Other")
    setFormNotes("")
    setEditingId(null)
  }

  const handleSaveNew = async () => {
    setSaving(true)
    const subData: CreateSubscriptionData = {
      name: formName,
      amount: parseFloat(formAmount),
      billingCycle: formFrequency as 'weekly' | 'monthly' | 'yearly',
      nextBillingDate: formNextBilling,
      categoryId: formCategory || undefined,
      notes: formNotes || undefined,
    }
    const result = await subscriptionsApi.create(subData)
    if (!result.error) refetch()
    setSaving(false)
    setAddNewOpen(false)
    resetForm()
  }

  const handleSaveEdit = async () => {
    if (!editingId) return
    setSaving(true)
    const subData: Partial<CreateSubscriptionData> = {
      name: formName,
      amount: parseFloat(formAmount),
      billingCycle: formFrequency as 'weekly' | 'monthly' | 'yearly',
      nextBillingDate: formNextBilling,
      categoryId: formCategory || undefined,
      notes: formNotes || undefined,
    }
    const result = await subscriptionsApi.update(editingId, subData)
    if (!result.error) refetch()
    setSaving(false)
    setEditOpen(false)
    setSelectedRows([])
    resetForm()
  }

  const toggleStatus = async (id: string) => {
    const sub = subscriptions.find(s => s.id === id)
    if (!sub) return
    if (sub.status === 'active') {
      const result = await subscriptionsApi.pause(id)
      if (!result.error) refetch()
    } else {
      const result = await subscriptionsApi.resume(id)
      if (!result.error) refetch()
    }
  }

  const getIconComponent = (iconName: string) => {
    const found = iconOptions.find(i => i.name === iconName)
    return found ? found.icon : IconCurrencyDollar
  }

  const getIconColor = (iconName: string) => {
    const found = iconOptions.find(i => i.name === iconName)
    return found ? found.color : "#10B981"
  }

  const getDaysUntil = (date: Date) => {
    return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  }

  const formatFrequency = (freq: string) => {
    return freq.charAt(0).toUpperCase() + freq.slice(1).toLowerCase()
  }

  if (loading) {
    return (
      <div className="p-4 h-full">
        <div className="rounded-3xl bg-card border border-white/10 h-full overflow-hidden flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading subscriptions...</p>
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
            <p className="text-red-400">Error loading subscriptions: {error}</p>
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
          <h1 className="text-lg font-semibold">Subscriptions & Recurring Expenses</h1>
        </header>
        <main className="flex-1 p-6 pt-8 px-10 overflow-auto h-[calc(100%-4rem)]">
          <div className="grid gap-6 max-w-7xl mx-auto">

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <IconRefresh className="h-5 w-5 text-blue-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">Active Subscriptions</span>
                </div>
                <p className="text-2xl font-bold">{subscriptions.filter(s => s.status === 'ACTIVE').length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {subscriptions.filter(s => s.status === 'PAUSED').length} paused
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <IconCreditCard className="h-5 w-5 text-purple-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">Monthly Cost</span>
                </div>
                <p className="text-2xl font-bold">${monthlyTotal.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ${yearlyTotal.toFixed(0)}/year
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${upcomingBills.length > 0 ? 'bg-yellow-500/20' : 'bg-green-500/20'}`}>
                    <IconCalendar className={`h-5 w-5 ${upcomingBills.length > 0 ? 'text-yellow-400' : 'text-green-400'}`} />
                  </div>
                  <span className="text-sm text-muted-foreground">Upcoming (7 days)</span>
                </div>
                <p className="text-2xl font-bold">{upcomingBills.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ${upcomingBills.reduce((sum, b) => sum + b.amount, 0).toFixed(2)} due
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <IconCheck className="h-5 w-5 text-green-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">Avg. per Subscription</span>
                </div>
                <p className="text-2xl font-bold">
                  ${subscriptions.filter(s => s.status === 'ACTIVE').length > 0
                    ? (monthlyTotal / subscriptions.filter(s => s.status === 'ACTIVE').length).toFixed(2)
                    : '0.00'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">per month</p>
              </div>
            </div>

            {/* Upcoming Bills Alert */}
            {upcomingBills.length > 0 && (
              <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <IconAlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-400">Upcoming Bills</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {upcomingBills.map(b => `${b.name} ($${b.amount}) in ${getDaysUntil(b.nextBillingDate)} days`).join(' • ')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">All Subscriptions</h2>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleAdd}>
                <IconPlus className="h-4 w-4" />
                Add Subscription
              </Button>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={addNewOpen || editOpen} onOpenChange={(open) => {
              if (!open) {
                setAddNewOpen(false)
                setEditOpen(false)
                resetForm()
              }
            }}>
              <DialogContent className="bg-black border border-white/20 p-6 sm:max-w-[500px] rounded-xl shadow-[0_0_40px_rgba(192,192,192,0.5)]">
                <DialogHeader>
                  <DialogTitle className="text-xl">{editOpen ? 'Edit Subscription' : 'Add Subscription'}</DialogTitle>
                  <DialogDescription>
                    {editOpen ? 'Update subscription details.' : 'Track a new recurring expense.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      placeholder="e.g. Netflix"
                      className="bg-white/5 border-white/10"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Amount ($)</label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g. 15.99"
                        className="bg-white/5 border-white/10"
                        value={formAmount}
                        onChange={(e) => setFormAmount(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Frequency</label>
                      <select
                        className="h-10 px-3 rounded-md bg-white/5 border border-white/10 text-sm"
                        value={formFrequency}
                        onChange={(e) => setFormFrequency(e.target.value as any)}
                      >
                        {frequencyOptions.map(opt => (
                          <option key={opt.value} value={opt.value} className="bg-black">{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Next Billing Date</label>
                      <Input
                        type="date"
                        className="bg-white/5 border-white/10"
                        value={formNextBilling}
                        onChange={(e) => setFormNextBilling(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Category</label>
                      <select
                        className="h-10 px-3 rounded-md bg-white/5 border border-white/10 text-sm"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                      >
                        <option value="" className="bg-black">Select category</option>
                        {categories.map((cat: any) => (
                          <option key={cat.id} value={cat.id} className="bg-black">{cat.name}</option>
                        ))}
                      </select>
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
                      placeholder="e.g. Family plan"
                      className="bg-white/5 border-white/10"
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3 mt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setAddNewOpen(false)
                        setEditOpen(false)
                        resetForm()
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-white text-black hover:bg-white/90"
                      onClick={editOpen ? handleSaveEdit : handleSaveNew}
                      disabled={!formName || !formAmount || !formNextBilling}
                    >
                      {editOpen ? 'Save Changes' : 'Add Subscription'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                <div className="relative w-80">
                  <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search subscriptions..."
                    className="pl-11 bg-white/5 border-white/10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
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

            {/* Subscriptions Table */}
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[40px_1fr_120px_100px_140px_100px_80px] gap-4 px-6 py-4 bg-white/5 border-b border-white/10 items-center">
                <div className="flex items-center">
                  <Checkbox
                    checked={selectedRows.length === filteredSubscriptions.length && filteredSubscriptions.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </div>
                <div className="text-sm font-medium text-muted-foreground">Subscription</div>
                <div className="text-sm font-medium text-muted-foreground text-center">Amount</div>
                <div className="text-sm font-medium text-muted-foreground text-center">Frequency</div>
                <div className="text-sm font-medium text-muted-foreground text-center">Next Billing</div>
                <div className="text-sm font-medium text-muted-foreground text-center">Status</div>
                <div className="text-sm font-medium text-muted-foreground text-center">Action</div>
              </div>

              {/* Table Rows */}
              {filteredSubscriptions.length === 0 ? (
                <div className="px-6 py-12 text-center text-muted-foreground">
                  No subscriptions found. Add your first subscription to start tracking.
                </div>
              ) : (
                filteredSubscriptions.map((sub, index) => {
                  const IconComponent = getIconComponent(sub.icon)
                  const iconColor = getIconColor(sub.icon)
                  const daysUntil = getDaysUntil(sub.nextBillingDate)
                  const isUpcoming = daysUntil <= 3 && daysUntil >= 0

                  return (
                    <div
                      key={sub.id}
                      className={`grid grid-cols-[40px_1fr_120px_100px_140px_100px_80px] gap-4 px-6 py-4 items-center hover:bg-white/5 ${
                        index !== filteredSubscriptions.length - 1 ? "border-b border-white/10" : ""
                      } ${selectedRows.includes(sub.id) ? "bg-white/10" : ""} ${sub.status === 'PAUSED' ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-center">
                        <Checkbox
                          checked={selectedRows.includes(sub.id)}
                          onCheckedChange={() => toggleRow(sub.id)}
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${iconColor}20` }}
                        >
                          <IconComponent className="h-5 w-5" style={{ color: iconColor }} />
                        </div>
                        <div>
                          <span className="text-sm font-medium">{sub.name}</span>
                          {sub.categoryName && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: sub.categoryColor }}
                              />
                              <span className="text-xs text-muted-foreground">{sub.categoryName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-center font-medium">
                        ${sub.amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-center text-muted-foreground">
                        {formatFrequency(sub.frequency)}
                      </div>
                      <div className="text-center">
                        <span className={`text-sm ${isUpcoming ? 'text-yellow-400' : ''}`}>
                          {sub.nextBillingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <p className={`text-xs ${isUpcoming ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                          {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                        </p>
                      </div>
                      <div className="flex justify-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          sub.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                          sub.status === 'PAUSED' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {sub.status.charAt(0) + sub.status.slice(1).toLowerCase()}
                        </span>
                      </div>
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => toggleStatus(sub.id)}
                          title={sub.status === 'ACTIVE' ? 'Pause' : 'Resume'}
                        >
                          {sub.status === 'ACTIVE' ? (
                            <IconX className="h-4 w-4 text-muted-foreground hover:text-yellow-400" />
                          ) : (
                            <IconCheck className="h-4 w-4 text-muted-foreground hover:text-green-400" />
                          )}
                        </Button>
                      </div>
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
