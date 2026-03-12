"use client"

import * as React from "react"
import {
  IconBrandWhatsapp,
  IconBrandSlack,
  IconBrandTeams,
  IconCheck,
  IconX,
  IconPlug,
  IconPlugOff,
  IconRefresh,
  IconMessageCircle,
  IconBell,
  IconCommand,
  IconTemplate,
  IconActivity,
  IconSettings,
  IconChevronRight,
  IconExternalLink,
  IconShieldCheck,
  IconClock,
} from "@tabler/icons-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

// Platform connection data
const platforms = [
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    icon: IconBrandWhatsapp,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    connected: true,
    phone: "+1 (555) 123-4567",
    lastSync: "2 mins ago",
    features: ["Expense Approvals", "Payment Alerts", "Quick Commands", "Receipt Uploads"],
  },
  {
    id: "slack",
    name: "Slack",
    icon: IconBrandSlack,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    connected: true,
    workspace: "acme-corp.slack.com",
    channel: "#finance-alerts",
    lastSync: "5 mins ago",
    features: ["Expense Approvals", "Report Notifications", "Team Commands", "Bot Integration"],
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    icon: IconBrandTeams,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    connected: false,
    features: ["Expense Approvals", "Meeting Reminders", "Adaptive Cards", "Power Automate"],
  },
]

// Recent activity data
const recentActivity = [
  {
    id: 1,
    platform: "whatsapp",
    type: "approval",
    message: "Approved expense claim #4521 - $234.50",
    user: "John Smith",
    time: "2 mins ago",
    status: "success",
  },
  {
    id: 2,
    platform: "slack",
    type: "notification",
    message: "Payment reminder sent to Vendor ABC Corp",
    user: "System",
    time: "15 mins ago",
    status: "sent",
  },
  {
    id: 3,
    platform: "whatsapp",
    type: "command",
    message: "Quick command: /balance - Checked account balance",
    user: "Sarah Johnson",
    time: "1 hour ago",
    status: "success",
  },
  {
    id: 4,
    platform: "slack",
    type: "approval",
    message: "Rejected expense claim #4518 - Missing receipt",
    user: "Mike Chen",
    time: "2 hours ago",
    status: "rejected",
  },
  {
    id: 5,
    platform: "whatsapp",
    type: "upload",
    message: "Receipt uploaded and processed - Auto-categorized as Travel",
    user: "Emily Davis",
    time: "3 hours ago",
    status: "success",
  },
]

// Pending approvals
const pendingApprovals = [
  {
    id: "EXP-4523",
    type: "expense",
    description: "Client dinner - Tokyo trip",
    amount: 345.00,
    submittedBy: "Alex Turner",
    submittedAt: "Today, 2:30 PM",
    category: "Meals & Entertainment",
    urgency: "high",
  },
  {
    id: "EXP-4524",
    type: "expense",
    description: "Software subscription - Figma",
    amount: 75.00,
    submittedBy: "Jessica Wu",
    submittedAt: "Today, 11:15 AM",
    category: "Software",
    urgency: "medium",
  },
  {
    id: "PAY-1089",
    type: "payment",
    description: "Invoice payment - Design Agency",
    amount: 5400.00,
    submittedBy: "Finance Team",
    submittedAt: "Yesterday",
    category: "Vendor Payment",
    urgency: "high",
  },
  {
    id: "EXP-4525",
    type: "expense",
    description: "Office supplies - Staples",
    amount: 89.99,
    submittedBy: "Tom Wilson",
    submittedAt: "Yesterday",
    category: "Office",
    urgency: "low",
  },
]

// Quick commands
const quickCommands = [
  { command: "/approve [ID]", description: "Approve an expense or payment", example: "/approve EXP-4523" },
  { command: "/reject [ID] [reason]", description: "Reject with reason", example: "/reject EXP-4518 missing receipt" },
  { command: "/balance", description: "Check account balance", example: "/balance" },
  { command: "/pending", description: "List pending approvals", example: "/pending" },
  { command: "/status [ID]", description: "Check expense/payment status", example: "/status EXP-4520" },
  { command: "/report [type]", description: "Generate quick report", example: "/report weekly" },
  { command: "/receipt", description: "Upload receipt (attach image)", example: "/receipt + image" },
  { command: "/help", description: "Show all available commands", example: "/help" },
]

