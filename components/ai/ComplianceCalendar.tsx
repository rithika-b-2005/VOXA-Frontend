"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  IconCalendarEvent,
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconFileText,
  IconShieldCheck,
  IconBell,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconRefresh,
  IconExternalLink,
  IconFileInvoice,
  IconReceipt,
  IconUsers,
  IconBuildingBank,
  IconCertificate,
  IconGavel,
} from "@tabler/icons-react"

interface ComplianceEvent {
  id: number
  title: string
  type: "gst" | "tds" | "pf" | "esi" | "audit" | "filing" | "payment"
  dueDate: Date
  status: "completed" | "pending" | "overdue" | "upcoming"
  description: string
  amount?: number
  portal?: string
  autoFile?: boolean
}

const complianceEvents: ComplianceEvent[] = [
  {
    id: 1,
    title: "GSTR-1 Filing",
    type: "gst",
    dueDate: new Date(2024, 11, 11),
    status: "upcoming",
    description: "Monthly GST return for outward supplies",
    portal: "GST Portal",
    autoFile: true,
  },
  {
    id: 2,
    title: "GSTR-3B Filing",
    type: "gst",
    dueDate: new Date(2024, 11, 20),
    status: "upcoming",
    description: "Monthly summary return and tax payment",
    amount: 47000,
    portal: "GST Portal",
    autoFile: true,
  },
  {
    id: 3,
    title: "TDS Payment",
    type: "tds",
    dueDate: new Date(2024, 11, 7),
    status: "completed",
    description: "Monthly TDS deposit for November",
    amount: 25000,
    portal: "Income Tax Portal",
  },
  {
    id: 4,
    title: "PF Contribution",
    type: "pf",
    dueDate: new Date(2024, 11, 15),
    status: "pending",
    description: "Employee and employer PF contribution",
    amount: 48000,
    portal: "EPFO Portal",
  },
  {
    id: 5,
    title: "ESI Payment",
    type: "esi",
    dueDate: new Date(2024, 11, 15),
    status: "pending",
    description: "Employee State Insurance contribution",
    amount: 12000,
    portal: "ESIC Portal",
  },
  {
    id: 6,
    title: "Advance Tax - Q3",
    type: "payment",
    dueDate: new Date(2024, 11, 15),
    status: "upcoming",
    description: "Third installment of advance tax",
    amount: 150000,
    portal: "Income Tax Portal",
  },
  {
    id: 7,
    title: "GST Annual Return",
    type: "filing",
    dueDate: new Date(2024, 11, 31),
    status: "upcoming",
    description: "Annual GST return (GSTR-9)",
    portal: "GST Portal",
  },
]

const jurisdictions = [
  { id: "in", name: "India", flag: "🇮🇳", taxes: ["GST", "TDS", "PF", "ESI"] },
  { id: "us", name: "USA", flag: "🇺🇸", taxes: ["Sales Tax", "Payroll Tax"] },
  { id: "uk", name: "UK", flag: "🇬🇧", taxes: ["VAT", "PAYE", "NI"] },
  { id: "sg", name: "Singapore", flag: "🇸🇬", taxes: ["GST", "CPF"] },
]

