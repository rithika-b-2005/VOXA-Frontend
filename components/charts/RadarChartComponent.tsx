"use client"

import * as React from "react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useCategoryBreakdown } from "@/hooks/useApi"
import { IconLoader2 } from "@tabler/icons-react"

const chartConfig = {
  amount: {
    label: "Amount",
    color: "#8b5cf6",
  },
} satisfies ChartConfig

export function RadarChartComponent() {
  const { data, loading, error } = useCategoryBreakdown()

  const chartData = React.useMemo(() => {
    if (!data) return []
    return data.map((cat: any) => ({
      category: cat.name,
      amount: cat.amount,
    }))
  }, [data])

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
      <RadarChart data={chartData}>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <PolarAngleAxis dataKey="category" />
        <PolarGrid radialLines={false} />
        <Radar
          dataKey="amount"
          fill="var(--color-amount)"
          fillOpacity={0.3}
          stroke="var(--color-amount)"
          strokeWidth={2}
        />
      </RadarChart>
    </ChartContainer>
  )
}
