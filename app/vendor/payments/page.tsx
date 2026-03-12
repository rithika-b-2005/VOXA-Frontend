"use client"

import * as React from "react"
import {
  IconCreditCard,
  IconSearch,
  IconDownload,
  IconFilter,
  IconCalendar,
  IconCheck,
  IconClock,
  IconBuildingBank,
  IconReceipt,
  IconArrowDownRight,
  IconFileText,
  IconChevronDown,
  IconCurrencyRupee,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

interface Payment {
  id: string
  transactionRef: string
  invoiceNumber: string
  invoiceDescription: string
  amount: number
  status: "completed" | "processing" | "failed"
  date: Date
  method: "bank_transfer" | "neft" | "rtgs" | "upi"
  bankAccount: string
}

const payments: Payment[] = [
  {
    id: "1",
    transactionRef: "TXN-2024-5847",
    invoiceNumber: "INV-2024-085",
    invoiceDescription: "Server Infrastructure Components",
    amount: 78000,
    status: "completed",
    date: new Date(2024, 10, 28),
    method: "bank_transfer",
    bankAccount: "HDFC ***4521",
  },
  {
    id: "2",
    transactionRef: "TXN-2024-5621",
    invoiceNumber: "INV-2024-082",
    invoiceDescription: "Network Cables & Connectors",
    amount: 15000,
    status: "completed",
    date: new Date(2024, 10, 22),
    method: "neft",
    bankAccount: "HDFC ***4521",
  },
  {
    id: "3",
    transactionRef: "TXN-2024-5489",
    invoiceNumber: "INV-2024-078",
    invoiceDescription: "Software License Renewal",
    amount: 42000,
    status: "completed",
    date: new Date(2024, 10, 15),
    method: "bank_transfer",
    bankAccount: "HDFC ***4521",
  },
  {
    id: "4",
    transactionRef: "TXN-2024-5234",
    invoiceNumber: "INV-2024-065",
    invoiceDescription: "Monthly Maintenance - October",
    amount: 32500,
    status: "completed",
    date: new Date(2024, 9, 28),
    method: "neft",
    bankAccount: "HDFC ***4521",
  },
  {
    id: "5",
    transactionRef: "TXN-2024-4987",
    invoiceNumber: "INV-2024-058",
    invoiceDescription: "Hardware Peripherals",
    amount: 28000,
    status: "completed",
    date: new Date(2024, 9, 15),
    method: "rtgs",
    bankAccount: "HDFC ***4521",
  },
  {
    id: "6",
    transactionRef: "TXN-2024-4756",
    invoiceNumber: "INV-2024-052",
    invoiceDescription: "Cloud Storage Subscription",
    amount: 18500,
    status: "completed",
    date: new Date(2024, 8, 30),
    method: "bank_transfer",
    bankAccount: "HDFC ***4521",
  },
]

const monthlyPayments = [
  { month: "Jul", amount: 125000, count: 4 },
  { month: "Aug", amount: 185000, count: 6 },
  { month: "Sep", amount: 145000, count: 5 },
  { month: "Oct", amount: 220000, count: 7 },
  { month: "Nov", amount: 135000, count: 4 },
  { month: "Dec", amount: 0, count: 0 },
]

export default function VendorPaymentsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [dateRange, setDateRange] = React.useState("all")
  const [selectedPayment, setSelectedPayment] = React.useState<Payment | null>(null)

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "bank_transfer":
        return "Bank Transfer"
      case "neft":
        return "NEFT"
      case "rtgs":
        return "RTGS"
      case "upi":
        return "UPI"
      default:
        return method
    }
  }

  const filteredPayments = payments.filter((payment) => {
    if (
      searchQuery &&
      !payment.transactionRef.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false
    return true
  })

  const totalReceived = payments.reduce((acc, p) => acc + p.amount, 0)
  const thisMonthPayments = payments.filter(
    (p) =>
      p.date.getMonth() === new Date().getMonth() &&
      p.date.getFullYear() === new Date().getFullYear()
  )
  const thisMonthTotal = thisMonthPayments.reduce((acc, p) => acc + p.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payment History</h1>
          <p className="text-muted-foreground mt-1">
            Track all payments received for your invoices
          </p>
        </div>
        <Button variant="outline" className="gap-2 border-white/10">
          <IconDownload className="h-4 w-4" />
          Export Statement
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <IconCurrencyRupee className="h-5 w-5 text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold">₹{totalReceived.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Total Received (2024)</p>
        </div>

        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <IconArrowDownRight className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold">₹{thisMonthTotal.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">This Month</p>
        </div>

        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <IconReceipt className="h-5 w-5 text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold">{payments.length}</p>
          <p className="text-sm text-muted-foreground">Total Transactions</p>
        </div>

        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <IconClock className="h-5 w-5 text-yellow-400" />
            </div>
          </div>
          <p className="text-2xl font-bold">₹77,500</p>
          <p className="text-sm text-muted-foreground">Pending Payment</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-12 gap-6">
        {/* Payment Trend */}
        <div className="col-span-8 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Payment Trend</h3>
              <p className="text-sm text-muted-foreground">Monthly payment breakdown</p>
            </div>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm">
              <option className="bg-black">2024</option>
              <option className="bg-black">2023</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyPayments}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [`₹${Number(value ?? 0).toLocaleString()}`, "Amount"]}
                />
                <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bank Account Info */}
        <div className="col-span-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <IconBuildingBank className="h-4 w-4 text-blue-400" />
            Registered Bank Account
          </h3>
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <IconBuildingBank className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="font-medium">HDFC Bank</p>
                <p className="text-sm text-muted-foreground">Savings Account</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Number</span>
                <span className="font-mono">****4521</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IFSC Code</span>
                <span className="font-mono">HDFC0001234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Branch</span>
                <span>Mumbai Main</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2">
              <IconCheck className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-400">Verified Account</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All payments are directly credited to this account
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by transaction ID or invoice number..."
            className="pl-10 bg-white/5 border-white/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all" className="bg-black">All Time</option>
          <option value="month" className="bg-black">This Month</option>
          <option value="quarter" className="bg-black">This Quarter</option>
          <option value="year" className="bg-black">This Year</option>
        </select>
        <Button variant="outline" className="border-white/10 gap-2">
          <IconFilter className="h-4 w-4" />
          More Filters
        </Button>
      </div>

      {/* Payments Table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Transaction</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Invoice</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Method</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-white/5 transition-all">
                  <td className="p-4">
                    <div>
                      <p className="font-mono text-sm">{payment.transactionRef}</p>
                      <p className="text-xs text-muted-foreground">{payment.bankAccount}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-sm font-medium">{payment.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {payment.invoiceDescription}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm">
                      {payment.date.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </td>
                  <td className="p-4">
                    <span className="text-sm px-2 py-1 rounded-full bg-white/5 border border-white/10">
                      {getMethodLabel(payment.method)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 w-fit">
                      <IconCheck className="h-3 w-3" />
                      Completed
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <p className="font-semibold">₹{payment.amount.toLocaleString()}</p>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <IconDownload className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredPayments.length} of {payments.length} transactions
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-white/10" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="border-white/10" disabled>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
