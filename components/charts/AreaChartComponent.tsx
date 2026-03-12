"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useSpendingTrend } from "@/hooks/useApi"
import { IconLoader2 } from "@tabler/icons-react"

const chartConfig = {
  income: {
    label: "Income",
    color: "var(--chart-1)",
  },
  expense: {
    label: "Expense",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

interface AreaChartComponentProps {
  days?: number
}

export function AreaChartComponent({ days = 30 }: AreaChartComponentProps) {
  const { data, loading, error } = useSpendingTrend(days)

  if (loading) {
    return (
      <div className="aspect-auto h-[250px] w-full flex items-center justify-center">
        <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="aspect-auto h-[250px] w-full flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={(value) => {
            const date = new Date(value)
            return date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          }}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(value) => {
                return new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
              indicator="dot"
            />
          }
        />
        <Area
          dataKey="expense"
          type="natural"
          fill="url(#fillExpense)"
          stroke="var(--color-expense)"
          stackId="a"
        />
        <Area
          dataKey="income"
          type="natural"
          fill="url(#fillIncome)"
          stroke="var(--color-income)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  )
}
