"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
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

interface LineChartComponentProps {
  days?: number
}

export function LineChartComponent({ days = 30 }: LineChartComponentProps) {
  const [activeChart, setActiveChart] = React.useState<"income" | "expense">("income")
  const { data, loading, error } = useSpendingTrend(days)

  const total = React.useMemo(
    () => ({
      income: data?.reduce((acc: number, curr: any) => acc + curr.income, 0) || 0,
      expense: data?.reduce((acc: number, curr: any) => acc + curr.expense, 0) || 0,
    }),
    [data]
  )

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
    <div>
      <div className="flex border-b border-white/10 mb-4">
        {(["income", "expense"] as const).map((key) => (
          <button
            key={key}
            data-active={activeChart === key}
            className="data-[active=true]:bg-white/5 flex flex-1 flex-col justify-center gap-1 px-6 py-3 text-left border-r border-white/10 last:border-r-0"
            onClick={() => setActiveChart(key)}
          >
            <span className="text-muted-foreground text-xs">
              {chartConfig[key].label}
            </span>
            <span className="text-lg leading-none font-bold sm:text-2xl">
              ${total[key].toLocaleString()}
            </span>
          </button>
            ))}
      </div>
      <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
        <LineChart
          accessibilityLayer
          data={data}
          margin={{ left: 12, right: 12 }}
        >
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
            content={
              <ChartTooltipContent
                className="w-[150px]"
                labelFormatter={(value) => {
                  return new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                }}
              />
            }
          />
          <Line
            dataKey={activeChart}
            type="monotone"
            stroke={`var(--color-${activeChart})`}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  )
}
