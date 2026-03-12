"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconFileInvoice,
  IconCreditCard,
  IconClock,
  IconCheck,
  IconAlertTriangle,
  IconTrendingUp,
  IconTrendingDown,
  IconArrowRight,
  IconPlus,
  IconCalendar,
  IconChartBar,
  IconFileText,
  IconBell,
  IconCurrencyRupee,
  IconReceipt,
  IconLoader2,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface Invoice {
  id: string
  number: string
  amount: number
  status: "pending" | "approved" | "paid" | "rejected"
  date: Date
  dueDate: Date
}

interface Payment {
  id: string
  invoiceNumber: string
  amount: number
  date: Date
  method: string
}

const recentInvoices: Invoice[] = [
  {
    id: "1",
    number: "INV-2024-092",
    amount: 45000,
    status: "pending",
    date: new Date(2024, 11, 2),
    dueDate: new Date(2024, 11, 17),
  },
  {
    id: "2",
    number: "INV-2024-089",
    amount: 32500,
    status: "approved",
    date: new Date(2024, 10, 28),
    dueDate: new Date(2024, 11, 13),
  },
  {
    id: "3",
    number: "INV-2024-085",
    amount: 78000,
    status: "paid",
    date: new Date(2024, 10, 15),
    dueDate: new Date(2024, 10, 30),
  },
  {
    id: "4",
    number: "INV-2024-082",
    amount: 15000,
    status: "paid",
    date: new Date(2024, 10, 10),
    dueDate: new Date(2024, 10, 25),
  },
]

const recentPayments: Payment[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-085",
    amount: 78000,
    date: new Date(2024, 10, 28),
    method: "Bank Transfer",
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-082",
    amount: 15000,
    date: new Date(2024, 10, 22),
    method: "Bank Transfer",
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-078",
    amount: 42000,
    date: new Date(2024, 10, 15),
    method: "NEFT",
  },
]

const paymentTrend = [
  { month: "Jul", amount: 125000 },
  { month: "Aug", amount: 185000 },
  { month: "Sep", amount: 145000 },
  { month: "Oct", amount: 220000 },
  { month: "Nov", amount: 135000 },
  { month: "Dec", amount: 77500 },
]

const upcomingDates = [
  { title: "Invoice INV-2024-089 payment due", date: "Dec 13", type: "payment" },
  { title: "Contract renewal", date: "Dec 31", type: "contract" },
  { title: "Quarterly review meeting", date: "Jan 5", type: "meeting" },
]

