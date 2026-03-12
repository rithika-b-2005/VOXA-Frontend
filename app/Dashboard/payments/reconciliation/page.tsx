"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconArrowLeft,
  IconScale,
  IconCheck,
  IconX,
  IconSparkles,
  IconLink,
  IconUnlink,
  IconRefresh,
  IconFilter,
  IconSearch,
  IconBuildingBank,
  IconArrowRight,
  IconAlertTriangle,
  IconInfoCircle,
  IconUpload,
  IconFileSpreadsheet,
  IconChevronDown,
  IconEye,
  IconLoader2,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface BankTransaction {
  id: string
  date: Date
  description: string
  reference: string
  amount: number
  type: "credit" | "debit"
  status: "matched" | "unmatched" | "suggested"
  matchedInvoiceId?: string
  matchConfidence?: number
}

interface InvoiceRecord {
  id: string
  number: string
  vendor: string
  amount: number
  date: Date
  status: "paid" | "unpaid" | "partial"
  matchedTransactionId?: string
}

const bankTransactions: BankTransaction[] = [
  {
    id: "bt1",
    date: new Date(2024, 10, 28),
    description: "NEFT-TechSupplies Ltd-INV2024085",
    reference: "TXN-2024-5847",
    amount: 78000,
    type: "debit",
    status: "matched",
    matchedInvoiceId: "inv1",
  },
  {
    id: "bt2",
    date: new Date(2024, 10, 25),
    description: "RTGS-ABC Corp-Payment",
    reference: "TXN-2024-5801",
    amount: 125000,
    type: "credit",
    status: "matched",
    matchedInvoiceId: "inv2",
  },
  {
    id: "bt3",
    date: new Date(2024, 10, 22),
    description: "NEFT-Marketing Agency",
    reference: "TXN-2024-5789",
    amount: 45000,
    type: "debit",
    status: "suggested",
    matchedInvoiceId: "inv3",
    matchConfidence: 92,
  },
  {
    id: "bt4",
    date: new Date(2024, 10, 20),
    description: "UPI-AWS Services",
    reference: "TXN-2024-5756",
    amount: 35000,
    type: "debit",
    status: "suggested",
    matchedInvoiceId: "inv4",
    matchConfidence: 88,
  },
  {
    id: "bt5",
    date: new Date(2024, 10, 18),
    description: "NEFT-Unknown Vendor",
    reference: "TXN-2024-5721",
    amount: 28500,
    type: "debit",
    status: "unmatched",
  },
  {
    id: "bt6",
    date: new Date(2024, 10, 15),
    description: "RTGS-Client XYZ Corp",
    reference: "TXN-2024-5698",
    amount: 95000,
    type: "credit",
    status: "unmatched",
  },
  {
    id: "bt7",
    date: new Date(2024, 10, 12),
    description: "Auto-Debit-Internet Provider",
    reference: "TXN-2024-5654",
    amount: 4500,
    type: "debit",
    status: "suggested",
    matchedInvoiceId: "inv5",
    matchConfidence: 95,
  },
]

const invoiceRecords: InvoiceRecord[] = [
  {
    id: "inv1",
    number: "INV-2024-085",
    vendor: "TechSupplies Ltd",
    amount: 78000,
    date: new Date(2024, 10, 15),
    status: "paid",
    matchedTransactionId: "bt1",
  },
  {
    id: "inv2",
    number: "INV-ABC-2024-156",
    vendor: "ABC Corp (Receivable)",
    amount: 125000,
    date: new Date(2024, 10, 20),
    status: "paid",
    matchedTransactionId: "bt2",
  },
  {
    id: "inv3",
    number: "INV-MA-2024-089",
    vendor: "Marketing Agency XYZ",
    amount: 45000,
    date: new Date(2024, 10, 18),
    status: "unpaid",
  },
  {
    id: "inv4",
    number: "INV-AWS-2024-011",
    vendor: "AWS Services",
    amount: 35000,
    date: new Date(2024, 10, 15),
    status: "unpaid",
  },
  {
    id: "inv5",
    number: "INV-ISP-2024-011",
    vendor: "Internet Provider",
    amount: 4500,
    date: new Date(2024, 10, 10),
    status: "unpaid",
  },
  {
    id: "inv6",
    number: "INV-2024-092",
    vendor: "Office Supplies Co",
    amount: 12500,
    date: new Date(2024, 10, 22),
    status: "unpaid",
  },
]

