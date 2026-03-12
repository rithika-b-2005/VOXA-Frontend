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
  IconBell,
  IconBellOff,
  IconCalendar,
  IconCreditCard,
  IconHome,
  IconBolt,
  IconDroplet,
  IconWifi,
  IconDeviceMobile,
  IconCar,
  IconShieldCheck,
  IconCurrencyDollar,
  IconCheck,
  IconLoader2,
  IconAlertTriangle,
} from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useCategories, useReminders } from "@/hooks/useApi"
import { remindersApi, CreateReminderData } from "@/lib/api"

interface BillReminder {
  id: string
  name: string
  amount: number
  dueDate: Date
  frequency: 'once' | 'weekly' | 'monthly' | 'yearly'
  categoryId?: string
  categoryName?: string
  categoryColor?: string
  icon: string
  reminderDays: number
  isActive: boolean
  isPaid: boolean
  notes?: string
}

const iconOptions = [
  { icon: IconHome, name: "Rent", color: "#8B5CF6" },
  { icon: IconBolt, name: "Electricity", color: "#F59E0B" },
  { icon: IconDroplet, name: "Water", color: "#3B82F6" },
  { icon: IconWifi, name: "Internet", color: "#10B981" },
  { icon: IconDeviceMobile, name: "Phone", color: "#EC4899" },
  { icon: IconCar, name: "Car", color: "#6366F1" },
  { icon: IconShieldCheck, name: "Insurance", color: "#14B8A6" },
  { icon: IconCreditCard, name: "Credit Card", color: "#EF4444" },
  { icon: IconCurrencyDollar, name: "Other", color: "#A3A3A3" },
]

