"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import type { TrafficSource } from "@/lib/db/queries"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { formatNumber } from "@/lib/format"

const config = {
  transactions: { label: "Transactions", color: "var(--chart-1)" },
} satisfies ChartConfig

export function TrafficBarChart({ data }: { data: TrafficSource[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions by source</CardTitle>
        <CardDescription>Volume of transactions per acquisition channel</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No data for this range.</p>
        ) : (
          <ChartContainer config={config} className="aspect-auto h-72 w-full">
            <BarChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="source" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} width={36} allowDecimals={false} />
              <ChartTooltip
                content={
                  <ChartTooltipContent formatter={(value) => [formatNumber(Number(value)), " Transactions"]} />
                }
              />
              <Bar dataKey="transactions" fill="var(--color-transactions)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
