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
  IconTrash,
  IconEdit,
  IconCreditCard,
  IconReceipt,
  IconHome,
  IconSchool,
  IconCar,
  IconCurrencyDollar,
  IconTrendingDown,
  IconCalendar,
  IconFlame,
  IconSnowflake,
  IconCheck,
  IconChartBar,
  IconArrowDown,
  IconLoader2,
} from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { useDebts } from "@/hooks/useApi"
import { debtsApi, Debt as ApiDebt, CreateDebtData } from "@/lib/api"

interface Debt {
  id: string
  name: string
  type: 'credit_card' | 'personal_loan' | 'student_loan' | 'mortgage' | 'auto_loan' | 'other'
  balance: number
  interestRate: number
  minimumPayment: number
  icon: string
}

interface PayoffPlan {
  debtId: string
  debtName: string
  payments: { month: number; payment: number; remaining: number; interest: number }[]
  payoffMonth: number
  totalInterest: number
}

const debtIcons = [
  { icon: IconCreditCard, name: "credit_card", label: "Credit Card", color: "#EF4444" },
  { icon: IconReceipt, name: "personal_loan", label: "Personal Loan", color: "#F59E0B" },
  { icon: IconHome, name: "mortgage", label: "Mortgage", color: "#8B5CF6" },
  { icon: IconSchool, name: "student_loan", label: "Student Loan", color: "#3B82F6" },
  { icon: IconCar, name: "auto_loan", label: "Auto Loan", color: "#6366F1" },
  { icon: IconCurrencyDollar, name: "other", label: "Other", color: "#A3A3A3" },
]

type PayoffMethod = 'avalanche' | 'snowball'

