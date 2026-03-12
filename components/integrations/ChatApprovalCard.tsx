"use client"

import * as React from "react"
import {
  IconCheck,
  IconX,
  IconBrandWhatsapp,
  IconBrandSlack,
  IconBrandTeams,
  IconSend,
  IconMessageCircle,
} from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface ApprovalItem {
  id: string
  type: "expense" | "payment" | "invoice"
  description: string
  amount: number
  submittedBy: string
  submittedAt: string
  category: string
  urgency: "high" | "medium" | "low"
  receipt?: string
}

interface ChatApprovalCardProps {
  item: ApprovalItem
  onApprove?: (id: string, comment?: string) => void
  onReject?: (id: string, reason: string) => void
  platform?: "whatsapp" | "slack" | "teams"
}

export function ChatApprovalCard({
  item,
  onApprove,
  onReject,
  platform = "whatsapp"
}: ChatApprovalCardProps) {
  const [showRejectInput, setShowRejectInput] = React.useState(false)
  const [rejectReason, setRejectReason] = React.useState("")
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [status, setStatus] = React.useState<"pending" | "approved" | "rejected">("pending")

  const platformIcons = {
    whatsapp: IconBrandWhatsapp,
    slack: IconBrandSlack,
    teams: IconBrandTeams,
  }

  const platformColors = {
    whatsapp: "text-green-500",
    slack: "text-purple-500",
    teams: "text-blue-500",
  }

  const PlatformIcon = platformIcons[platform]
  const platformColor = platformColors[platform]

  const handleApprove = async () => {
    setIsProcessing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    setStatus("approved")
    setIsProcessing(false)
    onApprove?.(item.id)
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) return
    setIsProcessing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    setStatus("rejected")
    setIsProcessing(false)
    onReject?.(item.id, rejectReason)
  }

  const urgencyColors = {
    high: "bg-red-500/20 text-red-400 border-red-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    low: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  }

  if (status !== "pending") {
    return (
      <Card className="bg-black/40 border-white/10">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className={`rounded-full p-3 ${status === "approved" ? "bg-green-500/20" : "bg-red-500/20"}`}>
              {status === "approved" ? (
                <IconCheck className="h-6 w-6 text-green-500" />
              ) : (
                <IconX className="h-6 w-6 text-red-500" />
              )}
            </div>
            <div>
              <p className="font-medium">
                {item.id} has been {status}
              </p>
              <p className="text-sm text-muted-foreground">
                {item.submittedBy} has been notified via {platform}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-black/40 border-white/10 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlatformIcon className={`h-5 w-5 ${platformColor}`} />
            <Badge variant="outline" className="text-xs">
              {item.id}
            </Badge>
            <Badge className={urgencyColors[item.urgency]}>
              {item.urgency}
            </Badge>
          </div>
          <Badge variant="secondary">{item.category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Item Details */}
        <div>
          <p className="font-medium text-lg">{item.description}</p>
          <p className="text-sm text-muted-foreground">
            Submitted by {item.submittedBy} • {item.submittedAt}
          </p>
        </div>

        {/* Amount */}
        <div className="flex items-center justify-between rounded-lg bg-white/5 p-4">
          <span className="text-muted-foreground">Amount</span>
          <span className="text-2xl font-bold">${item.amount.toLocaleString()}</span>
        </div>

        {/* Chat-style command hint */}
        <div className="rounded-lg bg-white/5 border border-white/10 p-3">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <IconMessageCircle className="h-3 w-3" />
            Quick command via {platform}:
          </p>
          <div className="flex gap-2 text-xs font-mono">
            <code className="bg-green-500/20 text-green-400 px-2 py-1 rounded">
              /approve {item.id}
            </code>
            <code className="bg-red-500/20 text-red-400 px-2 py-1 rounded">
              /reject {item.id} [reason]
            </code>
          </div>
        </div>

        {/* Action Buttons */}
        {showRejectInput ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="bg-white/5 border-white/10"
              />
              <Button
                size="sm"
                onClick={handleReject}
                disabled={!rejectReason.trim() || isProcessing}
                className="bg-red-600 hover:bg-red-700"
              >
                <IconSend className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRejectInput(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10"
              onClick={() => setShowRejectInput(true)}
              disabled={isProcessing}
            >
              <IconX className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleApprove}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <IconCheck className="mr-2 h-4 w-4" />
                  Approve
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
