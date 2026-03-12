"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconCreditCard,
  IconBuildingBank,
  IconArrowUpRight,
  IconArrowDownRight,
  IconClock,
  IconCheck,
  IconAlertTriangle,
  IconPlus,
  IconRefresh,
  IconFilter,
  IconSearch,
  IconCalendar,
  IconChevronRight,
  IconCurrencyRupee,
  IconReceipt,
  IconUsers,
  IconBolt,
  IconTrendingUp,
  IconWallet,
  IconSend,
  IconDownload,
  IconFileInvoice,
  IconReportAnalytics,
  IconScale,
  IconLoader2,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { usePayments, usePaymentStats } from "@/hooks/useApi"
import { paymentsApi } from "@/lib/api"

interface PendingPayment {
  id: string
  type: "vendor" | "salary" | "utility" | "tax" | "subscription"
  payee: string
  description: string
  amount: number
  dueDate: Date
  invoiceNumber?: string
  status: "due" | "overdue" | "scheduled" | "processing"
  priority: "high" | "medium" | "low"
}

interface RecentTransaction {
  id: string
  type: "outgoing" | "incoming"
  payee: string
  description: string
  amount: number
  date: Date
  status: "completed" | "pending" | "failed"
  method: string
  reference: string
}

const pendingPayments: PendingPayment[] = [
  {
    id: "1",
    type: "vendor",
    payee: "TechSupplies Ltd",
    description: "IT Hardware Supply - November",
    amount: 45000,
    dueDate: new Date(2024, 11, 10),
    invoiceNumber: "INV-2024-089",
    status: "due",
    priority: "high",
  },
  {
    id: "2",
    type: "salary",
    payee: "Payroll - December 2024",
    description: "Monthly salary disbursement",
    amount: 480000,
    dueDate: new Date(2024, 11, 1),
    status: "scheduled",
    priority: "high",
  },
  {
    id: "3",
    type: "utility",
    payee: "MSEB Electricity",
    description: "Office electricity bill",
    amount: 12500,
    dueDate: new Date(2024, 11, 5),
    status: "overdue",
    priority: "medium",
  },
  {
    id: "4",
    type: "subscription",
    payee: "AWS Services",
    description: "Cloud hosting - Monthly",
    amount: 35000,
    dueDate: new Date(2024, 11, 15),
    status: "due",
    priority: "medium",
  },
  {
    id: "5",
    type: "vendor",
    payee: "Marketing Agency XYZ",
    description: "Digital marketing services",
    amount: 75000,
    dueDate: new Date(2024, 11, 20),
    invoiceNumber: "INV-MA-2024-156",
    status: "due",
    priority: "low",
  },
  {
    id: "6",
    type: "tax",
    payee: "GST Payment",
    description: "GSTR-3B November",
    amount: 47000,
    dueDate: new Date(2024, 11, 20),
    status: "due",
    priority: "high",
  },
]

const recentTransactions: RecentTransaction[] = [
  {
    id: "1",
    type: "outgoing",
    payee: "CloudServices Inc",
    description: "Software subscription",
    amount: 28000,
    date: new Date(2024, 10, 30),
    status: "completed",
    method: "NEFT",
    reference: "TXN-2024-8847",
  },
  {
    id: "2",
    type: "incoming",
    payee: "Client ABC Corp",
    description: "Invoice payment received",
    amount: 125000,
    date: new Date(2024, 10, 29),
    status: "completed",
    method: "RTGS",
    reference: "TXN-2024-8832",
  },
  {
    id: "3",
    type: "outgoing",
    payee: "Office Rent",
    description: "Monthly rent - November",
    amount: 85000,
    date: new Date(2024, 10, 28),
    status: "completed",
    method: "NEFT",
    reference: "TXN-2024-8801",
  },
  {
    id: "4",
    type: "outgoing",
    payee: "Internet Provider",
    description: "Business broadband",
    amount: 4500,
    date: new Date(2024, 10, 27),
    status: "completed",
    method: "Auto-debit",
    reference: "TXN-2024-8789",
  },
]

