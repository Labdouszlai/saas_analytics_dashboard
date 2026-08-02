import { Suspense } from "react"
import {
  getCustomerGrowth,
  getDashboardKpis,
  getRecentTransactions,
  getRevenueOverTime,
  getTrafficSources,
  parseRange,
} from "@/lib/db/queries"
import { PageHeader } from "@/components/layout/page-header"
import { DateRangeFilter } from "@/components/dashboard/date-range-filter"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { GrowthChart } from "@/components/dashboard/growth-chart"
import { TrafficSources } from "@/components/dashboard/traffic-sources"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = "force-dynamic"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const range = parseRange((await searchParams).range)

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader title="Dashboard" description="A snapshot of your business performance.">
        <DateRangeFilter />
      </PageHeader>

      <Suspense key={`kpi-${range}`} fallback={<KpiSkeleton />}>
        <KpiSection range={range} />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense key={`rev-${range}`} fallback={<ChartSkeleton />}>
          <RevenueSection range={range} />
        </Suspense>
        <Suspense key={`growth-${range}`} fallback={<ChartSkeleton />}>
          <GrowthSection range={range} />
        </Suspense>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense key={`txn-${range}`} fallback={<ChartSkeleton />}>
            <TransactionsSection />
          </Suspense>
        </div>
        <Suspense key={`traffic-${range}`} fallback={<ChartSkeleton />}>
          <TrafficSection range={range} />
        </Suspense>
      </div>
    </div>
  )
}

async function KpiSection({ range }: { range: 7 | 30 | 90 }) {
  const kpi = await getDashboardKpis(range)
  return <KpiCards kpi={kpi} />
}

async function RevenueSection({ range }: { range: 7 | 30 | 90 }) {
  const data = await getRevenueOverTime(range)
  return <RevenueChart data={data} />
}

async function GrowthSection({ range }: { range: 7 | 30 | 90 }) {
  const data = await getCustomerGrowth(range)
  return <GrowthChart data={data} />
}

async function TrafficSection({ range }: { range: 7 | 30 | 90 }) {
  const data = await getTrafficSources(range)
  return <TrafficSources data={data} />
}

async function TransactionsSection() {
  const data = await getRecentTransactions(8)
  return <RecentTransactions data={data} />
}

function KpiSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-xl" />
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return <Skeleton className="h-80 w-full rounded-xl" />
}
