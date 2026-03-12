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
  IconWallet,
  IconBuildingBank,
  IconCoin,
  IconHome,
  IconCar,
  IconDeviceLaptop,
  IconDiamond,
  IconChartLine,
  IconCreditCard,
  IconReceipt,
  IconSchool,
  IconCurrencyDollar,
  IconTrendingUp,
  IconTrendingDown,
  IconArrowUpRight,
  IconArrowDownRight,
  IconLoader2,
} from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useAssets, useLiabilities, useNetWorthHistory } from "@/hooks/useApi"
import { assetsApi, liabilitiesApi, Asset as ApiAsset, Liability as ApiLiability, CreateAssetData, CreateLiabilityData } from "@/lib/api"

interface Asset {
  id: string
  name: string
  type: 'cash' | 'savings' | 'investment' | 'retirement' | 'property' | 'vehicle' | 'crypto' | 'other'
  value: number
  icon: string
  notes?: string
  lastUpdated: Date
}

interface Liability {
  id: string
  name: string
  type: 'credit_card' | 'mortgage' | 'auto_loan' | 'student_loan' | 'personal_loan' | 'other'
  balance: number
  interestRate?: number
  icon: string
  notes?: string
  lastUpdated: Date
}

interface NetWorthSnapshot {
  date: string
  assets: number
  liabilities: number
  netWorth: number
}

const assetIcons = [
  { icon: IconWallet, name: "cash", label: "Cash", color: "#10B981" },
  { icon: IconBuildingBank, name: "savings", label: "Savings", color: "#3B82F6" },
  { icon: IconCoin, name: "crypto", label: "Crypto", color: "#F59E0B" },
  { icon: IconChartLine, name: "investment", label: "Stocks", color: "#8B5CF6" },
  { icon: IconHome, name: "property", label: "Property", color: "#EC4899" },
  { icon: IconCar, name: "vehicle", label: "Vehicle", color: "#6366F1" },
  { icon: IconDeviceLaptop, name: "retirement", label: "Retirement", color: "#14B8A6" },
  { icon: IconCurrencyDollar, name: "other", label: "Other", color: "#A3A3A3" },
]

const liabilityIcons = [
  { icon: IconCreditCard, name: "credit_card", label: "Credit Card", color: "#EF4444" },
  { icon: IconReceipt, name: "personal_loan", label: "Personal Loan", color: "#F59E0B" },
  { icon: IconHome, name: "mortgage", label: "Mortgage", color: "#8B5CF6" },
  { icon: IconSchool, name: "student_loan", label: "Student Loan", color: "#3B82F6" },
  { icon: IconCar, name: "auto_loan", label: "Auto Loan", color: "#6366F1" },
  { icon: IconCurrencyDollar, name: "other", label: "Other", color: "#A3A3A3" },
]