const cashFlowData = [
  { month: "Jul", inflow: 850000, outflow: 620000 },
  { month: "Aug", inflow: 920000, outflow: 710000 },
  { month: "Sep", inflow: 780000, outflow: 680000 },
  { month: "Oct", inflow: 1050000, outflow: 820000 },
  { month: "Nov", inflow: 890000, outflow: 750000 },
  { month: "Dec", inflow: 450000, outflow: 694500 },
]

const defaultPaymentsByCategory = [
  { name: "Vendors", value: 320000, color: "#8b5cf6" },
  { name: "Salaries", value: 480000, color: "#3b82f6" },
  { name: "Utilities", value: 45000, color: "#10b981" },
  { name: "Subscriptions", value: 85000, color: "#f59e0b" },
  { name: "Taxes", value: 120000, color: "#ef4444" },
]

export default function PaymentsPage() {
  const { data: paymentsData, loading, error, refetch } = usePayments()
  const { data: statsData } = usePaymentStats()
  const [filter, setFilter] = React.useState("all")
  const [searchQuery, setSearchQuery] = React.useState("")

  // Transform API data to pending payments format
  const pendingPayments: PendingPayment[] = React.useMemo(() => {
    if (!paymentsData || !Array.isArray(paymentsData)) return []
    return (paymentsData as any[])
      .filter((p: any) => p.status === 'PENDING' || p.status === 'PROCESSING')
      .map((payment: any) => ({
        id: payment.id,
        type: "vendor" as const,
        payee: payment.vendor?.name || "Payment",
        description: payment.invoice?.description || `Payment #${payment.reference || payment.id.slice(0, 8)}`,
        amount: payment.amount,
        dueDate: new Date(payment.createdAt),
        invoiceNumber: payment.invoice?.id,
        status: payment.status === 'PENDING' ? 'due' : 'processing',
        priority: payment.amount > 10000 ? 'high' : payment.amount > 1000 ? 'medium' : 'low'
      }))
  }, [paymentsData])

  // Transform API data to recent transactions format
  const recentTransactions: RecentTransaction[] = React.useMemo(() => {
    if (!paymentsData || !Array.isArray(paymentsData)) return []
    return (paymentsData as any[])
      .filter((p: any) => p.status === 'COMPLETED')
      .slice(0, 5)
      .map((payment: any) => ({
        id: payment.id,
        type: "outgoing" as const,
        payee: payment.vendor?.name || "Payment",
        description: `Payment via ${payment.method}`,
        amount: payment.amount,
        date: new Date(payment.paidAt || payment.createdAt),
        status: "completed" as const,
        method: payment.method,
        reference: payment.reference || payment.id.slice(0, 12)
      }))
  }, [paymentsData])

  // Calculate stats from API data
  const stats = statsData as any
  const totalPending = stats?.byStatus?.find((s: any) => s.status === 'PENDING')?._sum?.amount || 0
  const overdueAmount = 0 // Would need due date tracking in backend
  const scheduledAmount = 0 // Would need scheduling feature in backend
  const paymentsByCategory = stats?.byMethod?.map((m: any, index: number) => ({
    name: m.method,
    value: m._sum?.amount || 0,
    color: defaultPaymentsByCategory[index % defaultPaymentsByCategory.length].color
  })) || defaultPaymentsByCategory

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "vendor":
        return IconFileInvoice
      case "salary":
        return IconUsers
      case "utility":
        return IconBolt
      case "tax":
        return IconReceipt
      case "subscription":
        return IconRefresh
      default:
        return IconCreditCard
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "vendor":
        return "bg-purple-500/10 text-purple-400"
      case "salary":
        return "bg-blue-500/10 text-blue-400"
      case "utility":
        return "bg-yellow-500/10 text-yellow-400"
      case "tax":
        return "bg-red-500/10 text-red-400"
      case "subscription":
        return "bg-green-500/10 text-green-400"
      default:
        return "bg-white/10 text-white"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "due":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      case "overdue":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "scheduled":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "processing":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      default:
        return "bg-white/10 text-white border-white/20"
    }
  }

  const filteredPayments = pendingPayments.filter((payment) => {
    if (filter !== "all" && payment.type !== filter) return false
    if (
      searchQuery &&
      !payment.payee.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false
    return true
  })

  const getDaysUntilDue = (date: Date) => {
    const today = new Date()
    const diff = date.getTime() - today.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading payments...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 p-6 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <p className="text-red-400">Error loading payments: {error}</p>
          <Button variant="outline" onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payments & Banking</h1>
          <p className="text-muted-foreground mt-1">
            Manage payments, track cash flow, and reconcile transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/Dashboard/payments/reconciliation">
            <Button variant="outline" className="gap-2 border-white/10">
              <IconScale className="h-4 w-4" />
              Reconciliation
            </Button>
          </Link>
          <Link href="/Dashboard/payments/pay">
            <Button className="gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
              <IconSend className="h-4 w-4" />
              Make Payment
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <IconClock className="h-5 w-5 text-yellow-400" />
            </div>
            <span className="text-xs text-yellow-400">{pendingPayments.length} pending</span>
          </div>
          <p className="text-2xl font-bold">₹{(totalPending / 100000).toFixed(1)}L</p>
          <p className="text-sm text-muted-foreground">Total Pending</p>
        </div>

        <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <IconAlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <span className="text-xs text-red-400">Urgent</span>
          </div>
          <p className="text-2xl font-bold text-red-400">₹{overdueAmount.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Overdue</p>
        </div>

        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <IconCalendar className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold">₹{(scheduledAmount / 100000).toFixed(1)}L</p>
          <p className="text-sm text-muted-foreground">Scheduled</p>
        </div>

        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <IconArrowDownRight className="h-5 w-5 text-green-400" />
            </div>
            <span className="flex items-center gap-1 text-xs text-green-400">
              <IconTrendingUp className="h-3 w-3" />
              +12%
            </span>
          </div>
          <p className="text-2xl font-bold">₹8.9L</p>
          <p className="text-sm text-muted-foreground">This Month Inflow</p>
        </div>

        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <IconArrowUpRight className="h-5 w-5 text-orange-400" />
            </div>
          </div>
          <p className="text-2xl font-bold">₹7.5L</p>
          <p className="text-sm text-muted-foreground">This Month Outflow</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Pending Payments */}
        <div className="col-span-7 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <IconClock className="h-4 w-4 text-yellow-400" />
                Pending Payments
              </h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="pl-9 w-48 h-8 bg-white/5 border-white/10 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="h-8 px-3 bg-white/5 border border-white/10 rounded-lg text-sm"
                >
                  <option value="all" className="bg-black">All Types</option>
                  <option value="vendor" className="bg-black">Vendors</option>
                  <option value="salary" className="bg-black">Salaries</option>
                  <option value="utility" className="bg-black">Utilities</option>
                  <option value="subscription" className="bg-black">Subscriptions</option>
                  <option value="tax" className="bg-black">Taxes</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-white/10 max-h-[400px] overflow-y-auto">
              {filteredPayments.map((payment) => {
                const Icon = getTypeIcon(payment.type)
                const daysUntil = getDaysUntilDue(payment.dueDate)
                return (
                  <div
                    key={payment.id}
                    className="p-4 hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(payment.type)}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">{payment.payee}</p>
                          <p className="font-semibold">₹{payment.amount.toLocaleString()}</p>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {payment.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border ${getStatusBadge(
                              payment.status
                            )}`}
                          >
                            {payment.status}
                          </span>
                          <span
                            className={`text-xs ${
                              daysUntil < 0
                                ? "text-red-400"
                                : daysUntil <= 3
                                ? "text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          >
                            {daysUntil < 0
                              ? `${Math.abs(daysUntil)} days overdue`
                              : daysUntil === 0
                              ? "Due today"
                              : `Due in ${daysUntil} days`}
                          </span>
                          {payment.invoiceNumber && (
                            <span className="text-xs text-muted-foreground">
                              {payment.invoiceNumber}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="shrink-0">
                        Pay Now
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="p-4 border-t border-white/10 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredPayments.length} payments
              </p>
              <Link href="/Dashboard/payments/bills">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <IconChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <IconCreditCard className="h-4 w-4 text-blue-400" />
                Recent Transactions
              </h3>
              <Button variant="ghost" size="sm" className="gap-2">
                <IconDownload className="h-4 w-4" />
                Export
              </Button>
            </div>

            <div className="divide-y divide-white/10">
              {recentTransactions.map((txn) => (
                <div key={txn.id} className="p-4 hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        txn.type === "incoming"
                          ? "bg-green-500/10"
                          : "bg-red-500/10"
                      }`}
                    >
                      {txn.type === "incoming" ? (
                        <IconArrowDownRight className="h-4 w-4 text-green-400" />
                      ) : (
                        <IconArrowUpRight className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{txn.payee}</p>
                        <p
                          className={`font-semibold ${
                            txn.type === "incoming" ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {txn.type === "incoming" ? "+" : "-"}₹{txn.amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{txn.date.toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{txn.method}</span>
                        <span>•</span>
                        <span className="font-mono">{txn.reference}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-5 space-y-6">
          {/* Cash Flow Chart */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Cash Flow</h3>
              <select className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs">
                <option className="bg-black">Last 6 months</option>
                <option className="bg-black">This year</option>
              </select>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={11} />
                  <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(v) => `${v/100000}L`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
                  />
                  <Bar dataKey="inflow" fill="#10b981" radius={[4, 4, 0, 0]} name="Inflow" />
                  <Bar dataKey="outflow" fill="#ef4444" radius={[4, 4, 0, 0]} name="Outflow" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-green-500" /> Inflow
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-red-500" /> Outflow
              </span>
            </div>
          </div>

          {/* Payments by Category */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="font-semibold mb-4">Payments by Category</h3>
            <div className="flex items-center gap-4">
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentsByCategory}
                      innerRadius={35}
                      outerRadius={55}
                      dataKey="value"
                    >
                      {paymentsByCategory.map((entry: { name: string; value: number; color: string }, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {paymentsByCategory.map((cat: { name: string; value: number; color: string }, index: number) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </span>
                    <span className="font-medium">₹{(cat.value / 1000).toFixed(0)}k</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Linked Accounts */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <IconBuildingBank className="h-4 w-4 text-blue-400" />
                Linked Accounts
              </h3>
              <Button variant="ghost" size="sm">
                <IconPlus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <IconBuildingBank className="h-4 w-4 text-blue-400" />
                    <span className="font-medium">HDFC Bank</span>
                  </div>
                  <span className="text-xs text-green-400">Primary</span>
                </div>
                <p className="text-xs text-muted-foreground">Account: ****4521</p>
                <p className="text-lg font-bold mt-2">₹12,45,000</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <IconBuildingBank className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">ICICI Bank</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Account: ****7892</p>
                <p className="text-lg font-bold mt-2">₹3,25,000</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Balance</span>
                <span className="text-xl font-bold">₹15,70,000</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/Dashboard/payments/pay"
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all"
            >
              <IconSend className="h-5 w-5 text-purple-400 mb-2" />
              <p className="text-sm font-medium">Pay Bills</p>
              <p className="text-xs text-muted-foreground">Make payments</p>
            </Link>
            <Link
              href="/Dashboard/payments/schedule"
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all"
            >
              <IconCalendar className="h-5 w-5 text-blue-400 mb-2" />
              <p className="text-sm font-medium">Schedule</p>
              <p className="text-xs text-muted-foreground">Future payments</p>
            </Link>
            <Link
              href="/Dashboard/payments/reconciliation"
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-green-500/30 transition-all"
            >
              <IconScale className="h-5 w-5 text-green-400 mb-2" />
              <p className="text-sm font-medium">Reconcile</p>
              <p className="text-xs text-muted-foreground">Match transactions</p>
            </Link>
            <Link
              href="/Dashboard/payments/insights"
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-orange-500/30 transition-all"
            >
              <IconReportAnalytics className="h-5 w-5 text-orange-400 mb-2" />
              <p className="text-sm font-medium">Insights</p>
              <p className="text-xs text-muted-foreground">Credit & analysis</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
