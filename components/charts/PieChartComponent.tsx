"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useCategoryBreakdown } from "@/hooks/useApi"
import { IconLoader2 } from "@tabler/icons-react"

const defaultColors = [
  "#22c55e", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444",
  "#10b981", "#ec4899", "#6366f1", "#14b8a6", "#f97316"
]

export function PieChartComponent() {
  const { data, loading, error } = useCategoryBreakdown()

  const chartData = React.useMemo(() => {
    if (!data) return []
    return data.map((cat: any, index: number) => ({
      category: cat.name.toLowerCase().replace(/\s+/g, '-'),
      name: cat.name,
      amount: cat.amount,
      fill: cat.color || defaultColors[index % defaultColors.length],
    }))
  }, [data])

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      amount: { label: "Amount" },
    }
    chartData.forEach((cat: any) => {
      config[cat.category] = {
        label: cat.name,
        color: cat.fill,
      }
    })
    return config
  }, [chartData])

  const totalAmount = React.useMemo(() => {
    return chartData.reduce((acc: number, curr: any) => acc + curr.amount, 0)
  }, [chartData])

  if (loading) {
    return (
      <div className="mx-auto aspect-square max-h-[250px] flex items-center justify-center">
        <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="mx-auto aspect-square max-h-[250px] flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    )
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[250px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="amount"
          nameKey="name"
          innerRadius={60}
          strokeWidth={5}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-3xl font-bold"
                    >
                      ${totalAmount.toLocaleString()}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground"
                    >
                      Total
                    </tspan>
                  </text>
                )
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