export default function DebtPlannerPage() {
  const { data: apiDebts, loading, error, refetch } = useDebts()
  const [debts, setDebts] = React.useState<Debt[]>([])
  const [method, setMethod] = React.useState<PayoffMethod>('avalanche')
  const [extraPayment, setExtraPayment] = React.useState<string>("500")

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)

  // Form states
  const [formName, setFormName] = React.useState("")
  const [formBalance, setFormBalance] = React.useState("")
  const [formInterest, setFormInterest] = React.useState("")
  const [formMinPayment, setFormMinPayment] = React.useState("")
  const [formType, setFormType] = React.useState<Debt['type']>("credit_card")

  // Sync API data to local state
  React.useEffect(() => {
    if (apiDebts) {
      setDebts(apiDebts.map(d => ({
        id: d.id,
        name: d.name,
        type: d.type,
        balance: d.balance,
        interestRate: d.interestRate,
        minimumPayment: d.minimumPayment,
        icon: d.type,
      })))
    }
  }, [apiDebts])

  // Calculate totals
  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0)
  const totalMinPayment = debts.reduce((sum, d) => sum + d.minimumPayment, 0)
  const highestRate = Math.max(...debts.map(d => d.interestRate))
  const avgInterest = debts.length > 0
    ? debts.reduce((sum, d) => sum + d.interestRate * d.balance, 0) / totalDebt
    : 0

  // Sort debts by method
  const sortedDebts = React.useMemo(() => {
    const sorted = [...debts]
    if (method === 'avalanche') {
      // Highest interest first
      sorted.sort((a, b) => b.interestRate - a.interestRate)
    } else {
      // Lowest balance first (snowball)
      sorted.sort((a, b) => a.balance - b.balance)
    }
    return sorted
  }, [debts, method])

  // Calculate payoff plan
  const calculatePayoffPlan = React.useMemo(() => {
    const extra = parseFloat(extraPayment) || 0
    const monthlyBudget = totalMinPayment + extra

    // Clone debts with remaining balances
    let remainingDebts = sortedDebts.map(d => ({
      ...d,
      remaining: d.balance,
      totalInterest: 0,
      payoffMonth: 0,
    }))

    let month = 0
    const maxMonths = 360 // 30 years max

    const paymentHistory: Record<string, { month: number; payment: number; remaining: number; interest: number }[]> = {}
    remainingDebts.forEach(d => { paymentHistory[d.id] = [] })

    while (remainingDebts.some(d => d.remaining > 0) && month < maxMonths) {
      month++
      let availableExtra = extra

      // First pass: apply minimum payments and calculate interest
      remainingDebts.forEach(debt => {
        if (debt.remaining <= 0) return

        // Calculate monthly interest
        const monthlyRate = debt.interestRate / 100 / 12
        const interest = debt.remaining * monthlyRate
        debt.totalInterest += interest
        debt.remaining += interest

        // Apply minimum payment
        const payment = Math.min(debt.minimumPayment, debt.remaining)
        debt.remaining -= payment

        paymentHistory[debt.id].push({
          month,
          payment,
          remaining: Math.max(0, debt.remaining),
          interest,
        })

        if (debt.remaining <= 0) {
          debt.payoffMonth = month
          // Add freed up minimum payment to available extra
          availableExtra += debt.minimumPayment
        }
      })

      // Second pass: apply extra payment to target debt
      for (const debt of remainingDebts) {
        if (debt.remaining <= 0 || availableExtra <= 0) continue

        const extraApplied = Math.min(availableExtra, debt.remaining)
        debt.remaining -= extraApplied
        availableExtra -= extraApplied

        // Update last payment record
        const lastRecord = paymentHistory[debt.id][paymentHistory[debt.id].length - 1]
        if (lastRecord) {
          lastRecord.payment += extraApplied
          lastRecord.remaining = Math.max(0, debt.remaining)
        }

        if (debt.remaining <= 0) {
          debt.payoffMonth = month
        }

        break // Only apply extra to first debt in order
      }
    }

    const totalInterest = remainingDebts.reduce((sum, d) => sum + d.totalInterest, 0)
    const payoffMonths = Math.max(...remainingDebts.map(d => d.payoffMonth))

    return {
      debts: remainingDebts,
      paymentHistory,
      totalInterest,
      payoffMonths,
    }
  }, [sortedDebts, extraPayment, totalMinPayment])

  // Calculate comparison (other method)
  const comparisonPlan = React.useMemo(() => {
    const extra = parseFloat(extraPayment) || 0
    const monthlyBudget = totalMinPayment + extra

    // Sort by opposite method
    const sorted = [...debts]
    if (method === 'avalanche') {
      sorted.sort((a, b) => a.balance - b.balance) // Snowball
    } else {
      sorted.sort((a, b) => b.interestRate - a.interestRate) // Avalanche
    }

    let remainingDebts = sorted.map(d => ({
      ...d,
      remaining: d.balance,
      totalInterest: 0,
      payoffMonth: 0,
    }))

    let month = 0
    const maxMonths = 360

    while (remainingDebts.some(d => d.remaining > 0) && month < maxMonths) {
      month++
      let availableExtra = extra

      remainingDebts.forEach(debt => {
        if (debt.remaining <= 0) return
        const monthlyRate = debt.interestRate / 100 / 12
        const interest = debt.remaining * monthlyRate
        debt.totalInterest += interest
        debt.remaining += interest
        const payment = Math.min(debt.minimumPayment, debt.remaining)
        debt.remaining -= payment
        if (debt.remaining <= 0) {
          debt.payoffMonth = month
          availableExtra += debt.minimumPayment
        }
      })

      for (const debt of remainingDebts) {
        if (debt.remaining <= 0 || availableExtra <= 0) continue
        const extraApplied = Math.min(availableExtra, debt.remaining)
        debt.remaining -= extraApplied
        availableExtra -= extraApplied
        if (debt.remaining <= 0) debt.payoffMonth = month
        break
      }
    }

    return {
      totalInterest: remainingDebts.reduce((sum, d) => sum + d.totalInterest, 0),
      payoffMonths: Math.max(...remainingDebts.map(d => d.payoffMonth)),
    }
  }, [debts, method, extraPayment, totalMinPayment])

  const interestSaved = method === 'avalanche'
    ? comparisonPlan.totalInterest - calculatePayoffPlan.totalInterest
    : calculatePayoffPlan.totalInterest - comparisonPlan.totalInterest

  const resetForm = () => {
    setFormName("")
    setFormBalance("")
    setFormInterest("")
    setFormMinPayment("")
    setFormType("credit_card")
    setEditingId(null)
  }

  const handleAdd = () => {
    resetForm()
    setDialogOpen(true)
  }

  const handleEdit = (debt: Debt) => {
    setFormName(debt.name)
    setFormBalance(debt.balance.toString())
    setFormInterest(debt.interestRate.toString())
    setFormMinPayment(debt.minimumPayment.toString())
    setFormType(debt.type)
    setEditingId(debt.id)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    const result = await debtsApi.delete(id)
    if (!result.error) {
      refetch()
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const debtData: CreateDebtData = {
      name: formName,
      type: formType,
      balance: parseFloat(formBalance),
      interestRate: parseFloat(formInterest),
      minimumPayment: parseFloat(formMinPayment),
    }

    if (editingId) {
      const result = await debtsApi.update(editingId, debtData)
      if (!result.error) {
        refetch()
      }
    } else {
      const result = await debtsApi.create(debtData)
      if (!result.error) {
        refetch()
      }
    }

    setSaving(false)
    setDialogOpen(false)
    resetForm()
  }

  const getIcon = (typeName: string) => {
    const found = debtIcons.find(i => i.name === typeName)
    return found ? found.icon : IconCurrencyDollar
  }

  const getColor = (typeName: string) => {
    const found = debtIcons.find(i => i.name === typeName)
    return found ? found.color : "#A3A3A3"
  }

  const getLabel = (typeName: string) => {
    const found = debtIcons.find(i => i.name === typeName)
    return found ? found.label : "Other"
  }

  const formatMonths = (months: number) => {
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    if (years === 0) return `${months} months`
    if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`
    return `${years}y ${remainingMonths}m`
  }

  if (loading) {
    return (
      <div className="p-4 h-full">
        <div className="rounded-3xl bg-card border border-white/10 h-full overflow-hidden flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading debts...</p>
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
            <p className="text-red-400">Error loading debts: {error}</p>
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
          <h1 className="text-lg font-semibold">Debt Payoff Planner</h1>
        </header>
        <main className="flex-1 p-6 pt-8 px-10 overflow-auto h-[calc(100%-4rem)]">
          <div className="grid gap-6 max-w-7xl mx-auto">

            {/* Method Selector */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-white/[0.02] p-6">
              <h2 className="text-lg font-semibold mb-4">Choose Your Strategy</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <button
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    method === 'avalanche'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                  onClick={() => setMethod('avalanche')}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${method === 'avalanche' ? 'bg-blue-500/20' : 'bg-white/10'}`}>
                      <IconFlame className={`h-5 w-5 ${method === 'avalanche' ? 'text-blue-400' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${method === 'avalanche' ? 'text-blue-400' : ''}`}>Avalanche Method</h3>
                      <p className="text-xs text-muted-foreground">Highest interest first</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pay off debts with the highest interest rates first. Saves the most money in interest.
                  </p>
                </button>

                <button
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    method === 'snowball'
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                  onClick={() => setMethod('snowball')}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${method === 'snowball' ? 'bg-cyan-500/20' : 'bg-white/10'}`}>
                      <IconSnowflake className={`h-5 w-5 ${method === 'snowball' ? 'text-cyan-400' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${method === 'snowball' ? 'text-cyan-400' : ''}`}>Snowball Method</h3>
                      <p className="text-xs text-muted-foreground">Smallest balance first</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pay off debts with the smallest balances first. Provides quick wins for motivation.
                  </p>
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <IconCreditCard className="h-5 w-5 text-red-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">Total Debt</span>
                </div>
                <p className="text-2xl font-bold text-red-400">${totalDebt.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {debts.length} debts tracked
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <IconTrendingDown className="h-5 w-5 text-yellow-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">Total Interest</span>
                </div>
                <p className="text-2xl font-bold text-yellow-400">
                  ${calculatePayoffPlan.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {avgInterest.toFixed(1)}% weighted avg
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <IconCalendar className="h-5 w-5 text-purple-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">Debt-Free In</span>
                </div>
                <p className="text-2xl font-bold">{formatMonths(calculatePayoffPlan.payoffMonths)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(Date.now() + calculatePayoffPlan.payoffMonths * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <IconCheck className="h-5 w-5 text-green-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {method === 'avalanche' ? 'Interest Saved' : 'vs Avalanche'}
                  </span>
                </div>
                <p className={`text-2xl font-bold ${interestSaved >= 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {interestSaved >= 0 ? '+' : ''}${Math.abs(interestSaved).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  compared to {method === 'avalanche' ? 'snowball' : 'avalanche'}
                </p>
              </div>
            </div>

            {/* Extra Payment Input */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Monthly Extra Payment</h3>
                  <p className="text-sm text-muted-foreground">
                    Amount above minimum payments (current min: ${totalMinPayment}/mo)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">$</span>
                  <Input
                    type="text"
                    inputMode="decimal"
                    className="w-32 bg-white/5 border-white/10"
                    value={extraPayment}
                    onChange={(e) => setExtraPayment(e.target.value)}
                  />
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
            </div>

            {/* Debts List & Payoff Order */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Your Debts</h2>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleAdd}>
                <IconPlus className="h-4 w-4" />
                Add Debt
              </Button>
            </div>

            <div className="grid gap-4">
              {sortedDebts.map((debt, index) => {
                const IconComponent = getIcon(debt.icon)
                const iconColor = getColor(debt.icon)
                const debtInfo = calculatePayoffPlan.debts.find(d => d.id === debt.id)
                const payoffDate = new Date(Date.now() + (debtInfo?.payoffMonth || 0) * 30 * 24 * 60 * 60 * 1000)

                return (
                  <div
                    key={debt.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6"
                  >
                    <div className="flex items-center gap-4">
                      {/* Order Number */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                        index === 0
                          ? method === 'avalanche' ? 'bg-blue-500/20 text-blue-400' : 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-white/10 text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>

                      {/* Debt Info */}
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="p-2.5 rounded-xl"
                          style={{ backgroundColor: `${iconColor}20` }}
                        >
                          <IconComponent className="h-6 w-6" style={{ color: iconColor }} />
                        </div>
                        <div>
                          <h3 className="font-semibold">{debt.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {debt.interestRate}% APR • ${debt.minimumPayment}/mo min
                          </p>
                        </div>
                      </div>

                      {/* Balance */}
                      <div className="text-right">
                        <p className="text-xl font-bold text-red-400">${debt.balance.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">balance</p>
                      </div>

                      {/* Payoff Info */}
                      <div className="text-right w-32">
                        <p className="text-sm font-medium">{formatMonths(debtInfo?.payoffMonth || 0)}</p>
                        <p className="text-xs text-muted-foreground">
                          {payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>

                      {/* Interest */}
                      <div className="text-right w-28">
                        <p className="text-sm font-medium text-yellow-400">
                          ${(debtInfo?.totalInterest || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-xs text-muted-foreground">interest</p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEdit(debt)}
                        >
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-400"
                          onClick={() => handleDelete(debt.id)}
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Focus indicator for first debt */}
                    {index === 0 && (
                      <div className={`mt-4 pt-4 border-t border-white/10 flex items-center gap-2 ${
                        method === 'avalanche' ? 'text-blue-400' : 'text-cyan-400'
                      }`}>
                        <IconArrowDown className="h-4 w-4" />
                        <span className="text-sm font-medium">Focus extra payments here first</span>
                      </div>
                    )}
                  </div>
                )
              })}

              {debts.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
                  <IconCreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No debts added yet. Add your debts to create a payoff plan.</p>
                </div>
              )}
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              if (!open) {
                setDialogOpen(false)
                resetForm()
              }
            }}>
              <DialogContent className="bg-black border border-white/20 p-6 sm:max-w-[450px] rounded-xl shadow-[0_0_40px_rgba(192,192,192,0.5)]">
                <DialogHeader>
                  <DialogTitle className="text-xl">{editingId ? 'Edit Debt' : 'Add Debt'}</DialogTitle>
                  <DialogDescription>
                    Add a debt to include it in your payoff plan.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Debt Name</label>
                    <Input
                      placeholder="e.g. Chase Sapphire Card"
                      className="bg-white/5 border-white/10"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Balance ($)</label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g. 5000"
                        className="bg-white/5 border-white/10"
                        value={formBalance}
                        onChange={(e) => setFormBalance(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Interest Rate (%)</label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g. 19.99"
                        className="bg-white/5 border-white/10"
                        value={formInterest}
                        onChange={(e) => setFormInterest(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Minimum Payment ($)</label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="e.g. 150"
                      className="bg-white/5 border-white/10"
                      value={formMinPayment}
                      onChange={(e) => setFormMinPayment(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Type</label>
                    <div className="flex gap-2 flex-wrap">
                      {debtIcons.map((opt) => {
                        const Icon = opt.icon
                        return (
                          <button
                            key={opt.name}
                            type="button"
                            className={`p-2 rounded-lg border-2 ${formType === opt.name ? 'border-white' : 'border-transparent'} bg-white/5 hover:bg-white/10`}
                            onClick={() => setFormType(opt.name as Debt['type'])}
                            title={opt.label}
                          >
                            <Icon className="h-5 w-5" style={{ color: opt.color }} />
                          </button>
                        )
                      })}
                    </div>
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
                      disabled={!formName || !formBalance || !formInterest || !formMinPayment || saving}
                    >
                      {saving ? <IconLoader2 className="h-4 w-4 animate-spin" /> : editingId ? 'Save Changes' : 'Add Debt'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  )
}