const frequencyOptions = [
  { value: 'once', label: 'One-time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

const reminderDaysOptions = [
  { value: 1, label: '1 day before' },
  { value: 3, label: '3 days before' },
  { value: 7, label: '7 days before' },
  { value: 14, label: '14 days before' },
]

export default function RemindersPage() {
  const { data: categoriesData } = useCategories()
  const { data: apiReminders, loading, error, refetch } = useReminders()
  const [reminders, setReminders] = React.useState<BillReminder[]>([])
  const [saving, setSaving] = React.useState(false)

  // Sync API data to local state
  React.useEffect(() => {
    if (apiReminders) {
      setReminders(apiReminders.map(r => ({
        id: r.id,
        name: r.name,
        amount: r.amount,
        dueDate: new Date(r.dueDate),
        frequency: r.frequency,
        categoryId: r.categoryId,
        categoryName: r.category?.name,
        categoryColor: r.category?.color,
        icon: 'Other',
        reminderDays: r.remindDaysBefore,
        isActive: !r.isPaid,
        isPaid: r.isPaid,
        notes: r.notes,
      })))
    }
  }, [apiReminders])
  const [selectedRows, setSelectedRows] = React.useState<string[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterStatus, setFilterStatus] = React.useState<'all' | 'upcoming' | 'overdue' | 'paid'>('all')

  const [addNewOpen, setAddNewOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)

  // Form states
  const [formName, setFormName] = React.useState("")
  const [formAmount, setFormAmount] = React.useState("")
  const [formDueDate, setFormDueDate] = React.useState("")
  const [formFrequency, setFormFrequency] = React.useState<'ONCE' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'>('MONTHLY')
  const [formCategory, setFormCategory] = React.useState("")
  const [formIcon, setFormIcon] = React.useState("Other")
  const [formReminderDays, setFormReminderDays] = React.useState(3)
  const [formNotes, setFormNotes] = React.useState("")
  const [editingId, setEditingId] = React.useState<string | null>(null)

  const categories = React.useMemo(() => {
    if (!categoriesData || !Array.isArray(categoriesData)) return []
    return categoriesData as any[]
  }, [categoriesData])

  const getDaysUntil = (date: Date) => {
    return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  }

  // Filter reminders
  const filteredReminders = reminders.filter(reminder => {
    const matchesSearch = reminder.name.toLowerCase().includes(searchQuery.toLowerCase())
    const daysUntil = getDaysUntil(reminder.dueDate)

    if (!matchesSearch) return false

    switch (filterStatus) {
      case 'upcoming':
        return !reminder.isPaid && daysUntil >= 0 && daysUntil <= 7
      case 'overdue':
        return !reminder.isPaid && daysUntil < 0
      case 'paid':
        return reminder.isPaid
      default:
        return true
    }
  }).sort((a, b) => {
    if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1
    return a.dueDate.getTime() - b.dueDate.getTime()
  })

  // Calculate stats
  const overdueReminders = reminders.filter(r => !r.isPaid && getDaysUntil(r.dueDate) < 0)
  const upcomingReminders = reminders.filter(r => !r.isPaid && getDaysUntil(r.dueDate) >= 0 && getDaysUntil(r.dueDate) <= 7)
  const totalDue = reminders.filter(r => !r.isPaid).reduce((sum, r) => sum + r.amount, 0)
  const paidThisMonth = reminders.filter(r => r.isPaid).reduce((sum, r) => sum + r.amount, 0)

  const toggleRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selectedRows.length === filteredReminders.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(filteredReminders.map(r => r.id))
    }
  }

  const resetForm = () => {
    setFormName("")
    setFormAmount("")
    setFormDueDate("")
    setFormFrequency('MONTHLY')
    setFormCategory("")
    setFormIcon("Other")
    setFormReminderDays(3)
    setFormNotes("")
    setEditingId(null)
  }

  const handleAdd = () => {
    resetForm()
    setAddNewOpen(true)
  }

  const handleEdit = () => {
    if (selectedRows.length === 1) {
      const reminder = reminders.find(r => r.id === selectedRows[0])
      if (reminder) {
        setFormName(reminder.name)
        setFormAmount(reminder.amount.toString())
        setFormDueDate(reminder.dueDate.toISOString().split('T')[0])
        setFormFrequency(reminder.frequency)
        setFormCategory(reminder.categoryId || "")
        setFormIcon(reminder.icon)
        setFormReminderDays(reminder.reminderDays)
        setFormNotes(reminder.notes || "")
        setEditingId(reminder.id)
        setEditOpen(true)
      }
    }
  }

  const handleDelete = async () => {
    for (const id of selectedRows) {
      await remindersApi.delete(id)
    }
    refetch()
    setSelectedRows([])
  }

  const handleSaveNew = async () => {
    setSaving(true)
    const reminderData: CreateReminderData = {
      name: formName,
      amount: parseFloat(formAmount),
      dueDate: formDueDate,
      frequency: formFrequency as 'once' | 'weekly' | 'monthly' | 'yearly',
      categoryId: formCategory || undefined,
      remindDaysBefore: formReminderDays,
      notes: formNotes || undefined,
    }
    const result = await remindersApi.create(reminderData)
    if (!result.error) refetch()
    setSaving(false)
    setAddNewOpen(false)
    resetForm()
  }

  const handleSaveEdit = async () => {
    if (!editingId) return
    setSaving(true)
    const reminderData: Partial<CreateReminderData> = {
      name: formName,
      amount: parseFloat(formAmount),
      dueDate: formDueDate,
      frequency: formFrequency as 'once' | 'weekly' | 'monthly' | 'yearly',
      categoryId: formCategory || undefined,
      remindDaysBefore: formReminderDays,
      notes: formNotes || undefined,
    }
    const result = await remindersApi.update(editingId, reminderData)
    if (!result.error) refetch()
    setSaving(false)
    setEditOpen(false)
    setSelectedRows([])
    resetForm()
  }

  const markAsPaid = async (id: string) => {
    const result = await remindersApi.markPaid(id)
    if (!result.error) refetch()
  }

  const toggleActive = (id: string) => {
    // This is UI-only toggle for now, could be extended with API
    setReminders(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, isActive: !r.isActive }
      }
      return r
    }))
  }

  const getIconComponent = (iconName: string) => {
    const found = iconOptions.find(i => i.name === iconName)
    return found ? found.icon : IconCurrencyDollar
  }

  const getIconColor = (iconName: string) => {
    const found = iconOptions.find(i => i.name === iconName)
    return found ? found.color : "#A3A3A3"
  }

  if (loading) {
    return (
      <div className="p-4 h-full">
        <div className="rounded-3xl bg-card border border-white/10 h-full overflow-hidden flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading reminders...</p>
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
            <p className="text-red-400">Error loading reminders: {error}</p>
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
          <h1 className="text-lg font-semibold">Bill Reminders</h1>
        </header>
        <main className="flex-1 p-6 pt-8 px-10 overflow-auto h-[calc(100%-4rem)]">
          <div className="grid gap-6 max-w-7xl mx-auto">

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${overdueReminders.length > 0 ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                    <IconAlertTriangle className={`h-5 w-5 ${overdueReminders.length > 0 ? 'text-red-400' : 'text-green-400'}`} />
                  </div>
                  <span className="text-sm text-muted-foreground">Overdue</span>
                </div>
                <p className={`text-2xl font-bold ${overdueReminders.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {overdueReminders.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ${overdueReminders.reduce((sum, r) => sum + r.amount, 0).toFixed(2)} total
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <IconCalendar className="h-5 w-5 text-yellow-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">Upcoming (7 days)</span>
                </div>
                <p className="text-2xl font-bold">{upcomingReminders.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ${upcomingReminders.reduce((sum, r) => sum + r.amount, 0).toFixed(2)} due
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <IconCreditCard className="h-5 w-5 text-blue-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">Total Due</span>
                </div>
                <p className="text-2xl font-bold">${totalDue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {reminders.filter(r => !r.isPaid).length} bills pending
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <IconCheck className="h-5 w-5 text-green-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">Paid This Month</span>
                </div>
                <p className="text-2xl font-bold text-green-400">${paidThisMonth.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {reminders.filter(r => r.isPaid).length} bills paid
                </p>
              </div>
            </div>

            {/* Overdue Alert */}
            {overdueReminders.length > 0 && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <IconAlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-400">Overdue Bills</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {overdueReminders.map(r => `${r.name} ($${r.amount})`).join(' • ')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">All Reminders</h2>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleAdd}>
                <IconPlus className="h-4 w-4" />
                Add Reminder
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
                  <DialogTitle className="text-xl">{editOpen ? 'Edit Reminder' : 'Add Bill Reminder'}</DialogTitle>
                  <DialogDescription>
                    {editOpen ? 'Update reminder details.' : 'Set up a new bill reminder.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Bill Name</label>
                    <Input
                      placeholder="e.g. Electric Bill"
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
                        placeholder="e.g. 120.00"
                        className="bg-white/5 border-white/10"
                        value={formAmount}
                        onChange={(e) => setFormAmount(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Due Date</label>
                      <Input
                        type="date"
                        className="bg-white/5 border-white/10"
                        value={formDueDate}
                        onChange={(e) => setFormDueDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Remind Me</label>
                      <select
                        className="h-10 px-3 rounded-md bg-white/5 border border-white/10 text-sm"
                        value={formReminderDays}
                        onChange={(e) => setFormReminderDays(parseInt(e.target.value))}
                      >
                        {reminderDaysOptions.map(opt => (
                          <option key={opt.value} value={opt.value} className="bg-black">{opt.label}</option>
                        ))}
                      </select>
                    </div>
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
                      placeholder="e.g. Auto-pay enabled"
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
                      disabled={!formName || !formAmount || !formDueDate}
                    >
                      {editOpen ? 'Save Changes' : 'Add Reminder'}
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
                    placeholder="Search bills..."
                    className="pl-11 bg-white/5 border-white/10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-1">
                  {(['all', 'upcoming', 'overdue', 'paid'] as const).map(status => (
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

            {/* Reminders Table */}
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[40px_1fr_120px_100px_120px_100px_100px] gap-4 px-6 py-4 bg-white/5 border-b border-white/10 items-center">
                <div className="flex items-center">
                  <Checkbox
                    checked={selectedRows.length === filteredReminders.length && filteredReminders.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </div>
                <div className="text-sm font-medium text-muted-foreground">Bill</div>
                <div className="text-sm font-medium text-muted-foreground text-center">Amount</div>
                <div className="text-sm font-medium text-muted-foreground text-center">Frequency</div>
                <div className="text-sm font-medium text-muted-foreground text-center">Due Date</div>
                <div className="text-sm font-medium text-muted-foreground text-center">Status</div>
                <div className="text-sm font-medium text-muted-foreground text-center">Actions</div>
              </div>

              {/* Table Rows */}
              {filteredReminders.length === 0 ? (
                <div className="px-6 py-12 text-center text-muted-foreground">
                  No reminders found. Add your first bill reminder.
                </div>
              ) : (
                filteredReminders.map((reminder, index) => {
                  const IconComponent = getIconComponent(reminder.icon)
                  const iconColor = getIconColor(reminder.icon)
                  const daysUntil = getDaysUntil(reminder.dueDate)
                  const isOverdue = daysUntil < 0 && !reminder.isPaid
                  const isUpcoming = daysUntil >= 0 && daysUntil <= 3 && !reminder.isPaid

                  return (
                    <div
                      key={reminder.id}
                      className={`grid grid-cols-[40px_1fr_120px_100px_120px_100px_100px] gap-4 px-6 py-4 items-center hover:bg-white/5 ${
                        index !== filteredReminders.length - 1 ? "border-b border-white/10" : ""
                      } ${selectedRows.includes(reminder.id) ? "bg-white/10" : ""} ${reminder.isPaid ? 'opacity-60' : ''} ${!reminder.isActive ? 'opacity-40' : ''}`}
                    >
                      <div className="flex items-center">
                        <Checkbox
                          checked={selectedRows.includes(reminder.id)}
                          onCheckedChange={() => toggleRow(reminder.id)}
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
                          <span className={`text-sm font-medium ${reminder.isPaid ? 'line-through' : ''}`}>{reminder.name}</span>
                          {reminder.categoryName && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: reminder.categoryColor }}
                              />
                              <span className="text-xs text-muted-foreground">{reminder.categoryName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-center font-medium">
                        ${reminder.amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-center text-muted-foreground">
                        {reminder.frequency === 'ONCE' ? 'One-time' : reminder.frequency.charAt(0) + reminder.frequency.slice(1).toLowerCase()}
                      </div>
                      <div className="text-center">
                        <span className={`text-sm ${isOverdue ? 'text-red-400' : isUpcoming ? 'text-yellow-400' : ''}`}>
                          {reminder.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <p className={`text-xs ${isOverdue ? 'text-red-400' : isUpcoming ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                          {isOverdue ? `${Math.abs(daysUntil)} days overdue` : daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                        </p>
                      </div>
                      <div className="flex justify-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          reminder.isPaid ? 'bg-green-500/20 text-green-400' :
                          isOverdue ? 'bg-red-500/20 text-red-400' :
                          isUpcoming ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {reminder.isPaid ? 'Paid' : isOverdue ? 'Overdue' : isUpcoming ? 'Due Soon' : 'Upcoming'}
                        </span>
                      </div>
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => markAsPaid(reminder.id)}
                          title={reminder.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                        >
                          <IconCheck className={`h-4 w-4 ${reminder.isPaid ? 'text-green-400' : 'text-muted-foreground hover:text-green-400'}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => toggleActive(reminder.id)}
                          title={reminder.isActive ? 'Disable Reminder' : 'Enable Reminder'}
                        >
                          {reminder.isActive ? (
                            <IconBell className="h-4 w-4 text-muted-foreground hover:text-yellow-400" />
                          ) : (
                            <IconBellOff className="h-4 w-4 text-muted-foreground hover:text-yellow-400" />
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