export default function NetWorthPage() {
  const { data: apiAssets, loading: assetsLoading, error: assetsError, refetch: refetchAssets } = useAssets()
  const { data: apiLiabilities, loading: liabilitiesLoading, error: liabilitiesError, refetch: refetchLiabilities } = useLiabilities()
  const { data: apiHistory, loading: historyLoading } = useNetWorthHistory(6)

  const [assets, setAssets] = React.useState<Asset[]>([])
  const [liabilities, setLiabilities] = React.useState<Liability[]>([])
  const [history, setHistory] = React.useState<NetWorthSnapshot[]>([])
  const [saving, setSaving] = React.useState(false)

  // Sync API data to local state
  React.useEffect(() => {
    if (apiAssets) {
      setAssets(apiAssets.map(a => ({
        id: a.id,
        name: a.name,
        type: a.type,
        value: a.value,
        icon: a.type,
        notes: a.notes,
        lastUpdated: new Date(a.updatedAt),
      })))
    }
  }, [apiAssets])

  React.useEffect(() => {
    if (apiLiabilities) {
      setLiabilities(apiLiabilities.map(l => ({
        id: l.id,
        name: l.name,
        type: l.type,
        balance: l.balance,
        interestRate: l.interestRate,
        icon: l.type,
        notes: l.notes,
        lastUpdated: new Date(l.updatedAt),
      })))
    }
  }, [apiLiabilities])

  React.useEffect(() => {
    if (apiHistory) {
      setHistory(apiHistory.map(h => ({
        date: new Date(h.date).toLocaleDateString('en-US', { month: 'short' }),
        assets: h.totalAssets,
        liabilities: h.totalLiabilities,
        netWorth: h.netWorth,
      })))
    }
  }, [apiHistory])

  const loading = assetsLoading || liabilitiesLoading
  const error = assetsError || liabilitiesError

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [dialogType, setDialogType] = React.useState<'asset' | 'liability'>('asset')
  const [editingId, setEditingId] = React.useState<string | null>(null)

  // Form states
  const [formName, setFormName] = React.useState("")
  const [formValue, setFormValue] = React.useState("")
  const [formIcon, setFormIcon] = React.useState("Other")
  const [formInterestRate, setFormInterestRate] = React.useState("")
  const [formNotes, setFormNotes] = React.useState("")

  // Calculate totals
  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0)
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.balance, 0)
  const netWorth = totalAssets - totalLiabilities

  // Calculate changes (mock)
  const lastMonthNetWorth = history[history.length - 2]?.netWorth || netWorth
  const netWorthChange = netWorth - lastMonthNetWorth
  const netWorthChangePercent = lastMonthNetWorth > 0 ? ((netWorthChange / lastMonthNetWorth) * 100) : 0

  // Group assets by type
  const assetsByType = React.useMemo(() => {
    const groups: Record<string, { items: Asset[], total: number }> = {}
    assets.forEach(asset => {
      if (!groups[asset.type]) {
        groups[asset.type] = { items: [], total: 0 }
      }
      groups[asset.type].items.push(asset)
      groups[asset.type].total += asset.value
    })
    return groups
  }, [assets])

  // Group liabilities by type
  const liabilitiesByType = React.useMemo(() => {
    const groups: Record<string, { items: Liability[], total: number }> = {}
    liabilities.forEach(liability => {
      if (!groups[liability.type]) {
        groups[liability.type] = { items: [], total: 0 }
      }
      groups[liability.type].items.push(liability)
      groups[liability.type].total += liability.balance
    })
    return groups
  }, [liabilities])

  const resetForm = () => {
    setFormName("")
    setFormValue("")
    setFormIcon("Other")
    setFormInterestRate("")
    setFormNotes("")
    setEditingId(null)
  }

  const handleAddAsset = () => {
    setDialogType('asset')
    resetForm()
    setDialogOpen(true)
  }

  const handleAddLiability = () => {
    setDialogType('liability')
    resetForm()
    setDialogOpen(true)
  }

  const handleEditAsset = (asset: Asset) => {
    setDialogType('asset')
    setFormName(asset.name)
    setFormValue(asset.value.toString())
    setFormIcon(asset.icon)
    setFormNotes(asset.notes || "")
    setEditingId(asset.id)
    setDialogOpen(true)
  }

  const handleEditLiability = (liability: Liability) => {
    setDialogType('liability')
    setFormName(liability.name)
    setFormValue(liability.balance.toString())
    setFormIcon(liability.icon)
    setFormInterestRate(liability.interestRate?.toString() || "")
    setFormNotes(liability.notes || "")
    setEditingId(liability.id)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    if (dialogType === 'asset') {
      const assetData: CreateAssetData = {
        name: formName,
        type: formIcon as Asset['type'],
        value: parseFloat(formValue),
        notes: formNotes || undefined,
      }

      if (editingId) {
        const result = await assetsApi.update(editingId, assetData)
        if (!result.error) refetchAssets()
      } else {
        const result = await assetsApi.create(assetData)
        if (!result.error) refetchAssets()
      }
    } else {
      const liabilityData: CreateLiabilityData = {
        name: formName,
        type: formIcon as Liability['type'],
        balance: parseFloat(formValue),
        interestRate: formInterestRate ? parseFloat(formInterestRate) : undefined,
        notes: formNotes || undefined,
      }

      if (editingId) {
        const result = await liabilitiesApi.update(editingId, liabilityData)
        if (!result.error) refetchLiabilities()
      } else {
        const result = await liabilitiesApi.create(liabilityData)
        if (!result.error) refetchLiabilities()
      }
    }

    setSaving(false)
    setDialogOpen(false)
    resetForm()
  }

  const handleDeleteAsset = async (id: string) => {
    const result = await assetsApi.delete(id)
    if (!result.error) refetchAssets()
  }

  const handleDeleteLiability = async (id: string) => {
    const result = await liabilitiesApi.delete(id)
    if (!result.error) refetchLiabilities()
  }

  const getAssetIcon = (iconName: string) => {
    const found = assetIcons.find(i => i.name === iconName)
    return found ? found.icon : IconCurrencyDollar
  }

  const getAssetColor = (iconName: string) => {
    const found = assetIcons.find(i => i.name === iconName)
    return found ? found.color : "#A3A3A3"
  }

  const getLiabilityIcon = (iconName: string) => {
    const found = liabilityIcons.find(i => i.name === iconName)
    return found ? found.icon : IconCurrencyDollar
  }

  const getLiabilityColor = (iconName: string) => {
    const found = liabilityIcons.find(i => i.name === iconName)
    return found ? found.color : "#A3A3A3"
  }

  const formatTypeName = (type: string) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  if (loading) {
    return (
      <div className="p-4 h-full">
        <div className="rounded-3xl bg-card border border-white/10 h-full overflow-hidden flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading net worth data...</p>
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
            <p className="text-red-400">Error loading data: {error}</p>
            <Button variant="outline" onClick={() => { refetchAssets(); refetchLiabilities() }}>Retry</Button>
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
          <h1 className="text-lg font-semibold">Net Worth Tracker</h1>
        </header>
        <main className="flex-1 p-6 pt-8 px-10 overflow-auto h-[calc(100%-4rem)]">
          <div className="grid gap-6 max-w-7xl mx-auto">

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <IconTrendingUp className="h-5 w-5 text-green-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">Total Assets</span>
                </div>
                <p className="text-2xl font-bold text-green-400">${totalAssets.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {assets.length} assets tracked
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <IconTrendingDown className="h-5 w-5 text-red-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">Total Liabilities</span>
                </div>
                <p className="text-2xl font-bold text-red-400">${totalLiabilities.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {liabilities.length} debts tracked
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-white/10">
                    <IconWallet className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm text-muted-foreground">Net Worth</span>
                </div>
                <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${Math.abs(netWorth).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {netWorth >= 0 ? 'Positive net worth' : 'Negative net worth'}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${netWorthChange >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    {netWorthChange >= 0 ? (
                      <IconArrowUpRight className="h-5 w-5 text-green-400" />
                    ) : (
                      <IconArrowDownRight className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">Monthly Change</span>
                </div>
                <p className={`text-2xl font-bold ${netWorthChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {netWorthChange >= 0 ? '+' : '-'}${Math.abs(netWorthChange).toLocaleString()}
                </p>
                <p className={`text-xs mt-1 ${netWorthChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {netWorthChange >= 0 ? '+' : ''}{netWorthChangePercent.toFixed(1)}% from last month
                </p>
              </div>
            </div>

            {/* Net Worth Chart */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold mb-4">Net Worth Over Time</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <YAxis
                      stroke="rgba(255,255,255,0.5)"
                      fontSize={12}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                    />
                    <Area
                      type="monotone"
                      dataKey="netWorth"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorNetWorth)"
                      name="Net Worth"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Assets & Liabilities */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Assets */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-green-400">Assets</h2>
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleAddAsset}>
                    <IconPlus className="h-4 w-4" />
                    Add Asset
                  </Button>
                </div>

                <div className="space-y-4">
                  {Object.entries(assetsByType).map(([type, { items, total }]) => (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">{formatTypeName(type)}</span>
                        <span className="text-sm font-bold text-green-400">${total.toLocaleString()}</span>
                      </div>
                      <div className="space-y-2">
                        {items.map(asset => {
                          const IconComponent = getAssetIcon(asset.icon)
                          const iconColor = getAssetColor(asset.icon)
                          return (
                            <div
                              key={asset.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 group"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="p-2 rounded-lg"
                                  style={{ backgroundColor: `${iconColor}20` }}
                                >
                                  <IconComponent className="h-4 w-4" style={{ color: iconColor }} />
                                </div>
                                <span className="text-sm">{asset.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">${asset.value.toLocaleString()}</span>
                                <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => handleEditAsset(asset)}
                                  >
                                    <IconEdit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-red-400"
                                    onClick={() => handleDeleteAsset(asset.id)}
                                  >
                                    <IconTrash className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Liabilities */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-red-400">Liabilities</h2>
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleAddLiability}>
                    <IconPlus className="h-4 w-4" />
                    Add Liability
                  </Button>
                </div>

                <div className="space-y-4">
                  {Object.entries(liabilitiesByType).map(([type, { items, total }]) => (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">{formatTypeName(type)}</span>
                        <span className="text-sm font-bold text-red-400">${total.toLocaleString()}</span>
                      </div>
                      <div className="space-y-2">
                        {items.map(liability => {
                          const IconComponent = getLiabilityIcon(liability.icon)
                          const iconColor = getLiabilityColor(liability.icon)
                          return (
                            <div
                              key={liability.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 group"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="p-2 rounded-lg"
                                  style={{ backgroundColor: `${iconColor}20` }}
                                >
                                  <IconComponent className="h-4 w-4" style={{ color: iconColor }} />
                                </div>
                                <div>
                                  <span className="text-sm">{liability.name}</span>
                                  {liability.interestRate && (
                                    <span className="text-xs text-muted-foreground ml-2">
                                      {liability.interestRate}% APR
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">${liability.balance.toLocaleString()}</span>
                                <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => handleEditLiability(liability)}
                                  >
                                    <IconEdit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-red-400"
                                    onClick={() => handleDeleteLiability(liability.id)}
                                  >
                                    <IconTrash className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
                  <DialogTitle className="text-xl">
                    {editingId ? 'Edit' : 'Add'} {dialogType === 'asset' ? 'Asset' : 'Liability'}
                  </DialogTitle>
                  <DialogDescription>
                    {dialogType === 'asset'
                      ? 'Track assets like bank accounts, investments, and property.'
                      : 'Track debts like credit cards, loans, and mortgages.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      placeholder={dialogType === 'asset' ? "e.g. Savings Account" : "e.g. Car Loan"}
                      className="bg-white/5 border-white/10"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">
                        {dialogType === 'asset' ? 'Value ($)' : 'Balance ($)'}
                      </label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="e.g. 10000"
                        className="bg-white/5 border-white/10"
                        value={formValue}
                        onChange={(e) => setFormValue(e.target.value)}
                      />
                    </div>
                    {dialogType === 'liability' && (
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Interest Rate (%)</label>
                        <Input
                          type="text"
                          inputMode="decimal"
                          placeholder="e.g. 19.99"
                          className="bg-white/5 border-white/10"
                          value={formInterestRate}
                          onChange={(e) => setFormInterestRate(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Icon</label>
                    <div className="flex gap-2 flex-wrap">
                      {(dialogType === 'asset' ? assetIcons : liabilityIcons).map((opt) => {
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
                      placeholder="e.g. Joint account with spouse"
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
                      disabled={!formName || !formValue}
                    >
                      {editingId ? 'Save Changes' : `Add ${dialogType === 'asset' ? 'Asset' : 'Liability'}`}
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
