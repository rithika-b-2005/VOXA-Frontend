"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconFileInvoice,
  IconSearch,
  IconFilter,
  IconPlus,
  IconClock,
  IconCheck,
  IconX,
  IconCurrencyRupee,
  IconDownload,
  IconEye,
  IconChevronRight,
  IconCalendar,
  IconAlertTriangle,
  IconSortAscending,
  IconSortDescending,
  IconRefresh,
  IconFileText,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Invoice {
  id: string
  number: string
  description: string
  amount: number
  gstAmount: number
  totalAmount: number
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "paid"
  submittedDate: Date
  dueDate: Date
  paidDate?: Date
  items: number
  attachments: number
  rejectionReason?: string
  paymentRef?: string
}

const invoices: Invoice[] = [
  {
    id: "1",
    number: "INV-2024-092",
    description: "IT Hardware Supply - Laptops & Accessories",
    amount: 38135,
    gstAmount: 6865,
    totalAmount: 45000,
    status: "submitted",
    submittedDate: new Date(2024, 11, 2),
    dueDate: new Date(2024, 11, 17),
    items: 5,
    attachments: 2,
  },
  {
    id: "2",
    number: "INV-2024-089",
    description: "Monthly Maintenance Services - November",
    amount: 27542,
    gstAmount: 4958,
    totalAmount: 32500,
    status: "approved",
    submittedDate: new Date(2024, 10, 28),
    dueDate: new Date(2024, 11, 13),
    items: 1,
    attachments: 1,
  },
  {
    id: "3",
    number: "INV-2024-085",
    description: "Server Infrastructure Components",
    amount: 66102,
    gstAmount: 11898,
    totalAmount: 78000,
    status: "paid",
    submittedDate: new Date(2024, 10, 15),
    dueDate: new Date(2024, 10, 30),
    paidDate: new Date(2024, 10, 28),
    items: 8,
    attachments: 3,
    paymentRef: "TXN-2024-5847",
  },
  {
    id: "4",
    number: "INV-2024-082",
    description: "Network Cables & Connectors",
    amount: 12712,
    gstAmount: 2288,
    totalAmount: 15000,
    status: "paid",
    submittedDate: new Date(2024, 10, 10),
    dueDate: new Date(2024, 10, 25),
    paidDate: new Date(2024, 10, 22),
    items: 12,
    attachments: 1,
    paymentRef: "TXN-2024-5621",
  },
  {
    id: "5",
    number: "INV-2024-078",
    description: "Software License Renewal - Annual",
    amount: 35593,
    gstAmount: 6407,
    totalAmount: 42000,
    status: "paid",
    submittedDate: new Date(2024, 10, 5),
    dueDate: new Date(2024, 10, 20),
    paidDate: new Date(2024, 10, 15),
    items: 3,
    attachments: 2,
    paymentRef: "TXN-2024-5489",
  },
  {
    id: "6",
    number: "INV-2024-071",
    description: "Printer Supplies & Toner",
    amount: 8475,
    gstAmount: 1525,
    totalAmount: 10000,
    status: "rejected",
    submittedDate: new Date(2024, 9, 28),
    dueDate: new Date(2024, 10, 12),
    items: 6,
    attachments: 1,
    rejectionReason: "Missing purchase order reference. Please resubmit with PO number.",
  },
  {
    id: "7",
    number: "INV-2024-095",
    description: "Consulting Services - Q4 Planning",
    amount: 50847,
    gstAmount: 9153,
    totalAmount: 60000,
    status: "under_review",
    submittedDate: new Date(2024, 11, 4),
    dueDate: new Date(2024, 11, 19),
    items: 1,
    attachments: 4,
  },
]

