"use client"

import * as React from "react"
import { PolarGrid, RadialBar, RadialBarChart } from "recharts"
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

export function RadialChartComponent() {
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
      <RadialBarChart data={chartData} innerRadius={30} outerRadius={100}>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel nameKey="name" />}
        />
        <PolarGrid gridType="circle" />
        <RadialBar dataKey="amount" />
      </RadialBarChart>
    </ChartContainer>
  )
}
