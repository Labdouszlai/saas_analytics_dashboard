import { ArrowDownRight, ArrowUpRight, DollarSign, Receipt, Target, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { Kpi } from "@/lib/db/queries"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

function KpiCard({
  label,
  value,
  change,
  icon: Icon,
}: {
  label: string
  value: string
  change: number
  icon: LucideIcon
}) {
  const positive = change >= 0
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-card-foreground">{value}</div>
      <div className="mt-2 flex items-center gap-1 text-xs">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 font-medium",
            positive ? "text-chart-3" : "text-destructive",
          )}
        >
          {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {formatPercent(Math.abs(change))}
        </span>
        <span className="text-muted-foreground">vs. previous period</span>
      </div>
    </Card>
  )
}

export function KpiCards({ kpi }: { kpi: Kpi }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard label="Total Revenue" value={formatCurrency(kpi.totalRevenue)} change={kpi.revenueChange} icon={DollarSign} />
      <KpiCard
        label="Active Customers"
        value={formatNumber(kpi.activeCustomers)}
        change={kpi.customersChange}
        icon={Users}
      />
      <KpiCard
        label="Transactions"
        value={formatNumber(kpi.totalTransactions)}
        change={kpi.transactionsChange}
        icon={Receipt}
      />
      <KpiCard
        label="Conversion Rate"
        value={formatPercent(kpi.conversionRate)}
        change={kpi.conversionChange}
        icon={Target}
      />
    </div>
  )
}