export default function VendorInvoicesPage() {
  const [filter, setFilter] = React.useState("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [sortBy, setSortBy] = React.useState<"date" | "amount">("date")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc")
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
      case "submitted":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "under_review":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      case "approved":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "rejected":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "paid":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      default:
        return "bg-white/10 text-white border-white/20"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <IconFileText className="h-3 w-3" />
      case "submitted":
        return <IconClock className="h-3 w-3" />
      case "under_review":
        return <IconEye className="h-3 w-3" />
      case "approved":
        return <IconCheck className="h-3 w-3" />
      case "rejected":
        return <IconX className="h-3 w-3" />
      case "paid":
        return <IconCurrencyRupee className="h-3 w-3" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "under_review":
        return "Under Review"
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const filteredInvoices = invoices
    .filter((inv) => {
      if (filter !== "all" && inv.status !== filter) return false
      if (
        searchQuery &&
        !inv.number.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !inv.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "desc"
          ? b.submittedDate.getTime() - a.submittedDate.getTime()
          : a.submittedDate.getTime() - b.submittedDate.getTime()
      } else {
        return sortOrder === "desc"
          ? b.totalAmount - a.totalAmount
          : a.totalAmount - b.totalAmount
      }
    })

  const stats = {
    total: invoices.length,
    pending: invoices.filter((i) => ["submitted", "under_review"].includes(i.status)).length,
    approved: invoices.filter((i) => i.status === "approved").length,
    paid: invoices.filter((i) => i.status === "paid").length,
    rejected: invoices.filter((i) => i.status === "rejected").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Invoices</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage all your submitted invoices
          </p>
        </div>
        <Link href="/vendor/invoices/new">
          <Button className="gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
            <IconPlus className="h-4 w-4" />
            Submit New Invoice
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <button
          onClick={() => setFilter("all")}
          className={`p-3 rounded-xl border transition-all ${
            filter === "all"
              ? "bg-white/10 border-white/30"
              : "bg-white/5 border-white/10 hover:border-white/20"
          }`}
        >
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total Invoices</p>
        </button>
        <button
          onClick={() => setFilter("submitted")}
          className={`p-3 rounded-xl border transition-all ${
            filter === "submitted"
              ? "bg-blue-500/10 border-blue-500/30"
              : "bg-white/5 border-white/10 hover:border-blue-500/20"
          }`}
        >
          <p className="text-2xl font-bold text-blue-400">{stats.pending}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </button>
        <button
          onClick={() => setFilter("approved")}
          className={`p-3 rounded-xl border transition-all ${
            filter === "approved"
              ? "bg-green-500/10 border-green-500/30"
              : "bg-white/5 border-white/10 hover:border-green-500/20"
          }`}
        >
          <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
          <p className="text-xs text-muted-foreground">Approved</p>
        </button>
        <button
          onClick={() => setFilter("paid")}
          className={`p-3 rounded-xl border transition-all ${
            filter === "paid"
              ? "bg-purple-500/10 border-purple-500/30"
              : "bg-white/5 border-white/10 hover:border-purple-500/20"
          }`}
        >
          <p className="text-2xl font-bold text-purple-400">{stats.paid}</p>
          <p className="text-xs text-muted-foreground">Paid</p>
        </button>
        <button
          onClick={() => setFilter("rejected")}
          className={`p-3 rounded-xl border transition-all ${
            filter === "rejected"
              ? "bg-red-500/10 border-red-500/30"
              : "bg-white/5 border-white/10 hover:border-red-500/20"
          }`}
        >
          <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
          <p className="text-xs text-muted-foreground">Rejected</p>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by invoice number or description..."
            className="pl-10 bg-white/5 border-white/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 gap-2"
            onClick={() => {
              setSortOrder(sortOrder === "desc" ? "asc" : "desc")
            }}
          >
            {sortOrder === "desc" ? (
              <IconSortDescending className="h-4 w-4" />
            ) : (
              <IconSortAscending className="h-4 w-4" />
            )}
            {sortBy === "date" ? "Date" : "Amount"}
          </Button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "amount")}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
          >
            <option value="date" className="bg-black">Sort by Date</option>
            <option value="amount" className="bg-black">Sort by Amount</option>
          </select>
        </div>
      </div>

      {/* Invoice List & Detail */}
      <div className="grid grid-cols-12 gap-6">
        {/* Invoice List */}
        <div className="col-span-7 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredInvoices.length} invoice(s)
            </p>
            <Button variant="ghost" size="sm" className="gap-2">
              <IconRefresh className="h-4 w-4" />
              Refresh
            </Button>
          </div>
          <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
            {filteredInvoices.map((invoice) => (
              <div
                key={invoice.id}
                onClick={() => setSelectedInvoice(invoice)}
                className={`p-4 hover:bg-white/5 cursor-pointer transition-all ${
                  selectedInvoice?.id === invoice.id ? "bg-white/5" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{invoice.number}</p>
                      <span
                        className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${getStatusBadge(
                          invoice.status
                        )}`}
                      >
                        {getStatusIcon(invoice.status)}
                        {getStatusLabel(invoice.status)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {invoice.description}
                    </p>
                  </div>
                  <IconChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <IconCalendar className="h-3 w-3" />
                      {invoice.submittedDate.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span>{invoice.items} items</span>
                    <span>{invoice.attachments} files</span>
                  </div>
                  <p className="font-semibold text-white">
                    ₹{invoice.totalAmount.toLocaleString()}
                  </p>
                </div>

                {/* Progress indicator for status */}
                {["submitted", "under_review", "approved"].includes(invoice.status) && (
                  <div className="mt-3 flex items-center gap-1">
                    <div className={`h-1 flex-1 rounded-full ${
                      ["submitted", "under_review", "approved", "paid"].includes(invoice.status)
                        ? "bg-blue-500"
                        : "bg-white/10"
                    }`} />
                    <div className={`h-1 flex-1 rounded-full ${
                      ["under_review", "approved", "paid"].includes(invoice.status)
                        ? "bg-yellow-500"
                        : "bg-white/10"
                    }`} />
                    <div className={`h-1 flex-1 rounded-full ${
                      ["approved", "paid"].includes(invoice.status)
                        ? "bg-green-500"
                        : "bg-white/10"
                    }`} />
                    <div className={`h-1 flex-1 rounded-full ${
                      invoice.status === "paid" ? "bg-purple-500" : "bg-white/10"
                    }`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Invoice Detail */}
        <div className="col-span-5">
          {selectedInvoice ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden h-full flex flex-col">
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{selectedInvoice.number}</h3>
                  <span
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${getStatusBadge(
                      selectedInvoice.status
                    )}`}
                  >
                    {getStatusIcon(selectedInvoice.status)}
                    {getStatusLabel(selectedInvoice.status)}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Description */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{selectedInvoice.description}</p>
                </div>

                {/* Amount Breakdown */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <span className="text-sm">₹{selectedInvoice.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">GST (18%)</span>
                    <span className="text-sm">₹{selectedInvoice.gstAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/10">
                    <span className="font-medium">Total</span>
                    <span className="font-bold">₹{selectedInvoice.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-muted-foreground mb-1">Submitted</p>
                    <p className="text-sm font-medium">
                      {selectedInvoice.submittedDate.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                    <p className="text-sm font-medium">
                      {selectedInvoice.dueDate.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Payment Info */}
                {selectedInvoice.status === "paid" && selectedInvoice.paymentRef && (
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <IconCheck className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-medium text-green-400">Payment Received</span>
                    </div>
                    <div className="text-sm">
                      <p>Reference: {selectedInvoice.paymentRef}</p>
                      <p className="text-muted-foreground">
                        Paid on{" "}
                        {selectedInvoice.paidDate?.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Rejection Reason */}
                {selectedInvoice.status === "rejected" && selectedInvoice.rejectionReason && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <IconAlertTriangle className="h-4 w-4 text-red-400" />
                      <span className="text-sm font-medium text-red-400">Rejection Reason</span>
                    </div>
                    <p className="text-sm">{selectedInvoice.rejectionReason}</p>
                  </div>
                )}

                {/* Status Timeline */}
                <div>
                  <p className="text-xs text-muted-foreground mb-3">Status Timeline</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm">Invoice Submitted</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedInvoice.submittedDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {["under_review", "approved", "paid"].includes(selectedInvoice.status) && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        <div className="flex-1">
                          <p className="text-sm">Under Review</p>
                          <p className="text-xs text-muted-foreground">Processing...</p>
                        </div>
                      </div>
                    )}
                    {["approved", "paid"].includes(selectedInvoice.status) && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <div className="flex-1">
                          <p className="text-sm">Approved</p>
                          <p className="text-xs text-muted-foreground">Ready for payment</p>
                        </div>
                      </div>
                    )}
                    {selectedInvoice.status === "paid" && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <div className="flex-1">
                          <p className="text-sm">Payment Processed</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedInvoice.paidDate?.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedInvoice.status === "rejected" && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <div className="flex-1">
                          <p className="text-sm">Rejected</p>
                          <p className="text-xs text-muted-foreground">Action required</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 border-white/10">
                    <IconEye className="h-4 w-4 mr-2" />
                    View PDF
                  </Button>
                  <Button variant="outline" className="flex-1 border-white/10">
                    <IconDownload className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                {selectedInvoice.status === "rejected" && (
                  <Button className="w-full mt-2 bg-gradient-to-r from-purple-500 to-blue-500">
                    <IconRefresh className="h-4 w-4 mr-2" />
                    Resubmit Invoice
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <IconFileInvoice className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Select an invoice</p>
                <p className="text-sm">Click on an invoice to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
