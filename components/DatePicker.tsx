"use client"

import * as React from "react"
import { parseDate } from "chrono-node"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

interface DatePickerProps {
  onDateChange?: (date: Date | undefined) => void
  selectedDate?: Date
}

export function DatePicker({ onDateChange, selectedDate }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")
  // Default to current date if no selectedDate provided
  const [date, setDate] = React.useState<Date | undefined>(selectedDate ?? new Date())
  const [month, setMonth] = React.useState<Date | undefined>(selectedDate ?? new Date())
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    // Set initial value to formatted current date
    if (!value && date) {
      setValue(formatDate(date))
    }
  }, [])

  if (!mounted) {
    return (
      <div className="relative flex gap-2">
        <Input
          id="date"
          value=""
          placeholder="Select date"
          className="bg-white/5 border-white/10 pr-10 w-[200px]"
          readOnly
        />
      </div>
    )
  }

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate)
    setValue(formatDate(newDate))
    setOpen(false)
    onDateChange?.(newDate)
  }

  return (
    <div className="relative flex gap-2">
      <Input
        id="date"
        value={value || formatDate(date)}
        placeholder="Select date"
        className="bg-white/5 border-white/10 pr-10 w-[200px]"
        onChange={(e) => {
          setValue(e.target.value)
          const parsedDate = parseDate(e.target.value)
          if (parsedDate) {
            setDate(parsedDate)
            setMonth(parsedDate)
            onDateChange?.(parsedDate)
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault()
            setOpen(true)
          }
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date-picker"
            variant="ghost"
            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
          >
            <CalendarIcon className="size-3.5" />
            <span className="sr-only">Select date</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="end">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            month={month}
            onMonthChange={setMonth}
            onSelect={handleDateSelect}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
