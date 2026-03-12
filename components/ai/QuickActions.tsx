"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  IconFileInvoice,
  IconReceipt,
  IconCreditCard,
  IconUsers,
  IconReportAnalytics,
  IconShieldCheck,
  IconUpload,
  IconBolt,
  IconPlus,
  IconArrowRight,
} from "@tabler/icons-react"

interface QuickActionsProps {
  onAction: (command: string) => void
}

const quickActions = [
  {
    id: "invoice",
    title: "Create Invoice",
    description: "Generate GST invoice",
    icon: IconFileInvoice,
    command: "Generate a new GST invoice",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "expense",
    title: "Add Expense",
    description: "Log a new expense",
    icon: IconReceipt,
    command: "Add a new expense entry",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "payment",
    title: "Make Payment",
    description: "Pay vendor bills",
    icon: IconCreditCard,
    command: "Show pending vendor payments",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "payroll",
    title: "Run Payroll",
    description: "Process salaries",
    icon: IconUsers,
    command: "Generate payroll for this month",
    color: "from-orange-500 to-amber-500",
  },
  {
    id: "report",
    title: "Generate Report",
    description: "Financial reports",
    icon: IconReportAnalytics,
    command: "Generate monthly financial report",
    color: "from-teal-500 to-cyan-500",
  },
  {
    id: "compliance",
    title: "File Returns",
    description: "GST/TDS filing",
    icon: IconShieldCheck,
    command: "Check GST compliance status and prepare filing",
    color: "from-red-500 to-rose-500",
  },
]

export function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <IconBolt className="h-4 w-4 text-yellow-400" />
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(action.command)}
            className="flex flex-col items-start p-3 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-white/10 transition-all text-left group"
          >
            <div
              className={`p-2 rounded-lg bg-gradient-to-r ${action.color} mb-2 group-hover:scale-110 transition-transform`}
            >
              <action.icon className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm font-medium">{action.title}</p>
            <p className="text-[10px] text-muted-foreground">
              {action.description}
            </p>
          </button>
        ))}
      </div>

      {/* Voice shortcut hint */}
      <div className="mt-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
        <p className="text-xs text-purple-400 flex items-center gap-2">
          <IconBolt className="h-3 w-3" />
          <span>
            Tip: Say "Hey Voxa, [action]" to execute any action by voice
          </span>
        </p>
      </div>
    </div>
  )
}
