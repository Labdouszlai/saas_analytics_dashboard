import { cn } from "@/lib/utils"

const STYLES: Record<string, string> = {
  completed: "bg-chart-3/15 text-chart-3",
  active: "bg-chart-3/15 text-chart-3",
  pending: "bg-chart-4/20 text-chart-4",
  refunded: "bg-destructive/15 text-destructive",
  churned: "bg-muted text-muted-foreground",
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        STYLES[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {status}
    </span>
  )
}