export default function ReconciliationPage() {
  const [filter, setFilter] = React.useState<"all" | "matched" | "unmatched" | "suggested">("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedTransaction, setSelectedTransaction] = React.useState<BankTransaction | null>(null)
  const [isAutoMatching, setIsAutoMatching] = React.useState(false)
  const [transactions, setTransactions] = React.useState(bankTransactions)
  const [invoices, setInvoices] = React.useState(invoiceRecords)

  const filteredTransactions = transactions.filter((txn) => {
    if (filter !== "all" && txn.status !== filter) return false
    if (
      searchQuery &&
      !txn.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !txn.reference.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false
    return true
  })

  const matchedCount = transactions.filter((t) => t.status === "matched").length
  const suggestedCount = transactions.filter((t) => t.status === "suggested").length
  const unmatchedCount = transactions.filter((t) => t.status === "unmatched").length

  const handleAutoMatch = () => {
    setIsAutoMatching(true)
    setTimeout(() => {
      // Simulate auto-matching suggested transactions
      setTransactions((prev) =>
        prev.map((txn) =>
          txn.status === "suggested" ? { ...txn, status: "matched" as const } : txn
        )
      )
      setIsAutoMatching(false)
    }, 2000)
  }

  const handleAcceptMatch = (txnId: string) => {
    setTransactions((prev) =>
      prev.map((txn) =>
        txn.id === txnId ? { ...txn, status: "matched" as const } : txn
      )
    )
  }

  const handleRejectMatch = (txnId: string) => {
    setTransactions((prev) =>
      prev.map((txn) =>
        txn.id === txnId
          ? { ...txn, status: "unmatched" as const, matchedInvoiceId: undefined, matchConfidence: undefined }
          : txn
      )
    )
  }

  const getMatchedInvoice = (invoiceId?: string) => {
    return invoices.find((inv) => inv.id === invoiceId)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/Dashboard/payments">
            <Button variant="ghost" size="icon">
              <IconArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Bank Reconciliation</h1>
            <p className="text-muted-foreground">
              Smart AI-powered transaction matching
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10 gap-2">
            <IconUpload className="h-4 w-4" />
            Import Statement
          </Button>
          <Button
            className="gap-2 bg-gradient-to-r from-purple-500 to-blue-500"
            onClick={handleAutoMatch}
            disabled={isAutoMatching || suggestedCount === 0}
          >
            {isAutoMatching ? (
              <>
                <IconLoader2 className="h-4 w-4 animate-spin" />
                Matching...
              </>
            ) : (
              <>
                <IconSparkles className="h-4 w-4" />
                Auto Match All ({suggestedCount})
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div
          onClick={() => setFilter("all")}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filter === "all"
              ? "bg-white/10 border-white/30"
              : "bg-white/5 border-white/10 hover:border-white/20"
          }`}
        >
          <p className="text-2xl font-bold">{transactions.length}</p>
          <p className="text-sm text-muted-foreground">Total Transactions</p>
        </div>
        <div
          onClick={() => setFilter("matched")}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filter === "matched"
              ? "bg-green-500/10 border-green-500/30"
              : "bg-white/5 border-white/10 hover:border-green-500/20"
          }`}
        >
          <p className="text-2xl font-bold text-green-400">{matchedCount}</p>
          <p className="text-sm text-muted-foreground">Matched</p>
        </div>
        <div
          onClick={() => setFilter("suggested")}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filter === "suggested"
              ? "bg-purple-500/10 border-purple-500/30"
              : "bg-white/5 border-white/10 hover:border-purple-500/20"
          }`}
        >
          <p className="text-2xl font-bold text-purple-400">{suggestedCount}</p>
          <p className="text-sm text-muted-foreground">AI Suggested</p>
        </div>
        <div
          onClick={() => setFilter("unmatched")}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filter === "unmatched"
              ? "bg-yellow-500/10 border-yellow-500/30"
              : "bg-white/5 border-white/10 hover:border-yellow-500/20"
          }`}
        >
          <p className="text-2xl font-bold text-yellow-400">{unmatchedCount}</p>
          <p className="text-sm text-muted-foreground">Unmatched</p>
        </div>
      </div>

      {/* AI Suggestions Banner */}
      {suggestedCount > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <IconSparkles className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="font-medium">AI Found {suggestedCount} Potential Matches</p>
                <p className="text-sm text-muted-foreground">
                  Review and accept suggested matches or let AI auto-match them
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
              onClick={handleAutoMatch}
              disabled={isAutoMatching}
            >
              Accept All Suggestions
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Transaction List */}
        <div className="col-span-7 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconBuildingBank className="h-4 w-4 text-blue-400" />
              <span className="font-semibold">Bank Transactions</span>
            </div>
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 w-56 h-8 bg-white/5 border-white/10 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="divide-y divide-white/10 max-h-[500px] overflow-y-auto">
            {filteredTransactions.map((txn) => {
              const matchedInvoice = getMatchedInvoice(txn.matchedInvoiceId)
              return (
                <div
                  key={txn.id}
                  onClick={() => setSelectedTransaction(txn)}
                  className={`p-4 hover:bg-white/5 cursor-pointer transition-all ${
                    selectedTransaction?.id === txn.id ? "bg-white/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        txn.status === "matched"
                          ? "bg-green-500/10"
                          : txn.status === "suggested"
                          ? "bg-purple-500/10"
                          : "bg-yellow-500/10"
                      }`}
                    >
                      {txn.status === "matched" ? (
                        <IconLink className="h-4 w-4 text-green-400" />
                      ) : txn.status === "suggested" ? (
                        <IconSparkles className="h-4 w-4 text-purple-400" />
                      ) : (
                        <IconUnlink className="h-4 w-4 text-yellow-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm truncate">{txn.description}</p>
                        <p
                          className={`font-semibold ${
                            txn.type === "credit" ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {txn.type === "credit" ? "+" : "-"}₹{txn.amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{txn.date.toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="font-mono">{txn.reference}</span>
                      </div>

                      {/* Match Info */}
                      {txn.status === "matched" && matchedInvoice && (
                        <div className="mt-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                          <div className="flex items-center gap-2">
                            <IconCheck className="h-3 w-3 text-green-400" />
                            <span className="text-xs text-green-400">
                              Matched with {matchedInvoice.number}
                            </span>
                          </div>
                        </div>
                      )}

                      {txn.status === "suggested" && matchedInvoice && (
                        <div className="mt-2 p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <IconSparkles className="h-3 w-3 text-purple-400" />
                              <span className="text-xs text-purple-400">
                                Suggested: {matchedInvoice.number} ({txn.matchConfidence}% match)
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 hover:bg-green-500/20"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAcceptMatch(txn.id)
                                }}
                              >
                                <IconCheck className="h-3 w-3 text-green-400" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 hover:bg-red-500/20"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRejectMatch(txn.id)
                                }}
                              >
                                <IconX className="h-3 w-3 text-red-400" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {txn.status === "unmatched" && (
                        <div className="mt-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                          <div className="flex items-center gap-2">
                            <IconAlertTriangle className="h-3 w-3 text-yellow-400" />
                            <span className="text-xs text-yellow-400">
                              No matching invoice found
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Invoice Matching Panel */}
        <div className="col-span-5 space-y-6">
          {selectedTransaction ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="font-semibold">Match Transaction</h3>
                <p className="text-sm text-muted-foreground">
                  Find matching invoice for this transaction
                </p>
              </div>

              <div className="p-4">
                {/* Selected Transaction */}
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-4">
                  <p className="text-xs text-blue-400 mb-2">Bank Transaction</p>
                  <p className="font-medium text-sm">{selectedTransaction.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {selectedTransaction.date.toLocaleDateString()}
                    </span>
                    <span className="font-semibold">
                      ₹{selectedTransaction.amount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Matching Invoices */}
                <p className="text-sm text-muted-foreground mb-2">Available Invoices</p>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {invoices
                    .filter((inv) => inv.status === "unpaid")
                    .map((inv) => {
                      const amountDiff = Math.abs(inv.amount - selectedTransaction.amount)
                      const isExactMatch = amountDiff === 0
                      const isCloseMatch = amountDiff <= selectedTransaction.amount * 0.05
                      return (
                        <div
                          key={inv.id}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            isExactMatch
                              ? "bg-green-500/10 border-green-500/30"
                              : isCloseMatch
                              ? "bg-yellow-500/10 border-yellow-500/30"
                              : "bg-white/5 border-white/10 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{inv.number}</span>
                            <span className="font-semibold">₹{inv.amount.toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{inv.vendor}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {inv.date.toLocaleDateString()}
                            </span>
                            {isExactMatch && (
                              <span className="text-xs text-green-400 flex items-center gap-1">
                                <IconCheck className="h-3 w-3" />
                                Exact match
                              </span>
                            )}
                            {isCloseMatch && !isExactMatch && (
                              <span className="text-xs text-yellow-400">Close match</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>

              <div className="p-4 border-t border-white/10">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500">
                  <IconLink className="h-4 w-4 mr-2" />
                  Link Selected Invoice
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
              <IconScale className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="font-medium mb-1">Select a Transaction</p>
              <p className="text-sm text-muted-foreground">
                Click on a bank transaction to find matching invoices
              </p>
            </div>
          )}

          {/* Reconciliation Summary */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="font-semibold mb-4">Reconciliation Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Bank Balance</span>
                <span className="font-medium">₹12,45,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Book Balance</span>
                <span className="font-medium">₹12,16,500</span>
              </div>
              <div className="pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Difference</span>
                  <span className="font-bold text-yellow-400">₹28,500</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-start gap-2">
                <IconInfoCircle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  {unmatchedCount} unmatched transactions are causing the difference. Match them to reconcile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
