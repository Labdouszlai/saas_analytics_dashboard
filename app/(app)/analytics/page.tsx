import { Suspense } from "react"
import { getCustomerGrowth, getRevenueOverTime, getTrafficSources, parseRange } from "@/lib/db/queries"
import { PageHeader } from "@/components/layout/page-header"
import { DateRangeFilter } from "@/components/dashboard/date-range-filter"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { GrowthChart } from "@/components/dashboard/growth-chart"
import { TrafficSources } from "@/components/dashboard/traffic-sources"
import { TrafficBarChart } from "@/components/analytics/traffic-bar-chart"
import { ExportButton } from "@/components/analytics/export-button"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = "force-dynamic"

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const range = parseRange((await searchParams).range)

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader title="Analytics" description="Dig deeper into revenue, growth, and traffic trends.">
        <DateRangeFilter />
        <Suspense>
          <ExportButton />
        </Suspense>
      </PageHeader>

      <Suspense key={`a-rev-${range}`} fallback={<ChartSkeleton />}>
        <RevenueSection range={range} />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense key={`a-growth-${range}`} fallback={<ChartSkeleton />}>
          <GrowthSection range={range} />
        </Suspense>
        <Suspense key={`a-bar-${range}`} fallback={<ChartSkeleton />}>
          <TrafficBarSection range={range} />
        </Suspense>
      </div>

      <Suspense key={`a-pie-${range}`} fallback={<ChartSkeleton />}>
        <TrafficPieSection range={range} />
      </Suspense>
    </div>
  )
}

async function RevenueSection({ range }: { range: 7 | 30 | 90 }) {
  const data = await getRevenueOverTime(range)
  return <RevenueChart data={data} />
}

async function GrowthSection({ range }: { range: 7 | 30 | 90 }) {
  const data = await getCustomerGrowth(range)
  return <GrowthChart data={data} />
}

async function TrafficBarSection({ range }: { range: 7 | 30 | 90 }) {
  const data = await getTrafficSources(range)
  return <TrafficBarChart data={data} />
}

async function TrafficPieSection({ range }: { range: 7 | 30 | 90 }) {
  const data = await getTrafficSources(range)
  return <TrafficSources data={data} />
}

function ChartSkeleton() {
  return <Skeleton className="h-80 w-full rounded-xl" />
}