export default function VendorDashboard() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      case "approved":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "paid":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "rejected":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      default:
        return "bg-white/10 text-white border-white/20"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <IconClock className="h-3 w-3" />
      case "approved":
        return <IconCheck className="h-3 w-3" />
      case "paid":
        return <IconCurrencyRupee className="h-3 w-3" />
      case "rejected":
        return <IconAlertTriangle className="h-3 w-3" />
      default:
        return null
    }
  }

  const totalPending = recentInvoices
    .filter((inv) => inv.status === "pending" || inv.status === "approved")
    .reduce((acc, inv) => acc + inv.amount, 0)

  const totalPaid = recentInvoices
    .filter((inv) => inv.status === "paid")
    .reduce((acc, inv) => acc + inv.amount, 0)

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, TechSupplies!</h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your account with Voxa Expense
          </p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
          <IconPlus className="h-4 w-4" />
          Submit New Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <IconClock className="h-5 w-5 text-yellow-400" />
            </div>
            <span className="flex items-center gap-1 text-xs text-yellow-400">
              <IconTrendingUp className="h-3 w-3" />
              +2 this week
            </span>
          </div>
          <p className="text-2xl font-bold">₹{totalPending.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Pending Payment</p>
        </div>

        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <IconCheck className="h-5 w-5 text-green-400" />
            </div>
            <span className="flex items-center gap-1 text-xs text-green-400">
              <IconTrendingUp className="h-3 w-3" />
              On track
            </span>
          </div>
          <p className="text-2xl font-bold">₹{totalPaid.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Paid This Month</p>
        </div>

        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <IconFileInvoice className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold">12</p>
          <p className="text-sm text-muted-foreground">Total Invoices (2024)</p>
        </div>

        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <IconFileText className="h-5 w-5 text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold">2</p>
          <p className="text-sm text-muted-foreground">Active Contracts</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Payment Trend Chart */}
        <div className="col-span-8 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Payment Trend</h3>
              <p className="text-sm text-muted-foreground">Monthly payments received</p>
            </div>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm">
              <option className="bg-black">Last 6 months</option>
              <option className="bg-black">This year</option>
              <option className="bg-black">All time</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={paymentTrend}>
                <defs>
                  <linearGradient id="paymentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, "Amount"]}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#a855f7"
                  strokeWidth={2}
                  fill="url(#paymentGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Dates */}
        <div className="col-span-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <IconCalendar className="h-4 w-4 text-blue-400" />
              Upcoming
            </h3>
          </div>
          <div className="space-y-3">
            {upcomingDates.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <div
                  className={`p-2 rounded-lg ${
                    item.type === "payment"
                      ? "bg-green-500/10"
                      : item.type === "contract"
                      ? "bg-orange-500/10"
                      : "bg-blue-500/10"
                  }`}
                >
                  {item.type === "payment" ? (
                    <IconCreditCard className={`h-4 w-4 text-green-400`} />
                  ) : item.type === "contract" ? (
                    <IconFileText className={`h-4 w-4 text-orange-400`} />
                  ) : (
                    <IconCalendar className={`h-4 w-4 text-blue-400`} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="col-span-7 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <IconFileInvoice className="h-4 w-4 text-purple-400" />
              Recent Invoices
            </h3>
            <Link
              href="/vendor/invoices"
              className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              View All
              <IconArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-white/10">
            {recentInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="p-4 hover:bg-white/5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5">
                      <IconReceipt className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{invoice.number}</p>
                      <p className="text-xs text-muted-foreground">
                        {invoice.date.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold">₹{invoice.amount.toLocaleString()}</p>
                    <span
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${getStatusBadge(
                        invoice.status
                      )}`}
                    >
                      {getStatusIcon(invoice.status)}
                      {invoice.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="col-span-5 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <IconCreditCard className="h-4 w-4 text-green-400" />
              Recent Payments
            </h3>
            <Link
              href="/vendor/payments"
              className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1"
            >
              View All
              <IconArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-white/10">
            {recentPayments.map((payment) => (
              <div
                key={payment.id}
                className="p-4 hover:bg-white/5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">₹{payment.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {payment.invoiceNumber} • {payment.method}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {payment.date.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4">
        <Link
          href="/vendor/invoices/new"
          className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-purple-500/30 transition-all group"
        >
          <div className="p-3 rounded-xl bg-purple-500/10 w-fit mb-3 group-hover:scale-110 transition-transform">
            <IconPlus className="h-5 w-5 text-purple-400" />
          </div>
          <p className="font-medium">Submit Invoice</p>
          <p className="text-sm text-muted-foreground">Create a new invoice</p>
        </Link>

        <Link
          href="/vendor/invoices"
          className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-500/30 transition-all group"
        >
          <div className="p-3 rounded-xl bg-blue-500/10 w-fit mb-3 group-hover:scale-110 transition-transform">
            <IconFileInvoice className="h-5 w-5 text-blue-400" />
          </div>
          <p className="font-medium">Track Invoices</p>
          <p className="text-sm text-muted-foreground">View invoice status</p>
        </Link>

        <Link
          href="/vendor/payments"
          className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-green-500/30 transition-all group"
        >
          <div className="p-3 rounded-xl bg-green-500/10 w-fit mb-3 group-hover:scale-110 transition-transform">
            <IconCreditCard className="h-5 w-5 text-green-400" />
          </div>
          <p className="font-medium">Payment History</p>
          <p className="text-sm text-muted-foreground">View all payments</p>
        </Link>

        <Link
          href="/vendor/contracts"
          className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-orange-500/30 transition-all group"
        >
          <div className="p-3 rounded-xl bg-orange-500/10 w-fit mb-3 group-hover:scale-110 transition-transform">
            <IconFileText className="h-5 w-5 text-orange-400" />
          </div>
          <p className="font-medium">Contracts</p>
          <p className="text-sm text-muted-foreground">View agreements</p>
        </Link>
      </div>
    </div>
  )
}
