"use client"

import { Cell, Pie, PieChart } from "recharts"
import type { TrafficSource } from "@/lib/db/queries"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { formatCurrency, formatNumber } from "@/lib/format"

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

const config = {
  revenue: { label: "Revenue" },
} satisfies ChartConfig

export function TrafficSources({ data }: { data: TrafficSource[] }) {
  const total = data.reduce((sum, d) => sum + d.revenue, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic sources</CardTitle>
        <CardDescription>Revenue by acquisition channel</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No data for this range.</p>
        ) : (
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <ChartContainer config={config} className="aspect-square h-44 w-44 shrink-0">
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} nameKey="source" />}
                />
                <Pie data={data} dataKey="revenue" nameKey="source" innerRadius={48} outerRadius={80} paddingAngle={2}>
                  {data.map((entry, i) => (
                    <Cell key={entry.source} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            <ul className="flex-1 space-y-3">
              {data.map((d, i) => (
                <li key={d.source} className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-card-foreground">{d.source}</span>
                  <span className="ml-auto text-sm text-muted-foreground">
                    {total > 0 ? Math.round((d.revenue / total) * 100) : 0}%
                  </span>
                  <span className="w-16 text-right text-sm tabular-nums text-card-foreground">
                    {formatNumber(d.transactions)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