export function ComplianceCalendar() {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null)
  const [selectedJurisdiction, setSelectedJurisdiction] = React.useState("in")

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    return { daysInMonth, startingDay }
  }

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth)

  const getEventsForDate = (day: number) => {
    return complianceEvents.filter((event) => {
      const eventDate = event.dueDate
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentMonth.getMonth() &&
        eventDate.getFullYear() === currentMonth.getFullYear()
      )
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400"
      case "pending":
        return "text-yellow-400"
      case "overdue":
        return "text-red-400"
      default:
        return "text-blue-400"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "gst":
        return IconReceipt
      case "tds":
        return IconFileInvoice
      case "pf":
      case "esi":
        return IconUsers
      case "audit":
        return IconGavel
      case "filing":
        return IconFileText
      default:
        return IconBuildingBank
    }
  }

  const upcomingEvents = complianceEvents
    .filter((e) => e.status !== "completed")
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 5)

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  return (
    <div className="flex-1 flex rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      {/* Left Panel - Calendar */}
      <div className="w-3/5 flex flex-col border-r border-white/10">
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-orange-500/10 to-amber-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500">
                <IconShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Compliance Calendar</h3>
                <p className="text-xs text-muted-foreground">
                  AI-powered deadline tracking & reminders
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedJurisdiction}
                onChange={(e) => setSelectedJurisdiction(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-500/50"
              >
                {jurisdictions.map((j) => (
                  <option key={j.id} value={j.id} className="bg-black">
                    {j.flag} {j.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))
              }
            >
              <IconChevronLeft className="h-4 w-4" />
            </Button>
            <h4 className="font-semibold">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h4>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))
              }
            >
              <IconChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 p-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the first of the month */}
            {[...Array(startingDay)].map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Days of the month */}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1
              const events = getEventsForDate(day)
              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === currentMonth.getMonth() &&
                new Date().getFullYear() === currentMonth.getFullYear()
              const isSelected =
                selectedDate?.getDate() === day &&
                selectedDate?.getMonth() === currentMonth.getMonth()

              return (
                <button
                  key={day}
                  onClick={() =>
                    setSelectedDate(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth(),
                        day
                      )
                    )
                  }
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all ${
                    isToday
                      ? "bg-orange-500/20 border border-orange-500/50"
                      : isSelected
                      ? "bg-white/10 border border-white/30"
                      : "hover:bg-white/5"
                  }`}
                >
                  <span
                    className={`text-sm ${
                      isToday ? "font-bold text-orange-400" : ""
                    }`}
                  >
                    {day}
                  </span>
                  {events.length > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {events.slice(0, 3).map((event) => (
                        <span
                          key={event.id}
                          className={`w-1.5 h-1.5 rounded-full ${
                            event.status === "completed"
                              ? "bg-green-500"
                              : event.status === "overdue"
                              ? "bg-red-500"
                              : event.status === "pending"
                              ? "bg-yellow-500"
                              : "bg-blue-500"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="p-4 border-t border-white/10 flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Completed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            Pending
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Overdue
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Upcoming
          </span>
        </div>
      </div>

      {/* Right Panel - Upcoming Events & Details */}
      <div className="w-2/5 flex flex-col">
        {/* Upcoming Deadlines */}
        <div className="p-4 border-b border-white/10">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <IconClock className="h-4 w-4 text-orange-400" />
            Upcoming Deadlines
          </h4>
          <div className="space-y-2">
            {upcomingEvents.map((event) => {
              const Icon = getTypeIcon(event.type)
              const daysUntil = Math.ceil(
                (event.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              )

              return (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-all cursor-pointer"
                >
                  <div
                    className={`p-2 rounded-lg ${
                      daysUntil <= 3
                        ? "bg-red-500/10"
                        : daysUntil <= 7
                        ? "bg-yellow-500/10"
                        : "bg-blue-500/10"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        daysUntil <= 3
                          ? "text-red-400"
                          : daysUntil <= 7
                          ? "text-yellow-400"
                          : "text-blue-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.dueDate.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                      {event.amount && ` • ₹${event.amount.toLocaleString()}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs ${
                        daysUntil <= 3
                          ? "text-red-400"
                          : daysUntil <= 7
                          ? "text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {daysUntil} days
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-white/10">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <IconFileText className="h-4 w-4 text-green-400" />
            One-Click Filing
          </h4>
          <div className="space-y-2">
            <Button className="w-full justify-between bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
              <span className="flex items-center gap-2">
                <IconReceipt className="h-4 w-4" />
                File GSTR-1 (Dec)
              </span>
              <IconExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between border-white/10"
            >
              <span className="flex items-center gap-2">
                <IconUsers className="h-4 w-4" />
                Submit PF Returns
              </span>
              <IconExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Auto-Filing Status */}
        <div className="p-4 flex-1">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <IconRefresh className="h-4 w-4 text-purple-400" />
            Auto-Filing Status
          </h4>
          <div className="space-y-3">
            {complianceEvents
              .filter((e) => e.autoFile)
              .map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/5"
                >
                  <span className="text-sm">{event.title}</span>
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <IconCheck className="h-3 w-3" />
                    Enabled
                  </span>
                </div>
              ))}
          </div>

          {/* AI Reminders */}
          <div className="mt-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-start gap-2">
              <IconBell className="h-4 w-4 text-purple-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-purple-400">AI Reminders Active</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You'll receive WhatsApp/Email reminders 7, 3, and 1 day before each deadline.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