// Notification settings
const notificationSettings = [
  { id: "expense_submitted", label: "New expense submitted", whatsapp: true, slack: true, teams: false },
  { id: "approval_required", label: "Approval required (urgent)", whatsapp: true, slack: true, teams: false },
  { id: "payment_sent", label: "Payment sent confirmation", whatsapp: true, slack: false, teams: false },
  { id: "payment_received", label: "Payment received", whatsapp: true, slack: true, teams: false },
  { id: "compliance_alert", label: "Compliance alerts", whatsapp: true, slack: true, teams: false },
  { id: "weekly_summary", label: "Weekly summary report", whatsapp: false, slack: true, teams: false },
  { id: "budget_warning", label: "Budget threshold warnings", whatsapp: true, slack: true, teams: false },
]

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = React.useState("overview")

  const getPlatformIcon = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId)
    if (!platform) return IconMessageCircle
    return platform.icon
  }

  const getPlatformColor = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId)
    return platform?.color || "text-gray-500"
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Integrations Hub</h1>
          <p className="text-muted-foreground">
            Connect WhatsApp, Slack & Teams for chat-based approvals and notifications
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <IconRefresh className="mr-2 h-4 w-4" />
            Sync All
          </Button>
          <Button size="sm">
            <IconPlug className="mr-2 h-4 w-4" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* Platform Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {platforms.map((platform) => {
          const Icon = platform.icon
          return (
            <Card
              key={platform.id}
              className={`relative overflow-hidden ${platform.bgColor} border ${platform.borderColor}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${platform.bgColor}`}>
                      <Icon className={`h-6 w-6 ${platform.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{platform.name}</CardTitle>
                      {platform.connected ? (
                        <div className="flex items-center gap-1 text-xs text-green-500">
                          <IconCheck className="h-3 w-3" />
                          Connected
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <IconPlugOff className="h-3 w-3" />
                          Not connected
                        </div>
                      )}
                    </div>
                  </div>
                  <Switch checked={platform.connected} />
                </div>
              </CardHeader>
              <CardContent>
                {platform.connected ? (
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      {platform.phone && <p>Phone: {platform.phone}</p>}
                      {platform.workspace && <p>Workspace: {platform.workspace}</p>}
                      {platform.channel && <p>Channel: {platform.channel}</p>}
                      <p className="flex items-center gap-1 mt-1">
                        <IconClock className="h-3 w-3" />
                        Last sync: {platform.lastSync}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {platform.features.slice(0, 3).map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {platform.features.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{platform.features.length - 3}
                        </Badge>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <IconSettings className="mr-2 h-4 w-4" />
                      Configure
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Connect to enable {platform.features.length} features
                    </p>
                    <Button size="sm" className="w-full">
                      <IconPlug className="mr-2 h-4 w-4" />
                      Connect {platform.name}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-black/40 border border-white/10">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white/10">
            <IconActivity className="mr-2 h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="approvals" className="data-[state=active]:bg-white/10">
            <IconShieldCheck className="mr-2 h-4 w-4" />
            Chat Approvals
          </TabsTrigger>
          <TabsTrigger value="commands" className="data-[state=active]:bg-white/10">
            <IconCommand className="mr-2 h-4 w-4" />
            Quick Commands
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-white/10">
            <IconBell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-white/10">
            <IconTemplate className="mr-2 h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Activity Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Actions performed via chat integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const PlatformIcon = getPlatformIcon(activity.platform)
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 rounded-lg border border-white/10 bg-white/5 p-4"
                    >
                      <div className={`rounded-lg p-2 bg-white/10`}>
                        <PlatformIcon className={`h-5 w-5 ${getPlatformColor(activity.platform)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{activity.message}</p>
                          {activity.status === "success" && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              Success
                            </Badge>
                          )}
                          {activity.status === "rejected" && (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                              Rejected
                            </Badge>
                          )}
                          {activity.status === "sent" && (
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              Sent
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          by {activity.user} • {activity.time}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-black/40 border-white/10">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">156</div>
                <p className="text-sm text-muted-foreground">Approvals via Chat</p>
                <p className="text-xs text-green-500 mt-1">+23% this month</p>
              </CardContent>
            </Card>
            <Card className="bg-black/40 border-white/10">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-sm text-muted-foreground">Notifications Sent</p>
                <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
              </CardContent>
            </Card>
            <Card className="bg-black/40 border-white/10">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">89</div>
                <p className="text-sm text-muted-foreground">Quick Commands</p>
                <p className="text-xs text-muted-foreground mt-1">Used this week</p>
              </CardContent>
            </Card>
            <Card className="bg-black/40 border-white/10">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">2.3 min</div>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <p className="text-xs text-green-500 mt-1">-45% faster</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Chat Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending Approvals</CardTitle>
                  <CardDescription>
                    Approve or reject via WhatsApp/Slack - Reply with command or tap buttons
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
                  {pendingApprovals.length} Pending
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingApprovals.map((approval) => (
                  <div
                    key={approval.id}
                    className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {approval.id}
                        </Badge>
                        <Badge
                          className={
                            approval.urgency === "high"
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : approval.urgency === "medium"
                              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          }
                        >
                          {approval.urgency}
                        </Badge>
                        <Badge variant="secondary">{approval.category}</Badge>
                      </div>
                      <p className="font-medium">{approval.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Submitted by {approval.submittedBy} • {approval.submittedAt}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">${approval.amount.toLocaleString()}</p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10">
                          <IconX className="mr-1 h-4 w-4" />
                          Reject
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <IconCheck className="mr-1 h-4 w-4" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Preview */}
              <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <IconBrandWhatsapp className="h-5 w-5 text-green-500" />
                  WhatsApp Approval Preview
                </h4>
                <div className="bg-[#0b141a] rounded-lg p-4 space-y-3">
                  <div className="bg-[#202c33] rounded-lg p-3 max-w-sm">
                    <p className="text-sm text-green-400 font-medium">Voxa Finance Bot</p>
                    <p className="text-sm mt-1">
                      New expense requires approval:
                    </p>
                    <div className="mt-2 text-sm">
                      <p><strong>ID:</strong> EXP-4523</p>
                      <p><strong>Amount:</strong> $345.00</p>
                      <p><strong>From:</strong> Alex Turner</p>
                      <p><strong>Category:</strong> Meals & Entertainment</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Reply <code className="bg-black/30 px-1 rounded">/approve EXP-4523</code> or <code className="bg-black/30 px-1 rounded">/reject EXP-4523 [reason]</code>
                    </p>
                  </div>
                  <div className="bg-[#005c4b] rounded-lg p-3 max-w-xs ml-auto">
                    <p className="text-sm">/approve EXP-4523</p>
                  </div>
                  <div className="bg-[#202c33] rounded-lg p-3 max-w-sm">
                    <p className="text-sm">Expense EXP-4523 has been approved. Alex Turner has been notified.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quick Commands Tab */}
        <TabsContent value="commands" className="space-y-4">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle>Quick Commands Reference</CardTitle>
              <CardDescription>
                Use these commands in WhatsApp or Slack to manage expenses and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {quickCommands.map((cmd) => (
                  <div
                    key={cmd.command}
                    className="rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <code className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-sm font-mono">
                        {cmd.command}
                      </code>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{cmd.description}</p>
                    <p className="text-xs">
                      <span className="text-muted-foreground">Example:</span>{" "}
                      <code className="bg-white/10 px-1 rounded">{cmd.example}</code>
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="my-6 bg-white/10" />

              <div className="space-y-4">
                <h4 className="font-medium">Natural Language Commands</h4>
                <p className="text-sm text-muted-foreground">
                  Voxa AI understands natural language. Try these conversational commands:
                </p>
                <div className="grid gap-2 md:grid-cols-2">
                  {[
                    "Approve the expense from Alex",
                    "What's my current balance?",
                    "Show me pending approvals",
                    "Reject expense 4518, receipt is missing",
                    "Send me the weekly expense report",
                    "Who submitted the most expenses this month?",
                  ].map((example, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <IconMessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">"{example}"</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose which notifications to receive on each platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b border-white/10">
                  <div>Notification Type</div>
                  <div className="flex items-center gap-2">
                    <IconBrandWhatsapp className="h-4 w-4 text-green-500" />
                    WhatsApp
                  </div>
                  <div className="flex items-center gap-2">
                    <IconBrandSlack className="h-4 w-4 text-purple-500" />
                    Slack
                  </div>
                  <div className="flex items-center gap-2">
                    <IconBrandTeams className="h-4 w-4 text-blue-500" />
                    Teams
                  </div>
                </div>
                {notificationSettings.map((setting) => (
                  <div key={setting.id} className="grid grid-cols-4 gap-4 items-center py-2">
                    <Label className="text-sm">{setting.label}</Label>
                    <div className="flex justify-center">
                      <Switch defaultChecked={setting.whatsapp} />
                    </div>
                    <div className="flex justify-center">
                      <Switch defaultChecked={setting.slack} />
                    </div>
                    <div className="flex justify-center">
                      <Switch defaultChecked={setting.teams} disabled />
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6 bg-white/10" />

              <div className="space-y-4">
                <h4 className="font-medium">Quiet Hours</h4>
                <p className="text-sm text-muted-foreground">
                  Pause non-urgent notifications during specified hours
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <Label>Enable quiet hours</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="time" defaultValue="22:00" className="w-32 bg-white/5 border-white/10" />
                    <span className="text-muted-foreground">to</span>
                    <Input type="time" defaultValue="08:00" className="w-32 bg-white/5 border-white/10" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Message Templates</CardTitle>
                  <CardDescription>
                    Customize notification messages sent via chat platforms
                  </CardDescription>
                </div>
                <Button size="sm">
                  <IconTemplate className="mr-2 h-4 w-4" />
                  New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Expense Approval Request",
                    description: "Sent when a new expense needs approval",
                    lastModified: "2 days ago",
                    active: true,
                  },
                  {
                    name: "Payment Confirmation",
                    description: "Sent after a payment is processed",
                    lastModified: "1 week ago",
                    active: true,
                  },
                  {
                    name: "Weekly Summary",
                    description: "Weekly expense and budget summary",
                    lastModified: "3 days ago",
                    active: true,
                  },
                  {
                    name: "Compliance Alert",
                    description: "Urgent compliance and deadline notifications",
                    lastModified: "2 weeks ago",
                    active: true,
                  },
                  {
                    name: "Budget Warning",
                    description: "Alert when budget threshold is reached",
                    lastModified: "1 month ago",
                    active: false,
                  },
                ].map((template) => (
                  <div
                    key={template.name}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg p-2 bg-white/10">
                        <IconTemplate className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{template.name}</p>
                          {template.active ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last modified: {template.lastModified}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <IconChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
