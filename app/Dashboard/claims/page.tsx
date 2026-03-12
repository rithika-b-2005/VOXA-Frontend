"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  IconReceipt,
  IconUpload,
  IconCheck,
  IconX,
  IconClock,
  IconSparkles,
  IconSearch,
  IconFilter,
  IconPlus,
  IconCamera,
  IconFileText,
  IconCalendar,
  IconCurrencyDollar,
  IconCategory,
  IconUser,
  IconMessage,
  IconChevronRight,
  IconLoader2,
  IconAlertTriangle,
  IconThumbUp,
  IconThumbDown,
  IconEye,
  IconDownload,
  IconSend,
  IconRobot,
} from "@tabler/icons-react"
import { useClaims } from "@/hooks/useApi"
import { claimsApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

interface Claim {
  id: string
  employeeName: string
  employeeAvatar: string
  category: string
  description: string
  amount: number
  currency: string
  date: Date
  receipt: string
  status: "pending" | "ai_reviewed" | "approved" | "rejected" | "paid"
  aiConfidence?: number
  aiNotes?: string
  managerNotes?: string
}

const defaultCategories = [
  "All Categories",
  "Travel",
  "Meals",
  "Software",
  "Office Supplies",
  "Equipment",
  "Training",
  "Other",
]

export default function ClaimsPage() {
  const { user } = useAuth()
  const { data: claimsData, loading, error, refetch } = useClaims()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Transform API data to Claim format
  const claims: Claim[] = React.useMemo(() => {
    if (!claimsData || !Array.isArray(claimsData)) return []
    return (claimsData as any[]).map((claim: any) => {
      const statusMap: Record<string, Claim["status"]> = {
        'DRAFT': 'pending',
        'SUBMITTED': 'ai_reviewed',
        'APPROVED': 'approved',
        'REJECTED': 'rejected',
        'PAID': 'paid'
      }
      return {
        id: claim.id,
        employeeName: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email || 'User',
        employeeAvatar: user?.firstName ? `${user.firstName[0]}${(user.lastName || user.firstName)[0]}`.toUpperCase() : 'U',
        category: "General",
        description: claim.description || claim.title,
        amount: claim.totalAmount,
        currency: "USD",
        date: new Date(claim.createdAt),
        receipt: "",
        status: statusMap[claim.status] || 'pending',
        aiConfidence: claim.status === 'APPROVED' ? 100 : claim.status === 'SUBMITTED' ? 85 : undefined,
        aiNotes: claim.status === 'SUBMITTED' ? 'Claim submitted for review.' : undefined,
      }
    })
  }, [claimsData, user])
  const [selectedClaim, setSelectedClaim] = React.useState<Claim | null>(null)
  const [filter, setFilter] = React.useState("all")
  const [categoryFilter, setCategoryFilter] = React.useState("All Categories")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [showNewClaim, setShowNewClaim] = React.useState(false)
  const [newClaimTitle, setNewClaimTitle] = React.useState("")
  const [newClaimDescription, setNewClaimDescription] = React.useState("")
  const [newClaimAmount, setNewClaimAmount] = React.useState("")
  const [newClaimCategory, setNewClaimCategory] = React.useState("Travel")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      case "ai_reviewed":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      case "approved":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "rejected":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "paid":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      default:
        return "bg-white/10 text-white border-white/20"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <IconClock className="h-3 w-3" />
      case "ai_reviewed":
        return <IconSparkles className="h-3 w-3" />
      case "approved":
        return <IconCheck className="h-3 w-3" />
      case "rejected":
        return <IconX className="h-3 w-3" />
      case "paid":
        return <IconCurrencyDollar className="h-3 w-3" />
      default:
        return null
    }
  }

  const filteredClaims = claims.filter((claim) => {
    if (filter !== "all" && claim.status !== filter) return false
    if (categoryFilter !== "All Categories" && claim.category !== categoryFilter) return false
    if (searchQuery && !claim.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !claim.employeeName.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const handleApprove = async (id: string) => {
    setIsSubmitting(true)
    try {
      await claimsApi.update(id, { status: 'APPROVED' })
      refetch()
    } catch (err) {
      console.error("Failed to approve claim:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async (id: string) => {
    setIsSubmitting(true)
    try {
      await claimsApi.update(id, { status: 'REJECTED' })
      refetch()
    } catch (err) {
      console.error("Failed to reject claim:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateClaim = async () => {
    if (!newClaimTitle || !newClaimAmount) return
    setIsSubmitting(true)
    try {
      const { error } = await claimsApi.create({
        title: newClaimTitle,
        description: newClaimDescription,
        totalAmount: parseFloat(newClaimAmount)
      })
      if (error) {
        console.error("Failed to create claim:", error)
      } else {
        setShowNewClaim(false)
        setNewClaimTitle("")
        setNewClaimDescription("")
        setNewClaimAmount("")
        setNewClaimCategory("Travel")
        refetch()
      }
    } catch (err) {
      console.error("Failed to create claim:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitClaim = async (id: string) => {
    setIsSubmitting(true)
    try {
      await claimsApi.submit(id)
      refetch()
    } catch (err) {
      console.error("Failed to submit claim:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const pendingCount = claims.filter((c) => c.status === "pending" || c.status === "ai_reviewed").length
  const totalAmount = claims
    .filter((c) => c.status === "pending" || c.status === "ai_reviewed")
    .reduce((acc, c) => acc + c.amount, 0)

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen p-6 items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground mt-4">Loading claims...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen p-6 items-center justify-center">
        <p className="text-red-400">Error loading claims: {error}</p>
        <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employee Expense Claims</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered expense validation & approval workflow
          </p>
        </div>
        <Button
          className="gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          onClick={() => setShowNewClaim(true)}
        >
          <IconPlus className="h-4 w-4" />
          Submit Claim
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <IconClock className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pending Review</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <IconSparkles className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">87%</p>
              <p className="text-xs text-muted-foreground">AI Auto-Approved</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <IconCurrencyDollar className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Pending Amount</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <IconReceipt className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{claims.length}</p>
              <p className="text-xs text-muted-foreground">Total Claims</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search claims..."
            className="pl-10 bg-white/5 border-white/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
          {[
            { id: "all", label: "All" },
            { id: "pending", label: "Pending" },
            { id: "ai_reviewed", label: "AI Reviewed" },
            { id: "approved", label: "Approved" },
            { id: "rejected", label: "Rejected" },
            { id: "paid", label: "Paid" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                filter === f.id
                  ? "bg-white/10 text-white"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none"
        >
          {defaultCategories.map((cat) => (
            <option key={cat} value={cat} className="bg-black">
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Claims List & Detail */}
      <div className="flex-1 grid grid-cols-12 gap-6">
        {/* Claims List */}
        <div className="col-span-7 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-semibold">Claims ({filteredClaims.length})</h3>
            <Button variant="ghost" size="sm" className="gap-2">
              <IconFilter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
          <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
            {filteredClaims.map((claim) => (
              <div
                key={claim.id}
                onClick={() => setSelectedClaim(claim)}
                className={`p-4 hover:bg-white/5 cursor-pointer transition-all ${
                  selectedClaim?.id === claim.id ? "bg-white/5" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-medium">
                    {claim.employeeAvatar}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium">{claim.employeeName}</p>
                      <span
                        className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${getStatusBadge(
                          claim.status
                        )}`}
                      >
                        {getStatusIcon(claim.status)}
                        {claim.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {claim.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <IconCategory className="h-3 w-3" />
                        {claim.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <IconCalendar className="h-3 w-3" />
                        {claim.date.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <span className="font-medium text-white">
                        {claim.currency} {claim.amount.toLocaleString()}
                      </span>
                    </div>

                    {/* AI Confidence Bar */}
                    {claim.aiConfidence && (
                      <div className="mt-2 flex items-center gap-2">
                        <IconRobot className="h-3 w-3 text-purple-400" />
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              claim.aiConfidence >= 80
                                ? "bg-green-500"
                                : claim.aiConfidence >= 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${claim.aiConfidence}%` }}
                          />
                        </div>
                        <span className="text-[10px]">{claim.aiConfidence}%</span>
                      </div>
                    )}
                  </div>

                  <IconChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Claim Detail */}
        <div className="col-span-5">
          {selectedClaim ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden h-full flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Claim Details</h3>
                  <span
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${getStatusBadge(
                      selectedClaim.status
                    )}`}
                  >
                    {getStatusIcon(selectedClaim.status)}
                    {selectedClaim.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Employee Info */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-medium">
                    {selectedClaim.employeeAvatar}
                  </div>
                  <div>
                    <p className="font-medium">{selectedClaim.employeeName}</p>
                    <p className="text-sm text-muted-foreground">Employee</p>
                  </div>
                </div>

                {/* Receipt Preview */}
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="aspect-[4/3] bg-white/10 rounded-lg flex items-center justify-center mb-3">
                    <IconFileText className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 border-white/10">
                      <IconEye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 border-white/10">
                      <IconDownload className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-muted-foreground mb-1">Amount</p>
                    <p className="font-semibold">
                      {selectedClaim.currency} {selectedClaim.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-muted-foreground mb-1">Category</p>
                    <p className="font-semibold">{selectedClaim.category}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-muted-foreground mb-1">Date</p>
                    <p className="font-semibold">
                      {selectedClaim.date.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-muted-foreground mb-1">AI Confidence</p>
                    <p className="font-semibold">{selectedClaim.aiConfidence}%</p>
                  </div>
                </div>

                {/* Description */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{selectedClaim.description}</p>
                </div>

                {/* AI Analysis */}
                {selectedClaim.aiNotes && (
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <IconRobot className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-medium text-purple-400">AI Analysis</span>
                    </div>
                    <p className="text-sm">{selectedClaim.aiNotes}</p>
                  </div>
                )}

                {/* Manager Notes */}
                {selectedClaim.managerNotes && (
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <IconMessage className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-400">Manager Notes</span>
                    </div>
                    <p className="text-sm">{selectedClaim.managerNotes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {(selectedClaim.status === "pending" || selectedClaim.status === "ai_reviewed") && (
                <div className="p-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-green-500 hover:bg-green-600"
                      onClick={() => handleApprove(selectedClaim.id)}
                    >
                      <IconThumbUp className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                      onClick={() => handleReject(selectedClaim.id)}
                    >
                      <IconThumbDown className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                  <div className="mt-2">
                    <Input
                      placeholder="Add a note (optional)..."
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <IconReceipt className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Select a claim</p>
                <p className="text-sm">Click on a claim to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Claim Modal - simplified */}
      {showNewClaim && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-black p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Submit New Claim</h3>
              <button onClick={() => setShowNewClaim(false)}>
                <IconX className="h-5 w-5" />
              </button>
            </div>

            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
              <IconUpload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium mb-1">Upload Receipt</p>
              <p className="text-sm text-muted-foreground">
                Drag & drop or click to upload. AI will auto-fill details.
              </p>
              <div className="flex justify-center gap-2 mt-4">
                <Button variant="outline" size="sm" className="border-white/10">
                  <IconUpload className="h-4 w-4 mr-2" />
                  Browse Files
                </Button>
                <Button variant="outline" size="sm" className="border-white/10">
                  <IconCamera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Title</label>
              <Input
                placeholder="Claim title"
                className="mt-1 bg-white/5 border-white/10"
                value={newClaimTitle}
                onChange={(e) => setNewClaimTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground">Category</label>
                <select
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                  value={newClaimCategory}
                  onChange={(e) => setNewClaimCategory(e.target.value)}
                >
                  {defaultCategories.slice(1).map((cat) => (
                    <option key={cat} value={cat} className="bg-black">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Amount</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="mt-1 bg-white/5 border-white/10"
                  value={newClaimAmount}
                  onChange={(e) => setNewClaimAmount(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Description</label>
              <Input
                placeholder="What is this expense for?"
                className="mt-1 bg-white/5 border-white/10"
                value={newClaimDescription}
                onChange={(e) => setNewClaimDescription(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-white/10"
                onClick={() => setShowNewClaim(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500"
                onClick={handleCreateClaim}
                disabled={isSubmitting || !newClaimTitle || !newClaimAmount}
              >
                {isSubmitting ? (
                  <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <IconSend className="h-4 w-4 mr-2" />
                )}
                Submit Claim
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
