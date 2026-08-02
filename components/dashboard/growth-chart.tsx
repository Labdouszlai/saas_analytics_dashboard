"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import type { GrowthPoint } from "@/lib/db/queries"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { formatDate, formatNumber } from "@/lib/format"

const config = {
  total: { label: "Customers", color: "var(--chart-2)" },
} satisfies ChartConfig

export function GrowthChart({ data }: { data: GrowthPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer growth</CardTitle>
        <CardDescription>Cumulative customers over the selected range</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-72 w-full">
          <LineChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(v) => formatDate(v, { month: "short", day: "numeric", year: undefined })}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} width={36} allowDecimals={false} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(v) => formatDate(v as string)}
                  formatter={(value) => [formatNumber(Number(value)), " Customers"]}
                />
              }
            />
            <Line
              dataKey="total"
              type="monotone"
              stroke="var(--color-total)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
